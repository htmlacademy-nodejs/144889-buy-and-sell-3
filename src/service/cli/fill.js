'use strict';
const {
  getRandomInt,
  shuffle
} = require(`../../utils`);
const fs = require(`fs`).promises;
const chalk = require(`chalk`);

const {MAX_COMMENTS} = require(`../../constants`);

const DEFAULT_COUNT = 1;
const FILE_NAME = `fill-db.sql`;

const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const FILE_COMMENTS_PATH = `./data/comments.txt`;

const OfferType = {
  OFFER: `offer`,
  SALE: `sale`,
};


const SumRestrict = {
  MIN: 1000,
  MAX: 100000,
};

const PictureRestrict = {
  MIN: 1,
  MAX: 16,
};

const users = [
  {
    email: `ivanov@example.com`,
    passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
    firstName: `Иван`,
    lastName: `Иванов`,
    avatar: `avatar1.jpg`
  },
  {
    email: `petrov@example.com`,
    passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
    firstName: `Пётр`,
    lastName: `Петров`,
    avatar: `avatar2.jpg`
  }
];

const getPictureFileName = (number) => `item${number.toString().padStart(2, 0)}.jpg`;

const readFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const getRandomArrayPart = (arr) => {
  return arr.slice(getRandomInt(0, (arr.length - 1) / 2), getRandomInt((arr.length - 1) / 2, arr.length - 1));
};

const generateComments = (count, offerId, userCount, comments) => (
  Array(count).fill({}).map(() => ({
    userId: getRandomInt(1, userCount),
    offerId,
    text: shuffle(comments)
      .slice(0, getRandomInt(1, 3))
      .join(` `),
  }))
);

const generateOffers = (count, titles, categories, userCount, sentences, comments) => (
  Array(count).fill({}).map((_, index) => ({
    category: getRandomArrayPart(categories),
    comments: generateComments(getRandomInt(2, MAX_COMMENTS), index + 1, userCount, comments),
    description: shuffle(sentences).slice(1, 5).join(` `),
    picture: getPictureFileName(getRandomInt(PictureRestrict.MIN, PictureRestrict.MAX)),
    title: titles[getRandomInt(0, titles.length - 1)],
    type: OfferType[Object.keys(OfferType)[Math.floor(Math.random() * Object.keys(OfferType).length)]],
    sum: getRandomInt(SumRestrict.MIN, SumRestrict.MAX),
    userId: getRandomInt(1, userCount)
  }))
);

module.exports = {
  name: `--fill`,
  async run(args) {
    const data = await Promise.all([readFile(FILE_SENTENCES_PATH), readFile(FILE_TITLES_PATH), readFile(FILE_CATEGORIES_PATH), readFile(FILE_COMMENTS_PATH)]);
    const [sentences, titles, categories, commentSentences] = data;
    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;

    const offers = generateOffers(countOffer, titles, categories, users.length, sentences, commentSentences);
    const comments = offers.flatMap((offer) => offer.comments);
    const offersCategories = [];
    offers.forEach((offer, index) => {
      return offer.category.forEach((category) => (
        offersCategories.push({offerId: index + 1, categoryId: categories.indexOf(category) + 1})
      ));
    });

    const userValues = users.map(
        ({email, passwordHash, firstName, lastName, avatar}) =>
          `('${email}', '${passwordHash}', '${firstName}', '${lastName}', '${avatar}')`
    ).join(`,\n`);

    const categoryValues = categories.map((name) => `('${name}')`).join(`,\n`);

    const offerValues = offers.map(
        ({title, description, type, sum, picture, userId}) =>
          `('${title}', '${description}', '${type}', ${sum}, '${picture}', ${userId})`
    ).join(`,\n`);

    const offerCategoryValues = offersCategories.map(
        ({offerId, categoryId}) =>
          `(${offerId}, ${categoryId})`
    ).join(`,\n`);

    const commentValues = comments.map(
        ({text, userId, offerId}) =>
          `('${text}', ${userId}, ${offerId})`
    ).join(`,\n`);

    const content = `
/* fills users table */
INSERT INTO users(email, password_hash, first_name, last_name, avatar) VALUES
${userValues};

/* fills categories table */
INSERT INTO categories(name) VALUES
${categoryValues};

/* fills offers table */
ALTER TABLE offers DISABLE TRIGGER ALL;
INSERT INTO offers(title, description, type, sum, picture, user_id) VALUES
${offerValues};
ALTER TABLE offers ENABLE TRIGGER ALL;

/* fills offers_categories table */
ALTER TABLE offers_categories DISABLE TRIGGER ALL;
INSERT INTO offers_categories(offer_id, category_id) VALUES
${offerCategoryValues};
ALTER TABLE offers_categories ENABLE TRIGGER ALL;

/* fills comments table */
ALTER TABLE comments DISABLE TRIGGER ALL;
INSERT INTO comments(text, user_id, offer_id) VALUES
${commentValues};
ALTER TABLE comments ENABLE TRIGGER ALL;`;

    try {
      await fs.writeFile(FILE_NAME, content);
      console.info(chalk.green(`Operation success. File created.`));
    } catch (err) {
      console.error(chalk.red(`Can't write data to file...`));
    }
  }
};

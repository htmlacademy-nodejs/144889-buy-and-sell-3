'use strict';
const {
  getRandomInt,
  shuffle
} = require(`../../utils`);
const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {nanoid} = require(`nanoid`);

const {maxOffersGenerate, MAX_ID_LENGTH, MAX_COMMENTS} = require(`../../constants`);

const DEFAULT_COUNT = 1;
const FILE_NAME = `mocks.json`;

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

const generateComments = (count, comments) => {
  return (
    Array(count).fill({}).map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      text: getRandomArrayPart(shuffle(comments)).join(` `),
    }))
  );
};

const generateOffers = (count, [sentences, titles, categories, comments]) => {
  return (
    Array(count).fill({}).map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      type: Object.keys(OfferType)[Math.floor(Math.random() * Object.keys(OfferType).length)],
      title: titles[getRandomInt(0, titles.length - 1)],
      description: shuffle(sentences).slice(1, 5).join(` `),
      sum: getRandomInt(SumRestrict.MIN, SumRestrict.MAX),
      picture: getPictureFileName(getRandomInt(PictureRestrict.MIN, PictureRestrict.MAX)),
      category: getRandomArrayPart(categories),
      comments: generateComments(getRandomInt(1, MAX_COMMENTS), comments),
    }))
  );
};

module.exports = {
  name: `--generate`,
  async run(args) {
    const data = await Promise.all([readFile(FILE_SENTENCES_PATH), readFile(FILE_TITLES_PATH), readFile(FILE_CATEGORIES_PATH), readFile(FILE_COMMENTS_PATH)]);

    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;
    if (countOffer > maxOffersGenerate) {
      console.error(chalk.red(`You can generate max 1000 offers!`));
      return;
    }
    const content = JSON.stringify(generateOffers(countOffer, data));
    try {
      await fs.writeFile(FILE_NAME, content);
      console.info(chalk.green(`Operation success. File created.`));
    } catch (err) {
      console.error(chalk.red(`Can't write data to file...`));
    }
  }
};

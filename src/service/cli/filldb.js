'use strict';
const {
  getRandomInt,
  shuffle
} = require(`../../utils`);
const fs = require(`fs`).promises;
const chalk = require(`chalk`);

const {MAX_COMMENTS, ExitCode} = require(`../../constants`);
const {getLogger} = require(`../lib/logger`);
const sequelize = require(`../lib/sequelize`);
const initDatabase = require(`../lib/init-db`);

const DEFAULT_COUNT = 1;

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
      text: getRandomArrayPart(shuffle(comments)).join(` `),
    }))
  );
};

const getRandomSubarray = (items) => {
  const tempItems = items.slice();
  let count = getRandomInt(1, tempItems.length - 1);
  const result = [];
  while (count--) {
    result.push(
        ...tempItems.splice(
            getRandomInt(0, tempItems.length - 1), 1
        )
    );
  }
  return result;
};

const generateOffers = (count, [sentences, titles, categories, comments]) => {
  return (
    Array(count).fill({}).map(() => ({
      type: Object.keys(OfferType)[Math.floor(Math.random() * Object.keys(OfferType).length)],
      title: titles[getRandomInt(0, titles.length - 1)],
      description: shuffle(sentences).slice(1, 5).join(` `),
      sum: getRandomInt(SumRestrict.MIN, SumRestrict.MAX),
      picture: getPictureFileName(getRandomInt(PictureRestrict.MIN, PictureRestrict.MAX)),
      categories: getRandomSubarray(categories),
      comments: generateComments(getRandomInt(1, MAX_COMMENTS), comments),
    }))
  );
};

const logger = getLogger();

module.exports = {
  name: `--filldb`,
  async run(args) {
    try {
      logger.info(`Trying to connect to database...`);
      await sequelize.authenticate();
    } catch (err) {
      logger.error(`An error occurred: ${err.message}`);
      process.exit(ExitCode.ERROR);
    }
    logger.info(`The connection to database is established`);

    const data = await Promise.all([readFile(FILE_SENTENCES_PATH), readFile(FILE_TITLES_PATH), readFile(FILE_CATEGORIES_PATH), readFile(FILE_COMMENTS_PATH)]);

    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;

    const offers = generateOffers(countOffer, data);
    const categories = data[2];

    return initDatabase(sequelize, {offers, categories});
  }
};

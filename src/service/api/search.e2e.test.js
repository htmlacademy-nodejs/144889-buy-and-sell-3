'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const search = require(`./search`);
const DataService = require(`../data-service/search`);
const initDB = require(`../lib/init-db`);

const {HttpCode} = require(`../../constants`);
const mockData = require(`./_stubs/search.json`);
const mockCategories = [
  `Книги`,
  `Цветы`,
  `Животные`,
  `Разное`
];

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {categories: mockCategories, offers: mockData});
  search(app, new DataService(mockDB));
});

describe(`Search API - positive cases: returns offer based on search query and`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/search`)
      .query({
        query: `Продам новую приставку`
      });
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`1 offer found`, () => expect(response.body.length).toBe(1));
  test(`Offer has correct title`, () => expect(response.body[0].title).toBe(`Продам новую приставку Sony Playstation 5`));
});

describe(`Search API - negative case: nothing is found and`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/search`)
      .query({
        query: `Продам свою душу`
      });
  });

  test(`API returns code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Body is empty`, () => expect(response.body.length).toBe(0));
});

describe(`Search API - negative case: query string is absent`, () => {
  test(`API returns 400`, () => request(app)
      .get(`/search`)
      .expect(HttpCode.BAD_REQUEST)
  );
});

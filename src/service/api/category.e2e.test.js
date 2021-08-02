'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const category = require(`./category`);
const DataService = require(`../data-service/category`);
const initDB = require(`../lib/init-db`);

const {HttpCode} = require(`../../constants`);
const mockData = require(`./_stubs/category.json`);
const mockCategories = [
  `Животные`,
  `Журналы`,
  `Игры`
];
const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {categories: mockCategories, offers: mockData});
  category(app, new DataService(mockDB));
});

describe(`Category API returns category list`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/categories`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 3 categories`, () => expect(response.body.length).toBe(3));

  test(`Category names are "Журналы", "Игры", "Животные"`,
      () => expect(response.body.map((it) => it.name)).toEqual(
          expect.arrayContaining([`Журналы`, `Игры`, `Животные`])
      )
  );

});

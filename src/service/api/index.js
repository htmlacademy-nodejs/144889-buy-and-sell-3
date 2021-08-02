'use strict';

const {Router} = require(`express`);
const offer = require(`../api/offer`);
const category = require(`../api/category`);
const search = require(`../api/search`);

const sequelize = require(`../lib/sequelize`);
const defineModels = require(`../models`);

const {
  CategoryService,
  SearchService,
  OfferService,
  CommentService,
} = require(`../data-service`);

const app = new Router();

defineModels(sequelize);

(async () => {
  category(app, new CategoryService(sequelize));
  search(app, new SearchService(sequelize));
  offer(app, new OfferService(sequelize), new CommentService(sequelize));
})();

module.exports = app;

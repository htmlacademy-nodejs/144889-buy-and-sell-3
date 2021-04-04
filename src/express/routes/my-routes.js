'use strict';

const api = require(`../api`).getApi();
const {Router} = require(`express`);
const myRoutes = new Router();

myRoutes.get(`/`, async (req, res) => {
  const offers = await api.getOffers();
  res.render(`my-tickets`, {offers});
});

myRoutes.get(`/comments`, async (req, res) => {
  const offers = await api.getOffers();
  res.render(`comments`, {offers: offers.slice(0, 3)});
});

module.exports = myRoutes;

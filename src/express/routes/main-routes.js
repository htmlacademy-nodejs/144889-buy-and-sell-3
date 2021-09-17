'use strict';

const api = require(`../api`).getApi();
const {Router} = require(`express`);
const mainRoutes = new Router();
const OFFERS_PER_PAGE = 8;

mainRoutes.get(`/`, async (req, res) => {
  let {page = 1} = req.query;
  page = +page;
  const limit = OFFERS_PER_PAGE;
  const offset = (page - 1) * OFFERS_PER_PAGE;
  const [
    {count, offers},
    categories
  ] = await Promise.all([
    api.getOffers({offset, limit, comments: true}),
    api.getCategories(true)
  ]);
  const totalPages = Math.ceil(count / OFFERS_PER_PAGE);
  res.render(`index`, {offers, page, totalPages, categories});
});
mainRoutes.get(`/register`, (req, res) => res.render(`sign-up`));
mainRoutes.get(`/login`, (req, res) => res.render(`login`));
mainRoutes.get(`/search`, async (req, res) => {
  try {
    const {search} = req.query;
    const results = await api.search(search);

    res.render(`search-result`, {
      results
    });
  } catch (error) {
    res.render(`search-result`, {
      results: []
    });
  }
});

module.exports = mainRoutes;

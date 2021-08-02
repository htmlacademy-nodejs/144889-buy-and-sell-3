'use strict';

const axios = require(`axios`);

const TIMEOUT = 1000;
const port = process.env.API_PORT || 3000;
const defaultUrl = `http://localhost:${port}/api/`;

class API {

  constructor(baseURL, timeout) {
    this._http = axios.create({
      baseURL,
      timeout
    });
  }

  async _load(url, options) {
    const response = await this._http.request({url, ...options});
    return response.data;
  }

  getOffers({comments}) {
    return this._load(`/offers`, {params: {comments}});
  }

  getOffer(id, comments) {
    return this._load(`/offers/${id}`, {params: {comments}});
  }

  search(query) {
    return this._load(`/search`, {params: {query}});
  }

  getCategories(count) {
    return this._load(`/categories`, {params: {count}});
  }

  createOffer(data) {
    return this._load(`/offers`, {
      method: `POST`,
      data
    });
  }

  async updateOffer(data, id) {
    return this._load(`/offers/${id}`, {
      method: `PUT`,
      data
    });
  }
}

const defaultAPI = new API(defaultUrl, TIMEOUT);

module.exports = {
  API,
  getApi: () => defaultAPI
};

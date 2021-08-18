"use strict";

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const offer = require(`./offer`);
const OfferService = require(`../data-service/offer`);
const CommentService = require(`../data-service/comment`);
const initDB = require(`../lib/init-db`);

const {HttpCode} = require(`../../constants`);
const mockData = require(`./_stubs/offer.json`);
const mockCategories = [
  `Животные`,
  `Посуда`,
  `Марки`,
  `Разное`,
  `Книги`
];

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDB(mockDB, {categories: mockCategories, offers: mockData});
  const app = express();
  app.use(express.json());
  offer(app, new OfferService(mockDB), new CommentService(mockDB));
  return app;
};

describe(`Offer API returns a list of all offers`, () => {

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .get(`/offers`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns a list of 5 offers`, () => expect(response.body.length).toBe(5));

  test(`First offer's title equals "Куплю антиквариат"`, () => expect(response.body[0].title).toBe(`Куплю антиквариат`));

});

describe(`Offer API returns an offer with given id`, () => {

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .get(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Offer's title is "Куплю антиквариат"`, () => expect(response.body.title).toBe(`Куплю антиквариат`));

});

describe(`Offer API creates an offer if data is valid`, () => {

  const newOffer = {
    categories: [1, 2],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500
  };
  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers`)
      .send(newOffer);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Offers count is changed`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(6))
  );

});

describe(`Offer API refuses to create an offer if data is invalid`, () => {

  const newOffer = {
    category: `Котики`,
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500
  };
  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    for (const key of Object.keys(newOffer)) {
      const badOffer = {...newOffer};
      delete badOffer[key];
      await request(app)
        .post(`/offers`)
        .send(badOffer)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

});

describe(`Offer API changes existent offer`, () => {

  const newOffer = {
    categories: [2],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500
  };
  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .put(`/offers/2`)
      .send(newOffer);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Offer is really changed`, () => request(app)
    .get(`/offers/2`)
    .expect((res) => expect(res.body.title).toBe(`Дам погладить котика`))
  );

});

test(`Offer API returns status code 404 when trying to change non-existent offer`, async () => {

  const app = await createAPI();

  const validOffer = {
    categories: [3],
    title: `Это валидный`,
    description: `объект`,
    picture: `объявления`,
    type: `однако`,
    sum: 404
  };

  return request(app)
    .put(`/offers/20`)
    .send(validOffer)
    .expect(HttpCode.NOT_FOUND);
});

test(`Offer API returns status code 400 when trying to change an offer with invalid data`, async () => {

  const app = await createAPI();

  const invalidOffer = {
    categories: [1, 2],
    title: `Это невалидный`,
    description: `объект`,
    picture: `объявления`,
    type: `нет поля sum`
  };

  return request(app)
    .put(`/offers/20`)
    .send(invalidOffer)
    .expect(HttpCode.BAD_REQUEST);
});

describe(`Offer API correctly deletes an offer`, () => {

  let response; let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Offer count is 4 now`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(4))
  );

});

describe(`Offer API refuses to delete non-existent offer`, () => {

  test(`Status code 404`, async () => {

    const app = await createAPI();

    return request(app)
      .delete(`/offers/20`)
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Offer API returns a list of comments to given offer`, () => {

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .get(`/offers/2/comments`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 3 comments`, () => expect(response.body.length).toBe(3));

  test(`First comment's text is "Почему в таком ужасном состоянии?"`, () => expect(response.body[0].text).toBe(`Почему в таком ужасном состоянии?`));
});

describe(`Offer API creates a comment if data is valid`, () => {

  const newValidComment = {
    text: `текст валидного`
  };

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers/3/comments`)
      .send(newValidComment);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Comments count is changed`, () => request(app)
    .get(`/offers/3/comments`)
    .expect((res) => expect(res.body.length).toBe(5))
  );
});

describe(`Offer API refuses to create a comment to non-existent offer`, () => {

  test(`Status code 404`, async () => {

    const app = await createAPI();

    return request(app)
      .post(`/offers/20/comments`)
      .send({
        text: `Неважно`
      })
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Offer API refuses to create a comment when data is invalid`, () => {

  test(`Status code 400`, async () => {

    const app = await createAPI();

    return request(app)
      .post(`/offers/2/comments`)
      .send({
        comment: `Невалидное поле комментария`
      })
      .expect(HttpCode.BAD_REQUEST);
  });
});

describe(`Offer API correctly deletes a comment`, () => {

  let response; let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/1/comments/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Comment count is 2 now`, () => request(app)
    .get(`/offers/1/comments`)
    .expect((res) => expect(res.body.length).toBe(3))
  );
});

describe(`Offer API refuses to delete non-existent comment`, () => {

  test(`Status code 404`, async () => {

    const app = await createAPI();

    return request(app)
      .delete(`/offers/1/comments/20`)
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Offer API refuses to delete a comment to non-existent offer`, () => {

  test(`Status code 404`, async () => {

    const app = await createAPI();

    return request(app)
      .delete(`/offers/100/comments/1`)
      .expect(HttpCode.NOT_FOUND);
  });
});

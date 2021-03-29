"use strict";

const express = require(`express`);
const request = require(`supertest`);

const offer = require(`./offer`);
const OfferService = require(`../data-service/offer`);
const CommentService = require(`../data-service/comment`);

const {HttpCode} = require(`../../constants`);
const mockData = require(`./_stubs/offer.json`);

const createAPI = () => {
  const app = express();
  const cloneData = JSON.parse(JSON.stringify(mockData));
  app.use(express.json());
  offer(app, new OfferService(cloneData), new CommentService());
  return app;
};

describe(`Offer API returns a list of all offers`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/offers`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns a list of 5 offers`, () => expect(response.body.length).toBe(5));

  test(`First offer's id equals "bUAlOA"`, () => expect(response.body[0].id).toBe(`bUAlOA`));

});

describe(`Offer API returns an offer with given id`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/offers/bUAlOA`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Offer's title is "Куплю антиквариат"`, () => expect(response.body.title).toBe(`Куплю антиквариат`));

});

describe(`Offer API creates an offer if data is valid`, () => {

  const newOffer = {
    category: `Котики`,
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500
  };
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/offers`)
      .send(newOffer);
  });


  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));


  test(`Returns offer created`, () => expect(response.body).toEqual(expect.objectContaining(newOffer)));

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
  const app = createAPI();

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
    category: `Котики`,
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500
  };
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/offers/bUAlOA`)
      .send(newOffer);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns changed offer`, () => expect(response.body).toEqual(expect.objectContaining(newOffer)));

  test(`Offer is really changed`, () => request(app)
    .get(`/offers/bUAlOA`)
    .expect((res) => expect(res.body.title).toBe(`Дам погладить котика`))
  );

});

test(`Offer API returns status code 404 when trying to change non-existent offer`, () => {

  const app = createAPI();

  const validOffer = {
    category: `Это`,
    title: `валидный`,
    description: `объект`,
    picture: `объявления`,
    type: `однако`,
    sum: 404
  };

  return request(app)
    .put(`/offers/NOEXST`)
    .send(validOffer)
    .expect(HttpCode.NOT_FOUND);
});

test(`Offer API returns status code 400 when trying to change an offer with invalid data`, () => {

  const app = createAPI();

  const invalidOffer = {
    category: `Это`,
    title: `невалидный`,
    description: `объект`,
    picture: `объявления`,
    type: `нет поля sum`
  };

  return request(app)
    .put(`/offers/NOEXST`)
    .send(invalidOffer)
    .expect(HttpCode.BAD_REQUEST);
});

describe(`Offer API correctly deletes an offer`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/offers/ptkZyI`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns deleted offer`, () => expect(response.body.id).toBe(`ptkZyI`));

  test(`Offer count is 4 now`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(4))
  );

});

describe(`Offer API refuses to delete non-existent offer`, () => {

  test(`Status code 404`, () => {

    const app = createAPI();

    return request(app)
      .delete(`/offers/NOEXST`)
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Offer API returns a list of comments to given offer`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/offers/GxdTgz/comments`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 4 comments`, () => expect(response.body.length).toBe(4));

  test(`First comment's id is "kqME9j"`, () => expect(response.body[0].id).toBe(`kqME9j`));
});

describe(`Offer API creates a comment if data is valid`, () => {

  const newValidComment = {
    text: `текст валидного`
  };

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/offers/GxdTgz/comments`)
      .send(newValidComment);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Returns created comment`, () => expect(response.body).toEqual(expect.objectContaining(newValidComment)));

  test(`Comments count is changed`, () => request(app)
    .get(`/offers/GxdTgz/comments`)
    .expect((res) => expect(res.body.length).toBe(5))
  );
});

describe(`Offer API refuses to create a comment to non-existent offer`, () => {

  test(`Status code 404`, () => {

    const app = createAPI();

    return request(app)
      .post(`/offers/NOEXST/comments`)
      .send({
        text: `Неважно`
      })
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Offer API refuses to create a comment when data is invalid`, () => {

  test(`Status code 400`, () => {

    const app = createAPI();

    return request(app)
      .post(`/offers/lP5Raq/comments`)
      .send({
        comment: `Невалидное поле комментария`
      })
      .expect(HttpCode.BAD_REQUEST);
  });
});

describe(`Offer API correctly deletes a comment`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/offers/lP5Raq/comments/W-zdkL`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns deleted comment`, () => expect(response.body.id).toBe(`W-zdkL`));

  test(`Comment count is 2 now`, () => request(app)
    .get(`/offers/lP5Raq/comments`)
    .expect((res) => expect(res.body.length).toBe(0))
  );
});

describe(`Offer API refuses to delete non-existent comment`, () => {

  test(`Status code 404`, () => {

    const app = createAPI();

    return request(app)
      .delete(`/offers/GxdTgz/comments/NOEXST`)
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Offer API refuses to delete a comment to non-existent offer`, () => {

  test(`Status code 404`, () => {

    const app = createAPI();

    return request(app)
      .delete(`/offers/NOEXST/comments/k3H8Jj`)
      .expect(HttpCode.NOT_FOUND);
  });
});

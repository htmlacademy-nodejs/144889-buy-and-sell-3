'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const offerExist = require(`../middlewares/offerExist`);
const instanceValidator = require(`../middlewares/instanceValidator`);

const offerKeys = [`categories`, `description`, `title`, `type`, `sum`];
const commentKeys = [`text`];

module.exports = (app, offerService, commentService) => {
  const route = new Router();
  app.use(`/offers`, route);

  // GET /api/offers
  route.get(`/`, async (req, res) => {
    const {comments} = req.query;
    const offers = await offerService.findAll(comments);
    res.status(HttpCode.OK).json(offers);
  });

  // GET /api/offers/:offerId
  route.get(`/:offerId`, async (req, res) => {
    const {offerId} = req.params;
    const {comments} = req.query;
    const offer = await offerService.findOne(offerId, comments);

    if (!offer) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found offer with id:${offerId}`);
    }

    return res.status(HttpCode.OK)
        .json(offer);
  });

  // POST /api/offers
  route.post(`/`, instanceValidator(offerKeys), async (req, res) => {
    const offer = await offerService.create(req.body);
    return res.status(HttpCode.CREATED)
      .json(offer);
  });

  // PUT /api/offers/:offerId
  route.put(`/:offerId`, instanceValidator(offerKeys), async (req, res) => {
    const {offerId} = req.params;
    const updatedOffer = await offerService.update(offerId, req.body);

    if (!updatedOffer) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found offer with id:${offerId}`);
    }

    return res.status(HttpCode.OK).send(`Updated`);
  });

  // DELETE /api/offers/:offerId
  route.delete(`/:offerId`, async (req, res) => {
    const {offerId} = req.params;
    const deletedOffer = await offerService.drop(offerId);

    if (!deletedOffer) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found offer with id:${offerId}`);
    }

    return res.status(HttpCode.OK).send(`Deleted`);
  });

  // GET /api/offers/:offerId/comments
  route.get(`/:offerId/comments`, offerExist(offerService), async (req, res) => {
    const {offerId} = req.params;
    const comments = await commentService.findAll(offerId);
    return res.status(HttpCode.OK)
        .json(comments);
  });

  // DELETE /api/offers/:offerId/comments/:commentId
  route.delete(`/:offerId/comments/:commentId`, offerExist(offerService), async (req, res) => {
    const {commentId} = req.params;
    const deletedComment = await commentService.drop(commentId);

    if (!deletedComment) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found comment with id:${commentId}`);
    }

    return res.status(HttpCode.OK).send(`Deleted`);
  });

  // POST /api/offers/:offerId/comments
  route.post(`/:offerId/comments`, [offerExist(offerService), instanceValidator(commentKeys)], async (req, res) => {
    const {offerId} = req.params;

    const createdComment = await commentService.create(offerId, req.body);
    return res.status(HttpCode.CREATED)
      .json(createdComment);
  });
};

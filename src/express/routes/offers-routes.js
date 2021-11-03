'use strict';

const api = require(`../api`).getApi();
const {Router} = require(`express`);
const multer = require(`multer`);
const path = require(`path`);
const {nanoid} = require(`nanoid`);
const {prepareErrors} = require(`../../utils`);

const UPLOAD_DIR = `../upload/img/`;

const uploadDirAbsolute = path.resolve(__dirname, UPLOAD_DIR);

const offersRoutes = new Router();

const storage = multer.diskStorage({
  destination: uploadDirAbsolute,
  filename: (req, file, cb) => {
    const uniqueName = nanoid(10);
    const extension = file.originalname.split(`.`).pop();
    cb(null, `${uniqueName}.${extension}`);
  }
});

const upload = multer({storage});

const getAddOfferData = async () => {
  return await api.getCategories();
};

const getEditOfferData = async (offerId) => {
  const [offer, categories] = await Promise.all([
    api.getOffer(offerId),
    api.getCategories()
  ]);
  return [offer, categories];
};

const getViewOfferData = async (offerId, comments) => {
  return await api.getOffer(offerId, comments);
};

offersRoutes.get(`/category/:id`, (req, res) => res.render(`category`));

offersRoutes.get(`/add`, async (req, res) => {
  const categories = await getAddOfferData();
  res.render(`new-ticket`, {categories});
});

offersRoutes.post(`/add`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const offerData = {
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: Array.isArray(body.categories) ? body.categories : [body.categories]
  };

  if (file) {
    offerData.picture = file.filename;
  }

  try {
    api.createOffer(offerData);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const categories = await getAddOfferData();
    res.render(`new-ticket`, {categories, validationMessages});
  }
});

offersRoutes.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;
  const [offer, categories] = await getEditOfferData(id);

  res.render(`ticket-edit`, {offer, categories});
});

offersRoutes.post(`/edit/:id`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const {id} = req.params;
  const currentOffer = await api.getOffer(id);

  const updatedOffer = {
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: Array.isArray(body.categories) ? body.categories : [body.categories]
  };
  if (file) {
    updatedOffer.picture = file.filename;
  }

  const offerData = Object.assign(currentOffer, updatedOffer);

  try {
    await api.updateOffer(offerData, id);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const [offer, categories] = await getEditOfferData(id);
    res.render(`ticket-edit`, {offer, categories, validationMessages});
  }
});

offersRoutes.get(`/:id`, async (req, res) => {
  const {id} = req.params;
  const offer = await getViewOfferData(id, true);
  res.render(`ticket`, {offer});
});

offersRoutes.post(`/:id/comments`, async (req, res) => {
  const {id} = req.params;
  const {comment} = req.body;

  try {
    await api.createComment(id, {text: comment});
    res.redirect(`/offers/${id}`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const offer = await getViewOfferData(id, true);
    res.render(`ticket`, {offer, validationMessages});
  }
});

module.exports = offersRoutes;

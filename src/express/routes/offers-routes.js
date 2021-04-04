'use strict';

const api = require(`../api`).getApi();
const {Router} = require(`express`);
const multer = require(`multer`);
const path = require(`path`);
const {nanoid} = require(`nanoid`);

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

offersRoutes.get(`/category/:id`, (req, res) => res.render(`category`));

offersRoutes.get(`/add`, async (req, res) => {
  const categories = await api.getCategories();
  res.render(`new-ticket`, {categories});
});

offersRoutes.post(`/add`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const offerData = {
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    category: Array.isArray(body.category) ? body.category : [body.category]
  };

  if (file) {
    offerData.picture = file.filename;
  }

  try {
    await api.createOffer(offerData);
    res.redirect(`/my`);
  } catch (error) {
    res.redirect(`back`);
  }
});

offersRoutes.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;
  const [offer, categories] = await Promise.all([
    api.getOffer(id),
    api.getCategories()
  ]);

  res.render(`ticket-edit`, {offer, categories});
});

offersRoutes.post(`/edit/:id`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const {id} = req.params;
  const offer = await api.getOffer(id);

  const updatedOffer = {
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    category: Array.isArray(body.category) ? body.category : [body.category]
  };
  if (file) {
    updatedOffer.picture = file.filename;
  }

  const offerData = Object.assign(offer, updatedOffer);

  try {
    await api.updateOffer(offerData, id);
    res.redirect(`/my`);
  } catch (error) {
    console.error(error.message);
    res.redirect(`back`);
  }
});

offersRoutes.get(`/:id`, (req, res) => res.render(`ticket`));

module.exports = offersRoutes;

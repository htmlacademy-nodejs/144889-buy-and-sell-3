'use strict';

const express = require(`express`);
const path = require(`path`);

const dir = {
  PUBLIC_DIR: `public`,
  UPLOAD_DIR: `upload`
};

const offersRoutes = require(`./routes/offers-routes`);
const myRoutes = require(`./routes/my-routes`);
const mainRoutes = require(`./routes/main-routes`);
const {HttpCode} = require(`../constants`);

const DEFAULT_PORT = 8080;

const app = express();

app.use(`/offers`, offersRoutes);
app.use(`/my`, myRoutes);
app.use(`/`, mainRoutes);

app.use(express.static(path.resolve(__dirname, dir.PUBLIC_DIR)));
app.use(express.static(path.resolve(__dirname, dir.UPLOAD_DIR)));

app.use((req, res) => res.status(HttpCode.BAD_REQUEST).render(`errors/404`));
app.use((err, _req, res, _next) => {
  res.status(HttpCode.INTERNAL_SERVER_ERROR).render(`errors/500`);
});

app.set(`views`, path.resolve(__dirname, `templates`));
app.set(`view engine`, `pug`);

app.listen(process.env.PORT || DEFAULT_PORT);

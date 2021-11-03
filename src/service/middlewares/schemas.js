'use strict';

const Joi = require(`joi`);

const {instances} = require(`../../constants`);

const ErrorCommentMessage = {
  TEXT: `Комментарий содержит меньше 20 символов`
};

const ErrorOfferMessage = {
  CATEGORIES: `Не выбрана ни одна категория объявления`,
  TITLE_MIN: `Заголовок содержит меньше 10 символов`,
  TITLE_MAX: `Заголовок не может содержать более 100 символов`,
  DESCRIPTION_MIN: `Описание содержит меньше 50 символов`,
  DESCRIPTION_MAX: `Заголовок не может содержать более 1000 символов`,
  PICTURE: `Изображение не выбрано или тип изображения не поддерживается`,
  TYPE: `Не выбран ни один тип объявления`,
  SUM: `Сумма не может быть меньше 100`
};

const commentSchema = Joi.object({
  text: Joi.string().min(20).required().messages({
    'string.min': ErrorCommentMessage.TEXT
  })
});

const offerSchema = Joi.object({
  categories: Joi.array().items(
      Joi.number().integer().positive().messages({
        'number.base': ErrorOfferMessage.CATEGORIES
      })
  ).min(1).required(),
  title: Joi.string().min(10).max(100).required().messages({
    'string.min': ErrorOfferMessage.TITLE_MIN,
    'string.max': ErrorOfferMessage.TITLE_MAX
  }),
  description: Joi.string().min(50).max(1000).required().messages({
    'string.min': ErrorOfferMessage.DESCRIPTION_MIN,
    'string.max': ErrorOfferMessage.DESCRIPTION_MAX
  }),
  picture: Joi.string().required().messages({
    'string.empty': ErrorOfferMessage.PICTURE
  }),
  type: Joi.any().valid(`OFFER`, `SALE`).required().messages({
    'any.required': ErrorOfferMessage.TYPE
  }),
  sum: Joi.number().integer().min(100).required().messages({
    'number.min': ErrorOfferMessage.SUM
  })
});

const routeParamsSchema = Joi.object({
  offerId: Joi.number().integer().min(1),
  commentId: Joi.number().integer().min(1)
});

module.exports = {
  [instances.COMMENT]: commentSchema,
  [instances.OFFER]: offerSchema,
  routeParamsSchema
};

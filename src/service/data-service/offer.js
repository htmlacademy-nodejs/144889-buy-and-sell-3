'use strict';

const Aliase = require(`../models/aliase`);

class OfferService {
  constructor(sequelize) {
    this._Offer = sequelize.models.Offer;
    this._Comment = sequelize.models.Comment;
    this._Category = sequelize.models.Category;
  }

  async create(offerData) {
    const offer = await this._Offer.create(offerData);
    await offer.addCategories(offerData.categories);
    return offer.get();
  }

  async drop(id) {
    const deletedOffer = await this._Offer.destroy({
      where: {id}
    });
    return !!deletedOffer;
  }

  async findAll(needComments) {
    const include = [Aliase.CATEGORIES];
    if (needComments) {
      include.push(Aliase.COMMENTS);
    }
    const offers = await this._Offer.findAll({include});
    return offers.map((item) => item.get());
  }

  async findOne(id, needComments) {
    const include = [Aliase.CATEGORIES];
    if (needComments) {
      include.push(Aliase.COMMENTS);
    }
    const offer = await this._Offer.findByPk(id, {include});
    return offer;
  }

  async findPage({offset, limit, comments}) {
    const include = [Aliase.CATEGORIES];
    if (comments) {
      include.push(Aliase.COMMENTS);
    }
    const {count, rows} = await this._Offer.findAndCountAll({
      limit,
      offset,
      include,
      order: [
        [`createdAt`, `DESC`]
      ],
      distinct: true
    });
    return {count, offers: rows};
  }

  async update(id, offer) {
    const [updatedOffer] = await this._Offer.update(offer, {
      where: {id}
    });
    return !!updatedOffer;
  }

}

module.exports = OfferService;

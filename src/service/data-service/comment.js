'use strict';
class CommentService {
  constructor(sequelize) {
    this._Offer = sequelize.models.Offer;
    this._Comment = sequelize.models.Comment;
  }

  create(offerId, comment) {
    return this._Comment.create({
      offerId,
      ...comment
    });
  }

  async drop(id) {
    const deletedRows = await this._Comment.destroy({
      where: {id}
    });

    return !!deletedRows;
  }

  async findAll(offerId) {
    const comments = await this._Comment.findAll({
      where: {offerId},
      raw: true
    });
    return comments;
  }
}

module.exports = CommentService;

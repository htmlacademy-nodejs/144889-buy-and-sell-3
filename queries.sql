/*Cписок всех категорий*/
SELECT * FROM categories;

/*Список непустых категорий*/
SELECT id, name
FROM categories
  JOIN offers_categories
    ON id = category_id
  GROUP BY id

/*Категории с количеством объявлений*/
SELECT id, name, count(offer_id)
FROM categories
  LEFT JOIN offers_categories
    ON id = category_id
  GROUP BY id
  ORDER BY count(offer_id) DESC;

/*Список объявлений, сначала свежие*/
SELECT
  offers.id,
  offers.title,
  offers.sum,
  offers.type,
  offers.description,
  offers.created_at,
  concat(users.first_name, ' ', users.last_name) AS author,
  users.email AS author_email,
  count(comments.id) AS comments_count,
  string_agg(DISTINCT categories.name, ', ') AS categories
FROM offers
  JOIN users
    ON offers.user_id = users.id
  LEFT JOIN comments
    ON offers.id = comments.offer_id
  LEFT JOIN offers_categories
    ON offers.id = offers_categories.offer_id
  LEFT JOIN categories
    ON offers_categories.category_id = categories.id
  GROUP BY offers.id, users.id
  ORDER BY offers.created_at DESC;

/*Детальная информация по объявлению*/
SELECT
  offers.id,
  offers.title,
  offers.sum,
  offers.type,
  offers.description,
  offers.created_at,
  concat(users.first_name, ' ', users.last_name) AS author,
  users.email AS author_email,
  count(comments.id) AS comments_count,
  string_agg(DISTINCT categories.name, ', ') AS categories
FROM offers
  JOIN users
    ON offers.user_id = users.id
  LEFT JOIN comments
    ON offers.id = comments.offer_id
  LEFT JOIN offers_categories
    ON offers.id = offers_categories.offer_id
  LEFT JOIN categories
    ON offers_categories.category_id = categories.id
WHERE offers.id = 1
  GROUP BY offers.id, users.id;

/*Пять свежих комментариев*/
SELECT
  comments.id,
  comments.offer_id,
  concat(users.first_name, ' ', users.last_name) AS comment_author,
  comments.text
FROM comments
  JOIN users
    ON comments.user_id = users.id
  ORDER BY comments.created_at DESC
  LIMIT 5;

/*Комментарии к объявлению*/
SELECT
  comments.id,
  comments.offer_id,
  concat(users.first_name, ' ', users.last_name) AS comment_author,
  comments.text
FROM comments
  JOIN users
    ON comments.user_id = users.id
WHERE comments.offer_id = 1
  ORDER BY comments.created_at DESC;

/*Два объявления о покупке*/
SELECT * FROM offers
WHERE type = 'offer'
  LIMIT 2;

/*Обновить заголовок*/
UPDATE offers
  set title = 'Продам отличную подборку фильмов на VHS.'
WHERE
  offers.id = 1;

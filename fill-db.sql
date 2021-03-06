
/* fills users table */
INSERT INTO users(email, password_hash, first_name, last_name, avatar) VALUES
('ivanov@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', 'Иван', 'Иванов', 'avatar1.jpg'),
('petrov@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', 'Пётр', 'Петров', 'avatar2.jpg');

/* fills categories table */
INSERT INTO categories(name) VALUES
('Книги'),
('Разное'),
('Посуда'),
('Игры'),
('Животные'),
('Журналы'),
('Вселенная'),
('Дом и огород'),
('Кибернетика');

/* fills offers table */
ALTER TABLE offers DISABLE TRIGGER ALL;
INSERT INTO offers(title, description, type, sum, picture, user_id) VALUES
('Продам отличную подборку фильмов на VHS.', 'Если найдёте дешевле — сброшу цену. При покупке с меня бесплатная доставка в черте города. Пользовались бережно и только по большим праздникам. Продаю с болью в сердце...', 'sale', 2539, 'item03.jpg', 1),
('Куплю породистого кота.', 'Бонусом отдам все аксессуары. Товар в отличном состоянии. Если найдёте дешевле — сброшу цену. Кому нужен этот новый телефон, если тут такое...', 'offer', 5533, 'item12.jpg', 2),
('Продам новую приставку Sony Playstation 5.', 'Даю недельную гарантию. Продаю с болью в сердце... Без пробега по РБ. Не бит, не крашен.', 'offer', 76393, 'item10.jpg', 2),
('Куплю детские санки.', 'Продаю с болью в сердце... Товар в отличном состоянии. Если найдёте дешевле — сброшу цену. Кому нужен этот новый телефон, если тут такое...', 'sale', 69212, 'item10.jpg', 1),
('Куплю породистого кота.', 'Бонусом отдам все аксессуары. Кому нужен этот новый телефон, если тут такое... Это настоящая находка для коллекционера! Если найдёте дешевле — сброшу цену.', 'sale', 78161, 'item03.jpg', 2);
ALTER TABLE offers ENABLE TRIGGER ALL;

/* fills offers_categories table */
ALTER TABLE offers_categories DISABLE TRIGGER ALL;
INSERT INTO offers_categories(offer_id, category_id) VALUES
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(3, 1),
(3, 2),
(3, 3),
(3, 4),
(3, 5),
(3, 6),
(3, 7),
(3, 8),
(4, 3),
(4, 4),
(4, 5),
(4, 6),
(4, 7),
(5, 4),
(5, 5),
(5, 6);
ALTER TABLE offers_categories ENABLE TRIGGER ALL;

/* fills comments table */
ALTER TABLE comments DISABLE TRIGGER ALL;
INSERT INTO comments(text, user_id, offer_id) VALUES
('Совсем немного... ', 1, 1),
('С чем связана продажа? Почему так дешёво? А сколько игр в комплекте? Совсем немного...', 2, 1),
('Вы что?! В магазине дешевле. Продаю в связи с переездом. Отрываю от сердца.', 2, 1),
('Совсем немного... Оплата наличными или перевод на карту? Почему в таком ужасном состоянии?', 1, 1),
('С чем связана продажа? Почему так дешёво?  А сколько игр в комплекте?', 2, 2),
('Совсем немного...', 2, 2),
(' А сколько игр в комплекте?', 2, 2),
('Совсем немного... Оплата наличными или перевод на карту?', 2, 2),
('Продаю в связи с переездом. Отрываю от сердца. Вы что?! В магазине дешевле. С чем связана продажа? Почему так дешёво?', 2, 3),
('Вы что?! В магазине дешевле.', 1, 3),
(' Неплохо, но дорого. А где блок питания?', 2, 3),
('Почему в таком ужасном состоянии? Продаю в связи с переездом. Отрываю от сердца. А сколько игр в комплекте?', 2, 3),
('Продаю в связи с переездом. Отрываю от сердца. Оплата наличными или перевод на карту?', 2, 4),
('Вы что?! В магазине дешевле. Продаю в связи с переездом. Отрываю от сердца.', 1, 4),
('Почему в таком ужасном состоянии? Неплохо, но дорого.', 2, 4),
('Неплохо, но дорого.', 2, 5),
('А сколько игр в комплекте? С чем связана продажа? Почему так дешёво? Неплохо, но дорого.', 2, 5),
('Почему в таком ужасном состоянии? Продаю в связи с переездом. Отрываю от сердца. А сколько игр в комплекте?', 1, 5);
ALTER TABLE comments ENABLE TRIGGER ALL;
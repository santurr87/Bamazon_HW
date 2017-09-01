CREATE DATABASE bamazondb;

USE bamazondb;

CREATE TABLE bamazon (
	id INTEGER AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL
);

SELECT * FROM bamazon;

DESCRIBE bamazondb;
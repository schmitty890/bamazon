DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products(
  item_id INTEGER(11) AUTO_INCREMENT NOT NULL, -- item_id (unique id for each product)
  product_name VARCHAR(50) NULL, -- product_name (Name of product)
  department_name VARCHAR(50) NULL, -- department_name
  price FLOAT(11), -- price (cost to customer)
  stock_quantity INTEGER(11), -- stock_quantity (how much of the product is available in stores)
  product_sales FLOAT(11) DEFAULT 0, -- product_sales
  PRIMARY KEY (item_id)
);

CREATE TABLE departments(
	department_id INTEGER AUTO_INCREMENT NOT NULL,
	department_name VARCHAR(50) NULL,
	over_head_costs FLOAT(11) NULL,
	PRIMARY KEY (department_id)
);
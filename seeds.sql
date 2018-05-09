USE bamazon_db;

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES
	('hammer', 'tools', 9.00, 50),
	('frontload washer', 'appliances', 944.00, 50),
	('black spray paint', 'paint', 3.98, 90),
	('miter saw', 'power tools', 399.00, 20),
	('wrench', 'tools', 4.95, 15),
	('surge protector', 'electrical', 22.95, 15),
	('door hinge', 'hardware', 8.93, 15),
	('air filter', 'heating and cooling', 11.75, 100),
	('refridgerator', 'appliances', 2399.99, 15),
	('microwave', 'appliances', 377.00, 25);

INSERT INTO departments(department_name, over_head_costs)
VALUES
	('tools', 200),
	('appliances', 1000),
	('paint', 400),
	('power tools', 400),
	('electrical', 700),
	('hardware', 800),
	('heating and cooling', 900);

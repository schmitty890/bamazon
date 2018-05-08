var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db'
});

function start() {
    inquirer.prompt([{
        type: "list",
        name: "view",
        message: "Hello manager, what would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }]).then(function(resp) {
        var view = resp.view;
        switch(view) {
        	case 'View Products for Sale':
        		viewProducts();
        		break;
        	case 'View Low Inventory':
        		viewLowInventory();
        		break;
        	case 'Add to Inventory':
        		addToInventory();
        		break;
        	case 'Add New Product':
        		addNewProduct();
        		break;
        	default:
        		console.log('incorrect selection...');
        }
    });
}

function addNewProduct() {
    connection.query(`SELECT * FROM products`, function() {
        inquirer.prompt([{
            type: "input",
            message: "item name",
            name: "itemName"
        }, {
            type: "input",
            message: "what is the department name",
            name: "departmentName"
        }, {
            type: "input",
            message: "what is the cost?",
            name: "itemCost"
        }, {
            type: "input",
            message: "what is the stock quantity",
            name: "stockQuantity"
        }]).then(function(newItem) {
            var name = newItem.itemName;
            var price = Number(newItem.itemCost);
            var department = newItem.departmentName;
            var quantity = Number(newItem.stockQuantity);
            addNewItemToDatabase(name, price, department, quantity);
        });
    });
}

function addNewItemToDatabase(name, price, department, quantity) {
    connection.query(`INSERT INTO products SET ?`, {
        product_name: name,
        department_name: department,
        price: price,
        stock_quantity: quantity
    }, function(err, resp) {
        if (err) throw err;
    });
}

function addToInventory() {
    connection.query(`SELECT * FROM products`, function(err, resp) {
        if (err) throw err;
        var table = new Table({
            head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
            colWidths: [10, 20, 20, 20, 20]
        });
        var itemIDs = [];
        resp.forEach(function(item) {
            itemIDs.push(item.item_id);
            table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
        });

        console.log(table.toString());

        itemIDs = itemIDs.map(String);
        inquirer.prompt([{
            type: "list",
            name: "increaseItemId",
            message: "Select an item ID you would like to increase",
            choices: itemIDs
        }, {
            type: "input",
            name: "increaseQuantity",
            message: "How much inventory would you like to add to the item?"
        }]).then(function(answers) {
            var item = Number(answers.increaseItemId);
            var quantity = answers.increaseQuantity;
            var currentQuantity;
            console.log(`please increase product ${item} by ${quantity} units`);

            for (var i = 0; i < resp.length; i++) {
                console.log(typeof resp[i].item_id);
                console.log(typeof item);
                if (resp[i].item_id === item) {
                    currentQuantity = resp[i].stock_quantity;
                }
            }
            increaseQuantity(item, quantity, currentQuantity);
        });
    });
}

function increaseQuantity(item, quantity, currentQuantity) {
    console.log(item);
    console.log(quantity);
    console.log(currentQuantity);
    connection.query("UPDATE products SET ? WHERE ?", [{
        stock_quantity: Number(currentQuantity) + Number(quantity)
    }, {
        item_id: item
    }], function(err, resp) {
        if (err) throw err;
        console.log('increase quantity');
    });
}

function viewLowInventory() {
    connection.query(`SELECT * FROM products WHERE stock_quantity < 5`, function(err, resp) {
        if (err) throw err;
        console.log(resp);
        var table = new Table({
            head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
            colWidths: [10, 20, 20, 20, 20]
        });
        resp.forEach(function(item) {
            table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
        });
        console.log(table.toString());
    });
}

function viewProducts() {
    connection.query(`SELECT * FROM products`, function(err, resp) {
        if (err) throw err;
        var table = new Table({
            head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
            colWidths: [10, 20, 20, 20, 20]
        });
        resp.forEach(function(item) {
            table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
        });
        console.log(table.toString());
    });
}

start();
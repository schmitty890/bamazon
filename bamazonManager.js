const inquirer = require('inquirer');
const mysql = require('mysql');
const Table = require('cli-table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db'
});

/**
 * [bamazonManager holds all the functionality for the manager]
 */
const bamazonManager = (function() {

    /**
     * [connect to the mysql]
     */
    function connect() {
        connection.connect(function(err) {
            if (err) throw err;
            start();
        });
    }

    /**
     * [start the prompt for the manager]
     */
    function start() {
        inquirer.prompt([{
            type: "list",
            name: "view",
            message: "Hello manager, what would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        }]).then(function(resp) {
            const view = resp.view;
            switch (view) {
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
                case 'Exit':
                    exit();
                    break;
                default:
                    console.log('incorrect selection...');
            }
        });
    }

    /**
     * [addNewProduct prompts the user to enter new product information and passes that information to addNewItemToDatabase]
     */
    function addNewProduct() {
        connection.query(`SELECT * FROM products`, function() {
            inquirer.prompt([{
                type: "input",
                message: "Enter the item name",
                name: "itemName"
            }, {
                type: "input",
                message: "Enter the department name",
                name: "departmentName"
            }, {
                type: "input",
                message: "Enter the price of the product?",
                name: "itemCost"
            }, {
                type: "input",
                message: "Enter the stock quantity",
                name: "stockQuantity"
            }]).then(function(newItem) {
                let name = newItem.itemName,
                    price = Number(newItem.itemCost),
                    department = newItem.departmentName,
                    quantity = Number(newItem.stockQuantity);
                addNewItemToDatabase(name, price, department, quantity);
                start();
            });
        });
    }

    /**
     * [addNewItemToDatabase adds an item into the products table of the database]
     */
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

    /**
     * [addToInventory adds an item the inventory in the products table of the database]
     */
    function addToInventory() {
        connection.query(`SELECT * FROM products`, function(err, resp) {
            if (err) throw err;
            let table = new Table({
                head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
                colWidths: [10, 20, 20, 20, 20]
            });
            let itemIDs = [];
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
                let item = Number(answers.increaseItemId),
                    quantity = answers.increaseQuantity,
                    currentQuantity;
                console.log(`Increasing product ${item} by ${quantity} units...`);
                for (var i = 0; i < resp.length; i++) {
                    if (resp[i].item_id === item) {
                        currentQuantity = resp[i].stock_quantity;
                    }
                }
                increaseQuantity(item, quantity, currentQuantity);
                start();
            });
        });
    }

    /**
     * [increaseQuantity increases the quantity of a product in the database]
     */
    function increaseQuantity(item, quantity, currentQuantity) {
        connection.query("UPDATE products SET ? WHERE ?", [{
            stock_quantity: Number(currentQuantity) + Number(quantity)
        }, {
            item_id: item
        }], function(err, resp) {
            if (err) throw err;
        });
    }

    /**
     * [viewLowInventory displays inventory that has less than 5 units left in the database]
     */
    function viewLowInventory() {
        connection.query(`SELECT * FROM products WHERE stock_quantity < 5`, function(err, resp) {
            if (err) throw err;
            let table = new Table({
                head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
                colWidths: [10, 20, 20, 20, 20]
            });
            resp.forEach(function(item) {
                table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
            });
            console.log(table.toString());
            start();
        });
    }

    /**
     * [viewProducts returns all the items from the products table]
     */
    function viewProducts() {
        connection.query(`SELECT * FROM products`, function(err, resp) {
            if (err) throw err;
            let table = new Table({
                head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
                colWidths: [10, 20, 20, 20, 20]
            });
            resp.forEach(function(item) {
                table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
            });
            console.log(table.toString());
            start();
        });
    }

    /**
     * [exit ends the mysql connection]
     */
    function exit() {
        connection.end();
    }

    function init() {
        // connect();
        start();
    }

    return {
        init: init
    }

})();

/**
 * initialize bamazonManager
 */
bamazonManager.init();
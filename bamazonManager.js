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
const bamazonManager = (() => {

    /**
     * [connect to the mysql]
     */
    connect = () => {
        connection.connect((err) => {
            if (err) throw err;
            start();
        });
    }

    /**
     * [start the prompt for the manager]
     */
    start = () => {
        inquirer.prompt([{
            type: "list",
            name: "view",
            message: "Hello manager, what would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        }]).then((resp) => {
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
    addNewProduct = () => {
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
            }]).then((newItem) => {
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
    addNewItemToDatabase = (name, price, department, quantity) => {
        connection.query(`INSERT INTO products SET ?`, {
            product_name: name,
            department_name: department,
            price: price,
            stock_quantity: quantity
        },(err, resp) => {
            if (err) throw err;
        });
    }

    /**
     * [addToInventory adds an item the inventory in the products table of the database]
     */
    addToInventory = () => {
        connection.query(`SELECT * FROM products`, (err, resp) => {
            if (err) throw err;
            let table = new Table({
                head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
                colWidths: [10, 20, 20, 20, 20]
            });
            let itemIDs = resp.map(item => {
                return table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
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
            }]).then((answers) => {
                let item = Number(answers.increaseItemId),
                    quantity = answers.increaseQuantity,
                    currentQuantity;
                console.log(`Increasing product ${item} by ${quantity} units...`);
                resp.map(products => {
                    if(products.item_id === item) {
                       currentQuantity = products.stock_quantity;
                    }
                });
                increaseQuantity(item, quantity, currentQuantity);
                start();
            });
        });
    }

    /**
     * [increaseQuantity increases the quantity of a product in the database]
     */
    increaseQuantity = (item, quantity, currentQuantity) => {
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
    viewLowInventory = () => {
        connection.query(`SELECT * FROM products WHERE stock_quantity < 5`, (err, resp) => {
            if (err) throw err;
            let table = new Table({
                head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
                colWidths: [10, 20, 20, 20, 20]
            });
            resp.map(item => {
                return table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
            });
            console.log(table.toString());
            start();
        });
    }

    /**
     * [viewProducts returns all the items from the products table]
     */
    viewProducts = () => {
        connection.query(`SELECT * FROM products`, (err, resp) => {
            if (err) throw err;
            let table = new Table({
                head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
                colWidths: [10, 20, 20, 20, 20]
            });
            resp.map(item => {
                return table.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
            });
            console.log(table.toString());
            start();
        });
    }

    /**
     * [exit ends the mysql connection]
     */
    exit = () => {
        connection.end();
    }

    init = () => {
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
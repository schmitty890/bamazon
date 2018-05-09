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
 * [bamazonCustomer holds all the functionality for the customers]
 */
const bamazonCustomer = (() => {

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
     * [start the prompt for the customer]
     */
    start = () => {
        inquirer.prompt([{
            type: "list",
            name: "decision",
            message: "What would you like to do?",
            choices: ["View items for sale", "Exit"]
        }]).then((answer) => {
            const customerDecision = answer.decision;
            switch (customerDecision) {
                case 'View items for sale':
                    viewItems();
                    break;
                case 'Exit':
                    exit();
                    break;
                default:
                    exit();
            }
        });
    }

    /**
     * [viewItems returns all the items from the products table and prompts the user if they would like to buy]
     */
    viewItems = () => {
        connection.query(`SELECT * FROM products`, (err, resp) => {
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
                name: "product_id",
                message: "What is the product item id you'd like to buy",
                choices: itemIDs
            }, {
                type: "input",
                name: "units",
                message: "How many units would you like to purchase?"
            }]).then((transaction) => {
                let unitsWanted = Number(transaction.units),
                    productId = Number(transaction.product_id),
                    itemName,
                    itemQty,
                    itemPrice,
                    productSales;
                console.log(`The customer would like to buy ${transaction.units} units of item number ${transaction.product_id}`);
                for (let i = 0; i < resp.length; i++) {
                    if (productId === resp[i].item_id) {
                        itemName = resp[i].product_name;
                        itemQty = resp[i].stock_quantity;
                        itemPrice = resp[i].price;
                        productSales = resp[i].product_sales;
                    }
                }
                let productsLeft = itemQty - unitsWanted;
                if (productsLeft > 0) {
                    lowerQuantity(productId, unitsWanted, itemQty, itemPrice);
                    salesRevenue(productId, unitsWanted, productSales, itemPrice);
                } else {
                    console.log(`Insufficient quantity! there are ${itemQty} left for this product`);
                    start();
                }
            });
        });
    }

    /**
     * [salesRevenue updates the total sales revenue of the product]
     */
    salesRevenue = (productId, unitsWanted, productSales, itemPrice) => {
        let customerCost = unitsWanted * itemPrice;
        connection.query(`UPDATE products SET ? WHERE ?`, [{
            product_sales: productSales + customerCost
        }, {
            item_id: productId
        }], function(err, resp) {
            if (err) throw err;
            console.log(`The total cost is $${customerCost}`);
            start();
        });
    }

    /**
     * [lowerQuantity lowers the product quantity by however much the user purchased]
     */
    lowerQuantity = (item, purchaseQty, stockQty, price) => {
        connection.query("UPDATE products SET ? WHERE ?", [{
            stock_quantity: stockQty - purchaseQty
        }, {
            item_id: item
        }], function(err, resp) {
            if (err) throw err;
        });
    }

    /**
     * [exit ends the mysql connection]
     */
    exit = () => {
        connection.end();
    }

    /**
     * [init]
     */
    init = () => {
        // connect();
        start();
    }

    return {
        init: init
    }

})();

/**
 * initialize bamazonCustomer
 */
bamazonCustomer.init();
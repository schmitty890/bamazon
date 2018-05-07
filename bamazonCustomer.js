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
        name: "decision",
        message: "What would you like to do?",
        choices: ["View items for sale", "Leave store"]
    }]).then(function(answer) {
        var customerDecision = answer.decision;
        if (customerDecision === 'View items for sale') {
            console.log('show all the items');
            viewItems();
        }
    });
}

function viewItems() {
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
            name: "product_id",
            message: "What is the product item id you'd like to buy",
            choices: itemIDs
        }, {
            type: "input",
            name: "units",
            message: "How many units would you like to purchase?"
        }]).then(function(transaction) {
            var unitsWanted = Number(transaction.units);
            var productId = Number(transaction.product_id);
            var itemName;
            var itemQty;
            var itemPrice;
            console.log(`The customer would like to buy ${transaction.units} units of item number ${transaction.product_id}`);
            for (var i = 0; i < resp.length; i++) {
                if (productId === resp[i].item_id) {
                    itemName = resp[i].product_name;
                    itemQty = resp[i].stock_quantity;
                    itemPrice = resp[i].price;
                }
            }
            var productsLeft = itemQty - unitsWanted;
            if (productsLeft > 0) {
                var totalPrice = itemPrice * unitsWanted;
                console.log(`Congrats on purchasing ${unitsWanted} units of ${itemName} for a total price of $${totalPrice}`);
                lowerQuantity(productId, unitsWanted, itemQty, itemPrice);
            } else {
                console.log(`Insufficient quantity! there are ${itemQty} left for this product`);
                start();
            }
        });
    });
}

function lowerQuantity(item, purchaseQty, stockQty, price) {
    connection.query("UPDATE products SET ? WHERE ?", [{
        stock_quantity: stockQty - purchaseQty
    }, {
        item_id: item
    }], function(err, resp) {
        if (err) throw err;
    });
}

start();
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
 * [bamazonSupervisor holds all the functionality for the supervisor]
 */
const bamazonSupervisor = (() => {

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
     * [start the prompt for the supervisor]
     */
    start = () => {
        inquirer.prompt([{
            type: "list",
            name: "view",
            message: "Hello supervisor, what would you like to do?",
            choices: ["View Product Sales by Department", "Create New Department", "Exit"]
        }]).then((resp) => {
            const view = resp.view;
            switch (view) {
                case 'View Product Sales by Department':
                    viewSalesByDepartment();
                    break;
                case 'Create New Department':
                    createNewDepartment();
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
     * [viewSalesByDepartment displays sales by each individual department]
     */
    viewSalesByDepartment = () => {
        let joinQuery = "SELECT department_id, departments.department_name, over_head_costs," +
            " SUM(product_sales) AS product_sales," +
            " SUM(product_sales) - over_head_costs AS total_profit ";
        joinQuery += "FROM departments INNER JOIN products ";
        joinQuery += "ON departments.department_name = products.department_name ";
        joinQuery += "GROUP BY department_id ";

        let table = new Table({
            head: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit'],
            colWidths: [20, 20, 20, 20, 20]
        });
        connection.query(joinQuery, (error, results) => {
            if (error) throw error;
            results.map(department => {
                return table.push([department.department_id, department.department_name, department.over_head_costs, department.product_sales.toFixed(2), department.total_profit.toFixed(2)]);
            });
            console.log(table.toString());
            start();
        });
    }

    /**
     * [createNewDepartment allows the supervisor to create a new department for the store]
     */
    createNewDepartment = () => {
        connection.query("SELECT * FROM departments", (error, results) => {
            if (error) throw error;
            inquirer.prompt([{
                    name: "name",
                    message: "Please input new department name.",
                    // validating the dept doesn't already exist
                    validate: (value) => {
                        let deptArray = results.map(item => {
                            return item.department_name.toLowerCase();
                        });
                        if (deptArray.indexOf(value.toLowerCase()) === -1) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "overhead",
                    message: "Input new department overhead costs.",
                    // validate the overhead is a number larger than 0
                    validate: (value) => {
                        if (isNaN(value) === false && value > 0) {
                            return true;
                        }
                        return false;
                    }
                }
            ]).then((newDept) => {
                connection.query(
                    "INSERT INTO departments SET ?", {
                        department_name: newDept.name,
                        over_head_costs: parseFloat(newDept.overhead).toFixed(2)
                    }, (error, results) => {
                        if (error) throw error;
                        console.log("New department successfully created.");
                        start();
                    });
            });
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
 * initialize bamazonSupervisor
 */
bamazonSupervisor.init();
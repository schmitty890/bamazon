# bamazon

bamazon is a command line node.js application that mimics a storefront. There are three types of users, a customer, a manager and a supervisor. Each with different abilities to interact with a mysql database.

Customers are allowed to view items and purchase items.

Mangers are allowed to view items, view low inventory, add items to inventory and add new products.

Supervisors are allowed to view product sales by department and create a new department.


### Installation

<img src="https://thumbs.gfycat.com/FarawayFlakyHuia-size_restricted.gif" width="600" height="400" />

* `git clone` this repository to your machine
* cd into the cloned repository
* run `npm install`

<img src="https://thumbs.gfycat.com/ImaginativeDecimalIndochinahogdeer-size_restricted.gif" width="600" height="400" />

* populate the bamazon.sql with `mysql -uroot < bamazon.sql`
* populate the seeds.sql with `mysql -uroot < seeds.sql`

You're ready to go!

### How to use?

Run `node bamazonCustomer.js`
##### Customer view options
* View items for sale
* Exit

Run `node bamazonManager.js`
##### Manager view options
* View products for sale
* View Low Inventory
* Add to Inventory
* Add New Product
* Exit

Run `node bamazonSupervisor.js`
##### Supervisor view options
* View Product Sales by Department
* Create New Department
* Exit

Products for sale table will look like this
![products for sale](https://user-images.githubusercontent.com/16051859/39825377-a942756e-537f-11e8-852c-800ed461671d.png)

Products of low inventory table will show any product that has less than 5 Stock Quantity
![products with low inventory](https://user-images.githubusercontent.com/16051859/39825376-a93295e0-537f-11e8-89b3-983681c7550a.png)

Supervisor view of sales by department show aggregated sales by each department
![supervisor view](https://user-images.githubusercontent.com/16051859/39825378-a950dcd0-537f-11e8-8fa6-92b0ea2dd3c4.png)


### Technology used

* Node.js
* [npm cli-table](https://www.npmjs.com/package/cli-table)
* [npm mysql](https://www.npmjs.com/package/mysql)
* [npm inquirer](https://www.npmjs.com/package/inquirer)
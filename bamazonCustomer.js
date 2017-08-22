var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

//connecting to database created in mysql workbench
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  //username
  user: "root",

  password: "xxxx",
  database: "bamazondb"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
});


function selection() {
	connection.query('SELECT * FROM bamazon', function(err, res) {
	    if (err) throw err;
	    //new table variable
		var table = new Table({
			head: ["ID".cyan, "Name".cyan, "Department Name".cyan, "Price".cyan, "Quantity".cyan],
			colWidths: [13, 20, 20, 13, 13],
		});
		//looping thru table
		for(var i = 0; i < res.length; i++) {
			table.push(
			    [res[i].itemID, res[i].ProductName, res[i].DepartmentName, parseFloat(res[i].Price).toFixed(2), res[i].StockQuantity]
			);
		}
		
		console.log(table.toString());
		//using inquirer we installed to ask user some questions
		inquirer.prompt([
			{
				type: "number",
				message: "What're you looking to purchase?",
				name: "itemNumber"
			},
			{
				type: "number",
				message: "How many would you like to buy?",
				name: "howMany"
			},
		]).then(function (user) {
			//joining tables
			connection.query('SELECT * FROM bamazon JOIN departments ON bamazon.DepartmentName = departments.DepartmentName', function(err, res) {
		    	if (err) throw err;

		    	if(res[user.itemNumber - 1].StockQuantity > user.howMany) {
		    		var newQuantity = parseInt(res[user.itemNumber - 1].StockQuantity) - parseInt(user.howMany);
		    		var total = parseFloat(user.howMany) * parseFloat(res[user.itemNumber - 1].Price);
			    	total = total.toFixed(2);

			    	var departmentTotal = parseFloat(total) + parseFloat(res[user.itemNumber - 1].TotalSales);
			    	departmentTotal = departmentTotal.toFixed(2);

	    			connection.query("UPDATE departments SET ? WHERE ?", [{
		    			TotalSales: departmentTotal
		    		}, {
		    			DepartmentName: res[user.itemNumber - 1].DepartmentName
		    		}], function(error, results) {});

		    		connection.query("UPDATE bamazon SET ? WHERE ?", [{
		    			StockQuantity: newQuantity
		    		}, {
		    			itemID: user.itemNumber
		    		}], function(error, results) {
		    			if(error) throw error;

			    		console.log("Your order for " + user.howMany + " " + res[user.itemNumber - 1].ProductName +
			    			"(s) has been placed.");
			    		console.log("Your total is $" + total);
			    		orderMore();
		    		});

		    	} else {
		    		console.log("We only have " + res[user.itemNumber - 1].StockQuantity + " of that product.");
		    		orderMore();
		    	}	    
			});
		});	
	});
}

function orderMore() {
	inquirer.prompt([
		{
			type: "confirm",
			message: "Would you like to purchase anything else?",
			name: "again"
		},
	]).then(function (user) {
		if(user.again) {
			selection();
		} else {
			exit();
		}
	});
}
//end of interaction with user
function exit() {
	connection.end();
	console.log("Thank you for your business!");
}

selection();
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'company_db'
    },
    console.log(`Connected to the company_db database.`)
  );

inquirer.prompt(
  [
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'action',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee role',
        'Quit'
      ]
    }
  ])
  .then((answers) => {
    if (answers.action === 'View All Departments') {
          db.query('SELECT * FROM departments', function (err, results) {
            console.table(results);
    })
    }
    if (answers.action === 'View All Roles') {
      db.query('SELECT * FROM roles', function (err, results) {
        console.table(results);
    })
    }
    if (answers.action === 'View All Employees') {
      db.query('SELECT * FROM employees', function (err, results) {
        console.table(results);
    })
    }
  });
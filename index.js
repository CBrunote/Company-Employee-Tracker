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

db.connect(function (err) {
  if (err) throw err;
  console.log(`connected as id ${db.threadId}`);
  init();
});


function init() {

    inquirer.prompt(
      [
        {
          type: 'list',
          message: 'What would you like to do?',
          name: 'startQuestions',
          choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add Department', 'Add Role', 'Add Employee', 'Update Employee Role', 'Exit']
        }
      ])
      .then((answers) => {

        switch (answers.startQuestions) {
          case 'View All Departments':
            showAllDepartments();
            break;
          
          case "View All Roles":
            showAllRoles();
            break;

          case "View All Employees":
            showAllEmployees();
            break;

          case "Add Department":
            addDepartment();
            break;

          case "Add Role":
            addRole();
            break;

          case "Add Employee":
            addEmployee();
            break;

          case "Update Employee Role":
            updateEmmployeeRole();
            break;

          case "Exit":
            db.end();
            break;
        }
      })
};

function showAllDepartments() {
  db.query('SELECT * FROM departments', function (err, results) {
    console.table(results);
  })
  .then(init());
};

function showAllRoles() {
  db.query('SELECT * FROM roles', function (err, results) {
    console.table(results);
  })
  .then(init());
};

function showAllEmployees() {
  db.query('SELECT * FROM employees', function (err, results) {
    console.table(results);
  })
  .then(init());
};
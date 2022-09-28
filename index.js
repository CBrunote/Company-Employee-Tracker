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
          choices: ['View All Departments', 'View All Roles', 'View All Employees', new inquirer.Separator(), 'Add Department', 'Add Role', 'Add Employee', new inquirer.Separator(),  'Update Employee Role', new inquirer.Separator(), 'Exit', new inquirer.Separator()]
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
            updateEmployeeRole();
            break;

          case "Exit":
            db.end();
            break;
        }
      })
};


var listofDepartments = []
function getAllDepartments() {
  db.query('SELECT * FROM departments', function (err, results) {
    if (err) 
        throw err
    for (var i = 0; i < results.length; i++) {
        listofDepartments.push(results[i].name);
    }
  })
  return listofDepartments;
};

var listofRoles = []
function getAllRoles() {
  db.query('SELECT * FROM roles', function (err, results) {
    if (err) 
        throw err
    for (var i = 0; i < results.length; i++) {
        listofRoles.push(results[i].title);
    }
  })
  console.log(listofRoles)
  return listofRoles;
};

var listofEmployees = []
function getAllEmployees() {
  db.query('SELECT * FROM employees', function (err, results) {
    if (err) 
        throw err
    for (var i = 0; i < results.length; i++) {
        listofEmployees.push(results[i].first_name + " " + results[i].last_name);
    }
  })
  console.log(listofEmployees);
  return listofEmployees;
};

var listofManagers = ['None']
function getAllManagers() {
  db.query('SELECT * FROM employees where manager_id is NULL', function (err, results) {
      if (err) 
          throw err
      for (var i = 0; i < results.length; i++) {
          listofManagers.push(results[i].first_name + " " + results[i].last_name);
      }
  })
  console.log(listofManagers);
  return listofManagers;
}

function showAllDepartments() {
  db.query('SELECT * FROM departments', function (err, results) {
    console.table(results);
    init();
  })
};

function showAllRoles() {
  db.query('SELECT * FROM roles', function (err, results) {
    console.table(results);
    init();
  })
};

function showAllEmployees() {
  db.query('SELECT * FROM employees', function (err, results) {
    console.table(results);
    init();
  })
};

function addDepartment() {
  inquirer.prompt(
    {
      type: 'input',
      message: 'What is the name of the department?',
      name: 'departmentName',
    }
  )
  .then((answers) => {
    db.query(`INSERT INTO departments (name) VALUES (?)`, answers.departmentName, function (err, results) {
      console.table(results);
      init();
    })
  }
)};

function addRole() {
  const roleQuestions = [
    {
      type: 'input',
      message: 'What is the name of the role?',
      name: 'title',
    },
    {
      type: 'input',
      message: 'What is the salary of the role?',
      name: 'salary',
    },
    {
      type: 'list',
      message: 'Which department does the role belong to?',
      name: 'department_id',
      choices: getAllDepartments(),
    }
  ]
  inquirer.prompt(roleQuestions)
    .then((answers) => {
      db.query(`INSERT INTO roles (title, salary, department_id)
      VALUES ("${answers.title}", ${answers.salary}, ${listofDepartments.indexOf(answers.department_id) + 1})`, function (err, results) {
        console.table(results);
        console.log(listofManagers)
        console.log(`${answers.title} role added successfully to the roles table`)
        init();
      })
    })
  };

function addEmployee() {
  const employeeQuestions = [
    {
      type: 'input',
      message: 'What is the first name of the employee?',
      name: 'firstname',
    },
    {
      type: 'input',
      message: 'What is the last name of the employee?',
      name: 'lastname',
    },
    {
      type: 'list',
      message: 'What is the role of the employee?',
      name: 'roleid',
      choices: getAllRoles(),
    },
    {
      type: 'list',
      message: 'Who is the manager of the employee',
      name: 'managerid',
      choices: getAllManagers(),
    }
  ]
  inquirer.prompt(employeeQuestions)
    .then((answers) => {
      let managerid = listofManagers.indexOf(answers.managerid)
      function checkNull() {
        if (managerid === 0) {
          managerid = 'NULL'
        } else {
          return managerid
        }
        console.log(managerid)
        return managerid
      }
      db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id)
      VALUES ("${answers.firstname}", "${answers.lastname}", ${listofRoles.indexOf(answers.roleid) + 1}, ${checkNull()})`, function (err, results) {
        if (err) {
          throw (err)
        } else {
          console.table(results);
          console.log(`${answers.firstname} ${answers.lastname} added successfully to the employees table`)
          init();
        }
      })
    })
}

function updateEmployeeRole() {
  const employeeUpdate = [
    {
      type: 'list',
      message: 'Which employee role do you want to update?',
      name: 'employeeName',
      choices: getAllEmployees(),
    },
    {
      type: 'list',
      message: 'What role do you want to give the employee?',
      name: 'roleid',
      choices: getAllRoles(),
    },
  ]
  inquirer.prompt(employeeUpdate)
    .then((answers) => {
      db.query(`UPDATE employees SET role_id = ${listofRoles.indexOf(answers.roleid) + 1} WHERE id = ${listofRoles.indexOf(answers.employeeName) + 1})`, function (err, results) {
        if (err) {
          throw (err)
        } else {
          console.table(results);
          console.log(`Employee updated successfully`)
          init();
        }
      })
    })
}
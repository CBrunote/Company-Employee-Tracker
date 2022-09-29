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
          choices: ['View All Departments', 'View All Roles', 'View All Employees', new inquirer.Separator(), "View Employees by Manager", "View Employees by Department", new inquirer.Separator(), 'Add Department', 'Add Role', 'Add Employee', new inquirer.Separator(), 'Update Employee Role', 'Update Employee Manager', new inquirer.Separator(), 'Exit', new inquirer.Separator()]
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

          case "View Employees by Manager":
            employeesByManager();
            break;

          case "View Employees by Department":
            employeesByDepartment();
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

          case "Update Employee Manager":
            updateEmployeeManager();
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

async function employeesByDepartment() {
  const allDepartments = await db.promise().query("SELECT * FROM departments")
  inquirer.prompt(
    {
      type: 'list',
      message: "Which department's employees would you like to see",
      name: 'departmentid',
      choices: allDepartments[0].map((department) => ({
        name: department.name,
        value: department.id})),
    }
  )
  .then((answers) => {
    db.query('SELECT employees.first_name, employees.last_name from employees JOIN roles on employees.role_id = roles.id JOIN departments on roles.department_id = departments.id WHERE departments.id = ?', answers.departmentid,  function (err, results) {
      console.table(results);
      init();
      })
  })
}

async function employeesByManager() {
  const allManagers = await db.promise().query("SELECT * FROM employees where manager_id is NULL")
  inquirer.prompt(
    {
      type: 'list',
      message: "Which manager's employees would you like to see",
      name: 'managerid',
      choices: allManagers[0].map((manager) => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.ID})),
    }
  )
  .then((answers) => {
    db.query(`SELECT * FROM employees where manager_id = ${answers.managerid}`, function (err, results) {
      console.table(results);
      init();
      })
  })
}

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
  })
};

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
          console.log(`${answers.firstname} ${answers.lastname} added successfully to the employees table`)
          init();
        }
      })
    })
}

async function updateEmployeeRole() {
  const allEmployees = await db.promise().query("SELECT * FROM employees")
  const allRoles = await db.promise().query("SELECT * FROM roles")

  const employeeUpdate = [
    {
      type: 'list',
      message: 'Which employee role do you want to update?',
      name: 'employeeName',
      choices: allEmployees[0].map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.ID})),
    },
    {
      type: 'list',
      message: 'What role do you want to give the employee?',
      name: 'roleid',
      choices: allRoles[0].map((roles) => ({
        name: roles.title,
        value: roles.id})),
    },
  ]
  inquirer.prompt(employeeUpdate)
    .then((answers) => {
      db.query(`UPDATE employees SET role_id = ${answers.roleid} WHERE id = ${answers.employeeName}`, function (err, results) {
        if (err) {
          throw (err)
        } else {
          console.log(`Employee updated successfully`)
          init();
        }
      })
    })
}

async function updateEmployeeManager() {
  const allEmployees = await db.promise().query("SELECT * FROM employees")
  const allManagers = await db.promise().query("SELECT * FROM employees where manager_id is NULL")

  const managerUpdate = [
    {
      type: 'list',
      message: "Which employee's manager do you want to update?",
      name: 'employeeName',
      choices: allEmployees[0].map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.ID})),
    },
    {
      type: 'list',
      message: 'Who is the new manager of the employee?',
      name: 'managerid',
      choices: getAllManagers(),
    },
  ]
  inquirer.prompt(managerUpdate)
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
      db.query(`UPDATE employees SET manager_id = ${checkNull()} WHERE id = ${answers.employeeName}`, function (err, results) {
        if (err) {
          throw (err)
        } else {
          console.log(`Employee's Manager updated successfully`)
          init();
        }
      })
    })
}
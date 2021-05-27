const inquirer = require("inquirer");
const mysql = require("mysql");
const util = require("util");
require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
  database: "my_employee_trackerdb",
});

const start = async () => {
  const { answer } = await inquirer.prompt({
    name: "answer",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "view employees",
      "view roles",
      "view all departments",
      "update employee role",
      "add employee",
      "add department",
      "add role",
      // "view all employees in a given department",
      "Exit Prompt",
    ],
  });

  switch (answer) {
    case "view employees":
      viewEmployees();
      break;

    case "update employee role":
      updateEmployeeRole();
      break;

    case "add employee":
      addEmployee();
      break;

    case "view all departments":
      viewDepartments();
      break;

    // case "view all employees in a given department":
    //   viewEmployeesInDepartment();
    //   break;

    case "add department":
      addDepartment();
      break;

    case "view roles":
      viewRoles();
      break;

    case "add role":
      addRole();
      break;

    default:
      process.exit();
  }
};

const viewEmployees = async () => {
  const employees = await connection.query(
    "SELECT CONCAT_WS(' ', employee.first_name, employee.last_name) AS 'Full Name', role.title AS 'Title', role.salary AS 'Salary', department.department AS 'Department', CONCAT_WS(' ', m.first_name, m.last_name) AS 'Manager' FROM employee INNER JOIN employee m ON m.id = employee.manager_id INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON role.department_id=department.id ORDER BY employee.first_name"
  );
  console.log(
    " ___________________________________________________________\n|                                                           |\n|                       Employee List                       |\n|___________________________________________________________|\n"
  );
  console.table(employees);
  start();
};
// const viewEmployeesInDepartment = async () => {
//   const employees = await connection.query(
//     "SELECT CONCAT_WS(' ', employee.first_name, employee.last_name) AS 'Full Name', role.title AS 'Title', role.salary AS 'Salary', department.department AS 'Department', CONCAT_WS(' ', m.first_name, m.last_name) AS 'Manager' FROM employee INNER JOIN employee m ON m.id = employee.manager_id INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON role.department_id=department.id GROUP BY title"
//   );
//   console.log(
//     " ___________________________________________________________\n|                                                           |\n|                       Employee List                       |\n|___________________________________________________________|\n"
//   );
//   console.table(employees);
//   start();
// };

const viewRoles = async () => {
  const roles = await connection.query(
    "SELECT role.title AS Title, role.salary AS Salary, department.department AS Department FROM role INNER JOIN department ON role.department_id=department.id"
  );
  console.log(
    " _________________\n|                 |\n|    Role List    |\n|_________________|\n"
  );
  console.table(roles);
  start();
};

const viewDepartments = async () => {
  const departments = await connection.query(
    "SELECT department AS Department FROM department"
  );
  console.log(
    " _________________\n|                 |\n| Department List |\n|_________________|\n"
  );
  console.table(departments);
  start();
};

const updateEmployeeRole = async () => {
  const employees = await connection.query("SELECT * FROM employee");
  const roles = await connection.query("SELECT * FROM role");

  // array of objects containing employee name and id
  const employeeChoices = employees.map((person) => {
    return {
      name: `${person.first_name} ${person.last_name}`,
      value: person.id,
    };
  });

  const roleChoices = roles.map((person) => {
    return {
      name: person.title,
      value: person.id,
    };
  });

  const { employee, role } = await inquirer.prompt([
    {
      name: "employee",
      type: "list",
      choices: employeeChoices,
      message: "which employee would you like to choose?",
    },
    {
      name: "role",
      type: "list",
      choices: roleChoices,
      message: "What role would you like to give this employee?",
    },
  ]);

  await connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [
    role,
    employee,
  ]);
  console.log("succefully updated employee role!");
  start();
};

const addEmployee = async () => {
  // query all roles from database into a list of choices
  const choicesManager = await connection.query("SELECT * FROM employee");

  const managerArray = choicesManager.map((person) => {
    return {
      name: `${person.first_name} ${person.last_name}`,
      value: person.id,
    };
  });

  const choicesTitle = await connection.query("SELECT * FROM role");

  const titleArray = choicesTitle.map((role) => {
    return {
      name: role.title,
      value: role.id,
    };
  });

  const answer = await inquirer.prompt([
    {
      name: "firstName",
      message: "What is the employee's first name?",
      type: "input",
    },
    {
      name: "lastName",
      message: "What is the employee's last name?",
      type: "input",
    },
    {
      name: "title",
      message: "What is the title of the employee that you would like to add?",
      type: "list",
      choices: titleArray,
    },
    {
      name: "manager",
      message: "Who is the employee's manager?",
      type: "list",
      choices: managerArray,
    },
  ]);

  connection.query(
    `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?)`,
    [answer.firstName, answer.lastName, answer.title, answer.manager],
    (err, res) => {
      if (err) throw err;
    }
  );
  console.log(`${answer.firstName} has been successfully added!`);

  start();
  // ask questions for each column
  // query all employees, who is this persons manager? put their id in the manger_id column of added employee
  // ask if manager, if so, delete departments, roles, and employees
};

const addRole = async () => {
  const departmentChoices = await connection.query("SELECT * FROM department");

  const departmentArray = await departmentChoices.map((department) => {
    return {
      name: department.department,
      value: department.id,
    };
  });

  const answer = await inquirer.prompt([
    {
      name: "title",
      message: "What is the name of the role that you would like to add?",
      type: "input",
    },
    {
      name: "salary",
      message: "What is this role's yearly salary?",
      type: "input",
    },
    {
      name: "department",
      message: "What department does this role belong to?",
      type: "list",
      choices: departmentArray,
    },
  ]);

  connection.query(
    `INSERT INTO role (title, salary, department_id) VALUES(?, ?, ?)`,
    [answer.title, answer.salary, answer.department],
    (err, res) => {
      if (err) throw err;
    }
  );

  console.log(`${answer.title} has been successfully added!`);

  start();
  // ask questions for each column
  // query all employees, who is this persons manager? put their id in the manger_id column of added employee
  // ask if manager, if so, delete departments, roles, and employees
};

const addDepartment = async () => {
  const answer = await inquirer.prompt([
    {
      name: "department",
      message: "What is the name of the department that you would like to add?",
      type: "input",
    },
  ]);

  connection.query(
    `INSERT INTO department (department) VALUES(?)`,
    [answer.department],
    (err, res) => {
      if (err) throw err;
    }
  );
  console.log(`${answer.department} has been successfully added!`);

  start();
  // ask questions for each column
  // query all employees, who is this persons manager? put their id in the manger_id column of added employee
  // ask if manager, if so, delete departments, roles, and employees
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  start();
});

connection.query = util.promisify(connection.query);

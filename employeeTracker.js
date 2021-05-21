const inquirer = require("inquirer");
const mysql = require("mysql");
const util = require("util");
require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
  database: "my_employee_trackerDB",
});

const start = async () => {
  const { answer } = await inquirer.prompt({
    name: "answer",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "view employees",
      "update employee role",
      "add employees",
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

    default:
      process.exit();
  }
};

const viewEmployees = async () => {
  const employees = await connection.query("SELECT * FROM employee");
  console.table(employees);
  start();
};

const updateEmployeeRole = async () => {
  const employee = await connection.query("SELECT * FROM employee");
  const role = await connection.query("SELECT * FROM role");

  // array of objects containing employee name and id
  const employeeChoices = employee.map((person) => {
    return {
      name: `${person.first_name} ${person.last_name}`,
      value: person.id,
    };
  });

  const roleChoices = role.map((person) => {
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
};

const addEmployee = async () => {
  // ask questions for each column
  // query all roles from database into a list of choices
  // query all employees, who is this persons manager? put their id in the manger_id column of added employee
  // ask if manager, if so, delete departments, roles, and employees
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadID}\n`);
  start();
});

connection.query = util.promisify(connection.query);

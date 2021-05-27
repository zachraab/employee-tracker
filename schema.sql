DROP DATABASE IF EXISTS my_employee_trackerDB;

CREATE DATABASE my_employee_trackerDB;

USE my_employee_trackerDB;

CREATE TABLE department (
id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
department VARCHAR(30) NOT NULL
);

CREATE TABLE role (
id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
title VARCHAR(30) NOT NULL,
salary DECIMAL(6,2) NOT NULL,
department_id INT NOT NULL
);

CREATE TABLE employee (
id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INT NOT NULL,
manager_id INT
);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES("Zach", "Raab", 1, 1);

INSERT INTO role (title, salary, department_id) VALUES ('Engineer', '70000', '1'), ('Salesman', '60000', '2'), ('Lawyer', '80000', '3'), ('Accountant', '55000', '4');

INSERT INTO department (department) VALUES ("Engineering"), ("Sales"), ("Legal"), ("Finance");
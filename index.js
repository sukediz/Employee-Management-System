const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const cTable = require('console.table');
const inquirer = require('inquirer');
const { questions, continueQuestion } = require('./lib/questions');
const QueryDepartment = require('./lib/QueryDepartment');
const QueryRole = require('./lib/QueryRole');
const QueryEmployee = require('./lib/QueryEmployee');

const queryDepartment = new QueryDepartment();
const queryRole = new QueryRole();
const queryEmployee = new QueryEmployee();

/**
 * clears screen and display employee management system banner on screen.
 */
const initializeDisplay = () => {
    clear();
    console.log(
        chalk.yellow(
            figlet.textSync('Employee Management System', { horizontalLayout: 'full' })
        )
    );
}

/**
 * ask relevant questions from user and process them as needed.
 */
const askQuestions = async () => {
    initializeDisplay();
    const answers = await inquirer.prompt(questions);
    switch (answers.action) {
        case 'Add Department':
            await queryDepartment.addDepartment({ newDepartment: answers.newDepartment });
            break;

        case 'Add Role':
            await queryRole.addRole({
                newRoleTitle: answers.newRoleTitle,
                newRoleSalary: answers.newRoleSalary,
                selectedDepartment: answers.selectedDepartment
            });
            break;

        case 'Add Employee':
            await queryEmployee.addEmployee({
                employeeRoleTitle: answers.selectedRole,
                employeeManager: answers.employeeManager,
                employeeFirstName: answers.employeeFirstName,
                employeeLastName: answers.employeeLastName
            });
            break;

        case 'View Departments':
            const departments = await queryDepartment.viewDepartment();
            console.table("Departments Summary", departments);
            break;

        case 'View Roles':
            await queryRole.viewRoles();
            break;

        case 'View Employees':
            console.table("Employees Summary", await queryEmployee.viewEmployees());
            break;

        case 'View Employees By Manager':
            await queryEmployee.viewEmployeesByManager({
                managerName: answers.viewByManager
            });
            break;

        case 'View total utilized budget of a department':
            await queryEmployee.viewTotalUtilizedBudget({
                departmentName: answers.selectedDepartment
            });
            break;

        case 'Update Employee Role':
            await queryEmployee.updateEmployeeRole({
                newRole: answers.newRole,
                employeeToUpdate: answers.employeeToUpdate
            });
            break;
        case 'Update Employee Manager':
            await queryEmployee.updateEmployeeManager({
                newManager: answers.newManager,
                employeeToUpdate: answers.employeeToUpdate
            });
            break;
        case 'Delete Department':
            await queryDepartment.deleteDepartment({ departmentName: answers.selectedDepartment });
            break;
        case 'Delete Role':
            await queryRole.deleteRole({ roleTitle: answers.selectedRole });
            break;
        case 'Delete Employee':
            await queryEmployee.deleteEmployee({ employeeName: answers.employeeToUpdate });
            break;
    }
    inquirer.prompt(continueQuestion).then(async answers => {
        answers.continue ? await askQuestions() :
            console.log(chalk.yellow("Thanks for using Employee Management System"));
    });
}
initializeDisplay();
askQuestions();



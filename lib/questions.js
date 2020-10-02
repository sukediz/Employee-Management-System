const QueryData = require("./QueryData");
const queryData = new QueryData();

/**
 * returns a list of all department names which can be shown to user as choice option
 */
const fetchAllDepartments = async () => {
    const departments = await queryData.fetchData('department', '1', '1');
    return departments.map(department => department.NAME).sort();
}
/**
 * returns a list of all role titles which can be shown to user as choice option
 */
const fetchAllRoleTitles = async () => {
    const roles = await queryData.fetchData('role', '1', '1');
    return roles.map(role => role.TITLE).sort();
}

/**
 * prepares and returns list of employee names which can be displayed to user a choice of manager
 * It also add a None option as there can be employee without any manager.
 * Also, it filters out current employee if any as an employee can't report to himself/herself.
 * @param {object represent answerrs provided by user in current inquirer session} answers 
 */
const getManagerChoiceList = async answers => {
    const sortedEmployees = await getEmployeeChoiceList();
    sortedEmployees.push('None');
    return answers.employeeToUpdate ? sortedEmployees
        .filter(employee => employee != answers.employeeToUpdate) : sortedEmployees;
}
/**
 * prepares and returns list of employee by joining their firstName and lastName so that
 * it can be displayed as choice option for user to select an employee for various questions.
 */
const getEmployeeChoiceList = async () => {
    const employees = await queryData.fetchData('employee', '1', '1');
    const sortedEmployees = employees.map(employee => `${employee.FIRST_NAME} ${employee.LAST_NAME}`).sort();
    return sortedEmployees;
}

// question array which holds all questions related to viewing and updating the employee database.
const questions = [
    {
        type: 'list',
        name: 'actionType',
        message: `What would you like to do?:`,
        choices: ['Add', 'View', 'Update', 'Delete']
    },
    {
        type: 'list',
        name: 'action',
        message: `Please choose what type of Add action you want to perform:`,
        when: answers => answers.actionType == 'Add',
        choices: ['Add Department', 'Add Role', 'Add Employee']
    },
    {
        type: 'list',
        name: 'action',
        message: `Please choose what type of View action you want to perform:`,
        when: answers => answers.actionType == 'View',
        choices: ['View Departments', 'View Roles', 'View Employees'
                  ,'View Employees By Manager', 'View total utilized budget of a department']
    },
    {
        type: 'list',
        name: 'action',
        message: `Please choose what type of Update action you want to perform:`,
        when: answers => answers.actionType == 'Update',
        choices: ['Update Employee Role', 'Update Employee Manager']
    },
    {
        type: 'list',
        name: 'action',
        message: `Please choose what type of Delete action you want to perform:`,
        when: answers => answers.actionType == 'Delete',
        choices: ['Delete Department', 'Delete Role', 'Delete Employee']
    },
    {
        type: 'input',
        name: 'newDepartment',
        message: 'Enter the name of department:',
        when: answers => answers.action == 'Add Department',
        validate: (value) => {
            return value.trim() ? true : 'Please enter a valid department name'
        }
    },
    {
        type: 'input',
        name: 'newRoleTitle',
        message: 'Enter the title for role:',
        when: answers => answers.action == 'Add Role',
        validate: (value) => {
            return value.trim() ? true : 'Please enter a valid role title'
        }
    },
    {
        type: 'input',
        name: 'newRoleSalary',
        message: answers => `Enter the salary for ${answers.newRoleTitle} role:`,
        when: answers => answers.action == 'Add Role',
        validate: (value) => {
            return value.trim() ? true : 'Please enter a valid salary value'
        }
    },
    {
        type: 'list',
        name: 'selectedDepartment',
        message: answers => {
            switch (answers.action) {
                case 'Add Role':
                    return `Please select a department for ${answers.newRoleTitle} role:`;
                case 'Delete Department':
                    return 'Please select a department which you want to remove:';
                case 'View total utilized budget of a department':
                    return 'Please select a department whose total utilized budget you want to view:'
            }
        },
        choices: fetchAllDepartments,
        when: answers => answers.action == 'Add Role' || answers.action == 'Delete Department'
                         || answers.action == 'View total utilized budget of a department',
    },
    {
        type: 'input',
        name: 'employeeFirstName',
        message: 'Enter the first name of employee:',
        when: answers => answers.action == 'Add Employee',
        validate: (value) => {
            return value.trim() ? true : 'Please enter a valid first name'
        }
    },
    {
        type: 'input',
        name: 'employeeLastName',
        message: 'Enter the last name of employee:',
        when: answers => answers.action == 'Add Employee',
        validate: (value) => {
            return value.trim() ? true : 'Please enter a valid last name'
        }
    },
    {
        type: 'list',
        name: 'selectedRole',
        message: answers => {
            switch (answers.action) {
                case 'Delete Role':
                    return 'Please select a role title to delete:';
                case 'Add Employee':
                    return `Please select a role title for ${answers.employeeFirstName}:`;
            }
        },
        choices: fetchAllRoleTitles,
        when: answers => answers.action == 'Add Employee' || answers.action == 'Delete Role',
    },
    {
        type: 'list',
        name: 'employeeManager',
        message: answers => `Please select ${answers.employeeFirstName}'s manager:`,
        choices: getManagerChoiceList,
        default: 'None',
        when: answers => answers.action == 'Add Employee',
    },
    {
        type: 'list',
        name: 'employeeToUpdate',
        message: answers => {
            let whatToUpdate;
            switch (answers.action) {
                case 'Update Employee Role':
                    whatToUpdate = 'role';
                    break;
                case 'Update Employee Manager':
                    whatToUpdate = 'manager';
                    break;
                case 'Delete Employee':
                    return 'Please select the employee to delete:'
            }
            return `Please select employee whose ${whatToUpdate} you want to update:`;

        },
        choices: getEmployeeChoiceList,
        when: answers => answers.action == 'Update Employee Role'
            || answers.action == 'Update Employee Manager' || answers.action == 'Delete Employee',
    },
    {
        type: 'list',
        name: 'newRole',
        message: answers => `Please select ${answers.employeeToUpdate}'s new role:`,
        choices: fetchAllRoleTitles,
        when: answers => answers.action == 'Update Employee Role',
    },
    {
        type: 'list',
        name: 'newManager',
        message: answers => `Please select ${answers.employeeToUpdate}'s new manager:`,
        choices: getManagerChoiceList,
        when: answers => answers.action == 'Update Employee Manager',
    },
    {
        type: 'list',
        name: 'viewByManager',
        message: answers => `Please select manager whose employee you want to view:`,
        choices: getEmployeeChoiceList,
        when: answers => answers.action == 'View Employees By Manager',
    },
];

const continueQuestion = [
    {
        type: 'confirm',
        name: 'continue',
        message: 'Would you like to run another action?',
    }
]

module.exports = {
    questions,
    continueQuestion
}
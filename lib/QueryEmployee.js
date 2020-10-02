const QueryData = require('./QueryData');
const QueryRole = require('./QueryRole');
const chalk = require('chalk');
const cTable = require('console.table');

const queryRole = new QueryRole();
/**
 * holds methods which are relevant for querying employee table.
 */
class QueryEmployee extends QueryData {

    /**
     * adds new employee in database based on input employeeDetail object.
     * @param {holds relevant fields for new employee} employeeDetail 
     */
    async addEmployee(employeeDetail) {
        const roleId = await queryRole.getRoleId(employeeDetail.employeeRoleTitle);
        const managerId = await this.getEmployeeId(employeeDetail.employeeManager);
        const employee = [[employeeDetail.employeeFirstName, employeeDetail.employeeLastName, roleId, managerId]];
        const connection = await this.getConnection();
        try {
            await connection.query(
                "INSERT INTO employee (FIRST_NAME, LAST_NAME, ROLE_ID, MANAGER_ID) VALUES ?", [employee]);
        } finally {
            connection.end();
        }
        console.log(
            chalk.yellow(`Success! Employee was added successfully.`)
        );
    }

    /**
     * splits employeeName to extract firstName and lastName and then query databse using same to
     * fetch primary key of employee table (ID)
     * @param {a string which holds firstName and lastName separated by a whitespace} employeeName 
     */
    async getEmployeeId(employeeName) {
        let employeeId = null;
        if ('None' != employeeName) {
            employeeName = employeeName.split(" ");
            const employee = await this.fetchEmployeeByName(employeeName[0], employeeName[1]);
            employeeId = employee[0].ID;
        }
        return employeeId;
    }

    /**
     * updates employee role based on give details in employeeRoleDetail object.
     * @param {holds fields which are relvant to update employee role} employeeRoleDetail 
     */
    async updateEmployeeRole(employeeRoleDetail) {
        const roleId = await queryRole.getRoleId(employeeRoleDetail.newRole);
        const employeeId = await this.getEmployeeId(employeeRoleDetail.employeeToUpdate);
        await this.updateData("employee", employeeId, "ROLE_ID", roleId);
        console.log(
            chalk.yellow(`Success! ${employeeRoleDetail.employeeToUpdate}'s role was updated.`)
        );
    }

    /**
     * updates employee manager by fetching employee IDs using their names.
     * @param {holds fields which are relvant to update employee manager} employeeDetail 
     */
    async updateEmployeeManager(employeeDetail) {
        const managerId = await this.getEmployeeId(employeeDetail.newManager);
        const employeeId = await this.getEmployeeId(employeeDetail.employeeToUpdate);
        await this.updateData("employee", employeeId, "MANAGER_ID", managerId);
        console.log(
            chalk.yellow(`Success! ${employeeDetail.employeeToUpdate}'s manager was updated.`)
        );
    }

    /**
     * returns all details of employee by joining various tables via fetchEmployeeDetails function
     */
    async viewEmployees() {
        let employees = await this.fetchEmployeeDetails();
        return employees.map(employee => {
            employee.MANAGER = `${employee.MANAGER_FIRST_NAME} ${employee.MANAGER_LAST_NAME}`;
            delete employee.MANAGER_FIRST_NAME;
            delete employee.MANAGER_LAST_NAME;
            return employee;
        });
    }
    /**
     * filters employee view based on given managerName
     * @param {holds details of manager whose employee need to be searched} managerDetail 
     */
    async viewEmployeesByManager(managerDetail) {
        const employees = await this.viewEmployees();
        const filteredEmployees =
            employees.filter(employee => employee.MANAGER == managerDetail.managerName);
        if (filteredEmployees.length)
            console.table(`Employees Reporting To ${managerDetail.managerName}`, filteredEmployees);
        else
            console.log(chalk.yellow(`Sorry. No one currently reports to ${managerDetail.managerName}`));
    }

    /**
     * returns employee data for a give employee firstName and lastNmae.
     * @param {firstName of employee} fName 
     * @param {lastName of employee} lName 
     */
    async fetchEmployeeByName(fName, lName) {
        const connection = await this.getConnection();
        try {
            const queryResponse = await connection.query(
                'SELECT * FROM employee WHERE FIRST_NAME = ? AND LAST_NAME = ?', [fName, lName]);
            return queryResponse;
        } finally {
            connection.end();
        }
    }

    /**
     * joins all three tables(employee, role and department) to create a single view to display
     * all employee details and returns same.
     */
    async fetchEmployeeDetails() {
        const connection = await this.getConnection();
        try {
            const queryResponse = await connection.query(
                `SELECT employee.ID, employee.FIRST_NAME, employee.LAST_NAME,role.TITLE AS TITLE,
            department.NAME AS DEPARTMENT,role.SALARY AS SALARY, emp2.FIRST_NAME AS MANAGER_FIRST_NAME,
            emp2.LAST_NAME AS MANAGER_LAST_NAME
            FROM employee
            JOIN role
            ON employee.ROLE_ID = role.ID
            JOIN department
            ON role.DEPARTMENT_ID = department.ID
            LEFT OUTER JOIN employee emp2
            ON employee.MANAGER_ID = emp2.ID`);
            return queryResponse;
        } finally {
            connection.end();
        }
    }

    /**
     * deletes given employee based on given employeeName.
     * It first fetches employee id using name and then use ID to delete employee.
     * @param {object which holds employeeName which need to be deleted} employee 
     */
    async deleteEmployee(employee) {
        try {
            await this.deleteData("employee", "ID", await this.getEmployeeId(employee.employeeName));
            console.log(chalk.yellow(`${employee.employeeName} removed succesfully`));
        } catch (error) {
            console.log(chalk.yellow(`Unable to delete ${employee.employeeName} employee because of following reason : ${error.sqlMessage}. \nSo, please resolve the error and retry.`));
        }
    }

    /**
     * calculates and displays all employees relevant for given department and sum of salaries of those employees
     * is displayed as total utilized budget for given department.
     * @param {holds departmentName whose utilization budgent need to be calculated} department 
     */
    async viewTotalUtilizedBudget(department) {
        const employeeDetails = await this.viewEmployees();
        const relevantEmployees = employeeDetails.filter(employee => employee.DEPARTMENT == department.departmentName);
        let totalUtilizedBudget = 0;
        relevantEmployees.forEach(employee => {
            totalUtilizedBudget += employee.SALARY;
        });
        if (relevantEmployees.length)
            console.table(`Employee Details of ${department.departmentName} department`, relevantEmployees);
        console.log(chalk.yellow(`Total Utilized Budget For ${department.departmentName} department: ${totalUtilizedBudget}`));
    }

}

module.exports = QueryEmployee;
const QueryData = require('./QueryData');
const chalk = require('chalk');
const cTable = require('console.table');
/**
 * holds methods which are relvant for role table
 */
class QueryDepartment extends QueryData {

    /**
     * returns ID value for given role title
     * @param {roleTitle whose ID need to be returned} roleTitle 
     */
    async getRoleId(roleTitle) {
        const role = await this.fetchData("role", "TITLE", roleTitle);
        return role[0].ID;
    }

    /**
     * first gets the department id based on given departName and then insert a new row in role table
     * for the given role details in input
     * @param {holds relevant fields needed to add a new role} roleDetail 
     */
    async addRole(roleDetail) {
        const department = await this.fetchData("department", "NAME", roleDetail.selectedDepartment);
        const role = [[roleDetail.newRoleTitle, roleDetail.newRoleSalary, department[0].ID]];
        const connection = await this.getConnection();
        try {
            const queryResponse = await connection.query(
                "INSERT INTO role (TITLE, SALARY, DEPARTMENT_ID) VALUES ?", [role]);
            console.log(
                chalk.yellow(`Success! ${department.roleTitle} added successfully`)
            );
        } finally {
            connection.end();
        }
    }

    /**
     * fetches and returns role details by joining role and department table
     */
    async fetchRoleDetails() {
        const connection = await this.getConnection();
        try {
            const queryResponse = await connection.query(
                `SELECT role.ID,role.TITLE,role.SALARY,department.NAME AS DEPARTMENT
             FROM role
             INNER JOIN department
             ON role.DEPARTMENT_ID=department.ID`);
            return queryResponse;
        } finally {
            connection.end();
        }
    }

    /**
     * display all role details.
     */
    async viewRoles() {
        const roles = await this.fetchRoleDetails();
        console.table("Roles Summary", roles);
    }

    /**
     * deletes given role from databse
     * @param {should hold roleTitle field in the object which need to be deleted} role 
     */
    async deleteRole(role) {
        try {
            await this.deleteData("role", "TITLE", role.roleTitle);
            console.log(chalk.yellow(`${role.roleTitle} removed succesfully`));
        } catch (error) {
            console.log(chalk.yellow(`Unable to delete ${role.roleTitle} role because of following reason : ${error.sqlMessage}. \nSo, please resolve the problem and retry.`));
        }

    }
}
module.exports = QueryDepartment;

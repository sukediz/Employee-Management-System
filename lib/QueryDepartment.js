const QueryData = require('./QueryData');
const chalk = require('chalk');

/**
 * holds methods which are relevant for department table.
 */
class QueryDepartment extends QueryData {

    /**
     * should be used to delete specific department based on its name.
     * @param {department object holds departmentName which need to be deleted} department 
     */
    async deleteDepartment(department) {
        try {
            await this.deleteData("department", "NAME", department.departmentName);
            console.log(chalk.yellow(`${department.departmentName} removed succesfully`));
        } catch (error) {
            console.log(chalk.yellow
                (`Unable to delete ${department.departmentName} department because of following reason : ${error.sqlMessage}. \nSo, please resolve the error and retry.`));
        }

    }

    /**
     * adds a specific department whose data is supplied in input object.
     * @param {holds name of new department as newDepartment field in the object} department 
     */
    async addDepartment(department) {
        const connection = await this.getConnection();
        try {
            await connection.query(
                "INSERT INTO department (NAME) VALUES ?", [[[department.newDepartment]]]);
            console.log(
                chalk.yellow(`Success! Department was added successfully.`)
            );
        } finally {
            connection.end();
        }
    }

    /**
     * returns all departments which are currently saved in database.
     */
    async viewDepartment() {
        const departments = await this.fetchData("department", "1", "1");
        return departments;
    }
}
module.exports = QueryDepartment;
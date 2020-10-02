const mysql = require("promise-mysql");
const chalk = require('chalk');
/**
 * exposes generic query methods which can be used to execute various operations on database.
 */
class QueryData {

    /**
     * it creates a database connection object using mysql package.
    */
    async getConnection() {
        return await mysql.createConnection({
            host: "localhost",
            // Your port; if not 3306
            port: 3306,
            // Your username
            user: "root",
            // Your password
            password: "Shane284",
            database: "employee_DB"
        });
    }

    /**
     * runs a select query on given table with given single column filter criteria
     * (filedName and fieldValue) and returns all results.
     * @param {table where query need to run} tableName 
     * @param {table column name based on which data need to be filtered} fieldName 
     * @param {corresponding column value for which data need to be filtered} fieldValue 
     */
    async fetchData(tableName, fieldName, fieldValue) {
        const connection = await this.getConnection();
        try {
            const queryResponse = await connection.query(
                `SELECT * FROM ${tableName} WHERE ${fieldName} = '${fieldValue}'`);
            return queryResponse;
        } finally {
            connection.end();
        }
    }
    /**
     * updates single column value in a given table for a row whose ID is sent.
     * @param {table where query need to run} tableName 
     * @param {value corresponding to ID column of table} Id 
     * @param {database column name whoose value need to be updated} fieldName 
     * @param {new value for the given column by which current value will be overwritten} fieldValue 
     */
    async updateData(tableName, Id, fieldName, fieldValue) {
        const connection = await this.getConnection();
        try {
            const queryResponse = await connection.query(
                `UPDATE ?? SET ?? = ? WHERE ID = ?`, [tableName, fieldName, fieldValue, Id]);
        } finally {
            connection.end();
        }
    }

    /**
     * deletes specific row(s) from given table based on given fieldName and fieldValue.
     * @param {table where query need to run} tableName 
     * @param {given table column name which will be used to determine specific row(s)} fieldName 
     * @param {give table column value which will be used to filter dpecifc rows(s)} fieldValue 
     */
    async deleteData(tableName, fieldName, fieldValue) {
        const connection = await this.getConnection();
        try {
            const queryResponse = await connection.query(
                'DELETE FROM ?? WHERE ?? = ?', [tableName, fieldName, fieldValue]);
        } finally {
            connection.end();
        }
    }
}

module.exports = QueryData;

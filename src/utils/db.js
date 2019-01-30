const { Pool } = require('pg')
var connection;

connection = { connectionString: process.env.DATABASE_URL }
connection.ssl = true;

console.log(`Database Connection: ${JSON.stringify(connection)}`)
var pool = new Pool(connection);

pool.connect();

module.exports = {
    query: (text, params) => pool.query(text, params),
    client: () => pool.connect()
}
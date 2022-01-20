const sql = require("mysql");
const dbConfig = require("../config/db.config.js");

// Create a connection to the database
const connection = sql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pepeguinea33',
  database: 'censolaboral'
});

connection.connect(error => {
  if (error) throw error;
  console.log("Se ha conectado correctamente a la base de datos.");
});

module.exports = connection;
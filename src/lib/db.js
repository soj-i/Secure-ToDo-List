const mysql = require('mysql2');
require("dotenv").config()

export const getDatabase = () => {
  const db = mysql.createConnection({
    multipleStatements: true,
    host     : process.env.DB_HOST,
    port     : 3306,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
  });

  return db;
};

export const closeDBInstance = (db) => {
  db.end();
};
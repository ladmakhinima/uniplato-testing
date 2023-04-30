const mysql = require("mysql");
const cmd = require("child_process");
const { exit } = require("process");
const bcrypt = require("bcrypt");
require("dotenv").config();

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const dbname = process.env.DB_NAME;

// CREATE CONNECT BETWEEN APP AND MYSQL
const db = mysql.createConnection({
  host,
  port,
  user,
  password,
});

// CONNECT TO MYSQL
db.connect((err) => {
  // CHECK IS DATABASE EXIST
  db.query(`SHOW DATABASES like '${dbname}'`, (_, database) => {
    // IF EXIST RETURN ERROR
    if (database.length > 0) {
      throw new Error("Database Exist");
    } else {
      // CREATE DATABASE BASED ON DATABASE NAME
      db.query(`CREATE DATABASE ${dbname}`);
      // EXECUTE AND INJECT PRISMA CONFIG INTO DATABASE
      cmd.exec(
        "npx prisma migrate dev --name init",
        (err, st, stder) => {
          // SELECT CREATED DATABASE
          db.query(`use ${dbname}`, () => {
            // ADD SOME DEFAULT DATA INTO DATABASE
            db.query(
              `INSERT INTO users (id, email, password, role, updatedAt) VALUES (1, 'hosein@gmail.com', '${bcrypt.hashSync(
                "123456789",
                8
              )}', 'ADMIN', NOW());`
            );
            db.query("INSERT INTO categories VALUES (1, 'bar', 1);");
            db.query("INSERT INTO categories VALUES (2, 'baz', 2);");
            db.query(
              "INSERT INTO categories VALUES (3, 'foo', 3);",
              () => {
                // EXIT FROM APP
                exit(1);
              }
            );
          });
        }
      );
    }
  });
});

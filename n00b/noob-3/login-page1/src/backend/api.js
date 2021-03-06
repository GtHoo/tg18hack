const express = require('express')
const jwt = require('jsonwebtoken')
const path = require('path')
const md5 = require('md5');
const constants = require('./constants').constants;
const flag = require('./constants').flag;
const sqlite3 = require('sqlite3').verbose();

const app = express();
const apiRoutes = express.Router();

apiRoutes.get('/health', (req, res) => {
	res.status(200).send("Server working..");
})

apiRoutes.post('/login', (req, res) => {
	console.log("body: ", req.body);
	const username = req.body.username;
	const password = req.body.password;

	sql_query = "SELECT * from users WHERE username = '" + username + 
				"' and password = '" + md5(password) + "';";
	console.log("sql: " + sql_query);

    let db = new sqlite3.Database("../../../db/users.db", (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to DB!");
    });

    db.all(sql_query, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500);
            return;
        }

        console.log(rows);
        console.log(rows.length);
        // something fishy
        if (rows.length == 0) {
            if (username == "admin")
                res.status(401).send({msg: "Nice try!"});
            else
                res.status(200).send({msg: "<h1>Welcome, " + username + "!</h1>"});
            return;
        } else if (rows.length != 1) {
            res.status(401).send({msg: "Nice try!"});
            return;
        }

        row = rows[0];
        console.log(row);

        id = row.id;
        console.log("id yo: " + id.toString());
        // admin
        if (id == 0)
            res.status(200).send({msg: "<h1>Nice work! Here is your flag:</h1> <br><h2>" + flag + "</h2>"});
    });

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Closed db connection.");
    });
})

module.exports = apiRoutes;

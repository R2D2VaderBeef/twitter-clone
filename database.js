const mysql = require('mysql2');
const connection = mysql.createConnection(process.env.DATABASE_URL);

module.exports = {
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM users;',
                function(err, results, fields) {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
    },
    addNewUser: (handle, salt, hash) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'INSERT INTO users (handle, salt, hash) VALUES (?, ?, ?);',
                [handle, salt, hash],
                function(err, results, fields) {
                  if (err) reject(err);
                  else resolve("ok");
                }
              );
        })
    },
    getUser: (handle) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'SELECT * FROM users WHERE handle = ?;',
                [handle],
                function(err, results, fields) {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
    },
    setUserBio: (handle, newbio) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'UPDATE users SET bio = ? WHERE handle = ?;',
                [newbio, handle],
                function(err, results, fields) {
                    if (err) reject(err);
                    else resolve("ok");
                }
            );
        });
    },
    saveNewPoop: (handle, poop, timestamp) => {
        return new Promise((resolve, reject) => {
            connection.execute(
                'INSERT INTO posts (handle, content, timestamp) VALUES (?, ?, ?)',
                [handle, poop, timestamp],
                function(err, results, fields) {
                    if (err) reject(err);
                    else {
                        connection.execute(
                            `SELECT LAST_INSERT_ID()`,
                            function (err2, results2, fields2) {
                                if (err2) reject(err2);
                                else resolve(results2);
                            }
                        )
                    }
                }
            );
        });
    }
}
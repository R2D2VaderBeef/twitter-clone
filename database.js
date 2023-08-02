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
            connection.query(
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
            connection.query(
                'UPDATE users SET bio = ? WHERE handle = ?;',
                [newbio, handle],
                function(err, results, fields) {
                    if (err) reject(err);
                    else resolve("ok");
                }
            );
        });
    }
}
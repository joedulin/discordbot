var mysql = require('mysql');
module.exports = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'discord',
	password: 'kimmi had better thank me',
	database: 'discord'
});

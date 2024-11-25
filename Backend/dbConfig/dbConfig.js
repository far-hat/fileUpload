const sql = require('mssql');

var config = {
    user: 'aamina',
    password : 'asiyadua2',
    server: 'AAMINA',
    database: 'ImageDB',
    port: 1433,
    trustServerCertificate: true
    
    
};



const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => console.error('Database Connection Failed', err));



module.exports = { sql, poolPromise};



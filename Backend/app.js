const express = require('express');
const multer= require('multer');
const bodyParser= require('body-parser');
const cors= require('cors');
const path= require('path');
const {sql, poolPromise}= require('./dbConfig/dbConfig');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads'));

// Multer Storage configuration
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000000},
});

// 1mb = 1000000

// Upload API
app.post('/upload', upload.single('myFile'),
    async(req, res) => {
        const {name} = req.body;
        const filePath = req.file ? req.file.path : null;

        if(!name || !filePath) {
            return res.status(400).json({error: 'Name and file are reqiured'});
        }

        try {
            const pool = await poolPromise;
            await pool.request()
                .input('name', sql.NVarChar, name)
                .input('path', sql.NVarChar, filePath)
                .query('INSERT INTO Images(name, path) VALUES (@name, @path)');

            res.json({message: 'FIle uploaded successfully'})
        } catch(error) {
            console.error(error)
            res.status(500).json({error: 'Database error'})
        }
});

    
// Retrieve API
app.get('/retrieve/:name', async(req, res) => {
    const {name} = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .query('SELECT path FROM Images WHERE name = @name');

            if(result.recordset.length === 0){
                return res.status(404).json({ error: 'Image not found' });
            }

            res.json({ path: result.recordset[0].path });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Database error' });
        }
});


app.get('/', async function (req, res) {

try {
    const pool = await poolPromise;   
    const result = await pool.request()   
        .query('select * from Images'); 
    console.log(result);
    return res.json(result)
} catch (error) {
    console.log(error)
    return res.json(error)
}
});


// start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));   

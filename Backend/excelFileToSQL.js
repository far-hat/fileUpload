const sql = require('mssql');
const xlsx = require('xlsx');
const path = require('path');

const express = require('express');
const bodyParser= require('body-parser');


const app = express();
app.use(bodyParser.json());

// SQL Server configuration
const dbConfig = {
    user: 'admin',
    password: 'Incorrect@123',
    server: 'LAPTOP2',
    database: 'ImageDB',
    port: 1433,
    trustServerCertificate: true
    
};

// Path to the Excel file
const excelFilePath = path.join(__dirname,'student.xlsx' );

// Read Excel file
const workbook = xlsx.readFile(excelFilePath);
const sheetName = workbook.SheetNames[0]; // Get the first sheet
const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Convert the sheet to JSON
const data = xlsx.utils.sheet_to_json(sheetData);


// Function to insert data into SQL Server
const insertData = async (data) => {
    try {
        // Connect to SQL Server
        const pool = await sql.connect(dbConfig);

        // Iterate through the data and insert each row
        for (let row of data) {
            await pool.request()
                .input('ProjectName', sql.NVarChar, row['ProjectName'])
                .input('CentreName', sql.NVarChar, row['CentreName'])
                .input('CourseName', sql.NVarChar, row['CourseName'])
                .input('ReferenceNumber', sql.NVarChar, row['ReferenceNumber'])
                .input('StudentName', sql.NVarChar, row['StudentName'])
                .input('FathersName', sql.NVarChar, row["Father/GuardianName"])
                .input('DateOfBirth', sql.Date, row['DateOfBirth'])
                .input('Gender', sql.NVarChar, row['Gender'])
                .input('Category', sql.NVarChar, row['Category'])
                .input('EWS', sql.Bit, row['EWS'])
                .input('District', sql.NVarChar, row['District'])
                .input('StateName', sql.NVarChar, row['State'])
                .input('TPName', sql.NVarChar, row['TPName'])
                .input('BatchNameCode', sql.NVarChar, row['BatchNameCode'])
                .input('BatchFrom', sql.Date, row['BatchFrom'])
                .input('BatchTo', sql.Date, row['BatchTo'])
                .input('CompletionStatus', sql.NVarChar, row['Status'])
                .query(
                    `INSERT INTO Students2 (
                        ProjectName, CentreName, CourseName, ReferenceNumber, StudentName, FathersName, 
                        DateOfBirth, Gender, Category, EWS, District, StateName, TPName, 
                        BatchNameCode, BatchFrom, BatchTo, CompletionStatus
                    ) VALUES (
                        @ProjectName, @CentreName, @CourseName, @ReferenceNumber, @StudentName, @FathersName, 
                        @DateOfBirth, @Gender, @Category, @EWS, @District, @StateName, @TPName, 
                        @BatchNameCode, @BatchFrom, @BatchTo, @CompletionStatus
                    )`
                );
        }

        console.log('Data inserted successfully.');
        pool.close();
    } catch (error) {
        console.error('Error inserting data:', error);
    }
};

// Start the data import
insertData(sheetData);

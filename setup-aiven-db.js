const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupAivenDatabase() {
    try {
        // Aiven database config
        const dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT),
            ssl: { rejectUnauthorized: false }
        };

        console.log('Connecting to Aiven MySQL...');
        console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
        console.log(`Database: ${dbConfig.database}`);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Read schema file
        let schemaSQL = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
        
        // Remove CREATE DATABASE and USE statements
        schemaSQL = schemaSQL.replace(/CREATE DATABASE IF NOT EXISTS kost_professional;/g, '');
        schemaSQL = schemaSQL.replace(/USE kost_professional;/g, '');
        
        // Split by CREATE TABLE, CREATE INDEX patterns
        const createTableRegex = /(CREATE TABLE[\s\S]*?\);)/gi;
        const createIndexRegex = /(CREATE INDEX[\s\S]*?;)/gi;
        
        const tables = schemaSQL.match(createTableRegex) || [];
        const indexes = schemaSQL.match(createIndexRegex) || [];
        
        console.log(`Found ${tables.length} CREATE TABLE statements`);
        console.log(`Found ${indexes.length} CREATE INDEX statements`);
        
        // Execute CREATE TABLE statements first
        for (let i = 0; i < tables.length; i++) {
            try {
                const tableName = tables[i].match(/CREATE TABLE (\w+)/i)[1];
                console.log(`Creating table ${i + 1}/${tables.length}: ${tableName}...`);
                await connection.execute(tables[i]);
            } catch (error) {
                console.error(`Error creating table ${i + 1}:`, error.message);
            }
        }
        
        // Execute CREATE INDEX statements
        for (let i = 0; i < indexes.length; i++) {
            try {
                console.log(`Creating index ${i + 1}/${indexes.length}...`);
                await connection.execute(indexes[i]);
            } catch (error) {
                console.error(`Error creating index ${i + 1}:`, error.message);
            }
        }
        
        // Execute seed data
        console.log('\nExecuting seed data...');
        const seedSQL = fs.readFileSync(path.join(__dirname, 'database/seed.sql'), 'utf8');
        
        // Split INSERT statements properly
        const insertRegex = /(INSERT INTO[\s\S]*?\);)/gi;
        const inserts = seedSQL.match(insertRegex) || [];
        
        console.log(`Found ${inserts.length} INSERT statements`);
        
        for (let i = 0; i < inserts.length; i++) {
            try {
                const tableName = inserts[i].match(/INSERT INTO (\w+)/i)[1];
                console.log(`Inserting into ${tableName} (${i + 1}/${inserts.length})...`);
                await connection.execute(inserts[i]);
            } catch (error) {
                console.error(`Error inserting data ${i + 1}:`, error.message);
            }
        }
        
        console.log('\n✅ Aiven database setup completed successfully!');
        await connection.end();
        
    } catch (error) {
        console.error('❌ Aiven database setup failed:', error);
        process.exit(1);
    }
}

setupAivenDatabase();
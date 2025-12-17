const mysql = require('mysql2/promise');
const fs = require('fs');

async function importDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: true }
    });

    try {
        // Import schema
        const schema = fs.readFileSync('./database/schema.sql', 'utf8');
        const schemaQueries = schema.split(';').filter(q => q.trim());
        
        for (const query of schemaQueries) {
            if (query.trim()) {
                await connection.execute(query);
            }
        }

        // Import seed data
        const seed = fs.readFileSync('./database/seed.sql', 'utf8');
        const seedQueries = seed.split(';').filter(q => q.trim());
        
        for (const query of seedQueries) {
            if (query.trim()) {
                await connection.execute(query);
            }
        }

        console.log('Database imported successfully!');
    } catch (error) {
        console.error('Import error:', error);
    } finally {
        await connection.end();
    }
}

importDatabase();
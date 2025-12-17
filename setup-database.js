const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🔄 Connecting to MySQL...');
        
        // Connect to MySQL without specifying database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });
        
        console.log('✅ Connected to MySQL successfully!');
        
        // Read and execute the complete database setup
        const sqlFile = path.join(__dirname, 'database', 'complete-database.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('🔄 Setting up database and tables...');
        await connection.execute(sqlContent);
        
        console.log('✅ Database setup completed successfully!');
        console.log('');
        console.log('📊 Database Summary:');
        console.log('- Database: kost_professional');
        console.log('- Admin login: admin@kostapp.com / admin123');
        console.log('- Sample users created with password: user123');
        console.log('- All rooms are available for booking');
        console.log('');
        console.log('🚀 You can now start the application with: npm start');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the setup
setupDatabase();
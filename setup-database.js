const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🔄 Connecting to MySQL...');
        
        // First connect without database to create it if needed
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });
        
        console.log('✅ Connected to MySQL');
        
        // Create database if not exists
        await connection.execute('CREATE DATABASE IF NOT EXISTS kost_professional');
        console.log('✅ Database created/verified');
        
        // Switch to the database
        await connection.execute('USE kost_professional');
        
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('🔄 Creating tables...');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await connection.execute(schema);
            console.log('✅ Tables created');
        }
        
        // Read and execute reset-and-seed
        const seedPath = path.join(__dirname, 'database', 'reset-and-seed.sql');
        if (fs.existsSync(seedPath)) {
            console.log('🔄 Seeding database with rooms...');
            const seedData = fs.readFileSync(seedPath, 'utf8');
            
            // Split by semicolon and execute each statement
            const statements = seedData.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    try {
                        await connection.execute(statement);
                    } catch (err) {
                        if (!err.message.includes('Duplicate entry')) {
                            console.warn('Warning:', err.message);
                        }
                    }
                }
            }
            console.log('✅ Database seeded with 35 rooms');
        }
        
        // Verify the setup
        const [roomCount] = await connection.execute('SELECT COUNT(*) as count FROM rooms');
        const [roomTypeCount] = await connection.execute('SELECT COUNT(*) as count FROM room_types');
        
        console.log(`✅ Setup complete!`);
        console.log(`   - Room types: ${roomTypeCount[0].count}`);
        console.log(`   - Total rooms: ${roomCount[0].count}`);
        console.log(`   - Ready to use!`);
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Please make sure MySQL is running:');
            console.log('   - Start XAMPP/WAMP/MAMP');
            console.log('   - Or start MySQL service manually');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Load environment variables
require('dotenv').config();

// Run setup
setupDatabase();
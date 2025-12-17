#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 KostPro Auto Deploy Script');
console.log('===============================');

// Check if git is initialized
try {
    execSync('git status', { stdio: 'ignore' });
} catch (error) {
    console.log('📦 Initializing Git...');
    execSync('git init');
    execSync('git add .');
    execSync('git commit -m "Initial commit for KostPro"');
}

// Create deployment files
console.log('📝 Creating deployment files...');

// Create Vercel config
const vercelConfig = {
    "version": 2,
    "builds": [
        {
            "src": "app.js",
            "use": "@vercel/node"
        }
    ],
    "routes": [
        {
            "src": "/images/(.*)",
            "dest": "/images/$1"
        },
        {
            "src": "/(.*)",
            "dest": "/app.js"
        }
    ],
    "env": {
        "NODE_ENV": "production"
    }
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

// Create production environment template
const prodEnv = `# Production Environment Variables
# Copy these to your hosting platform:

DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=kost_professional
SESSION_SECRET=kost-pro-production-secret-2024
NODE_ENV=production
PORT=3000`;

fs.writeFileSync('.env.production.template', prodEnv);

// Create deployment guide
const deployGuide = `# 🚀 KostPro Deployment Guide

## Quick Deploy Options:

### Option 1: Vercel + RemoteMySQL (Recommended)
1. Go to https://remotemysql.com/ - Create free MySQL database
2. Import your database/schema.sql and database/seed.sql
3. Go to https://vercel.com/ - Connect this GitHub repo
4. Set environment variables in Vercel dashboard
5. Deploy!

### Option 2: Render (All-in-One)
1. Go to https://render.com/
2. Create PostgreSQL database (free)
3. Create Web Service from GitHub
4. Set environment variables
5. Deploy!

### Option 3: Railway Alternative
1. Go to https://fly.io/
2. Install flyctl CLI
3. Run: flyctl launch
4. Add PostgreSQL database
5. Deploy!

## Environment Variables Needed:
- DB_HOST
- DB_USER  
- DB_PASSWORD
- DB_NAME
- SESSION_SECRET
- NODE_ENV=production

## Database Setup:
Import these files to your MySQL database:
- database/schema.sql
- database/seed.sql

## Admin Login:
- Email: admin
- Password: admin123
`;

fs.writeFileSync('DEPLOYMENT.md', deployGuide);

console.log('✅ Deployment files created!');
console.log('📖 Read DEPLOYMENT.md for hosting instructions');
console.log('🔧 Use .env.production.template for environment variables');

// Add and commit new files
try {
    execSync('git add .');
    execSync('git commit -m "Add deployment configuration"');
    console.log('✅ Files committed to git');
} catch (error) {
    console.log('ℹ️  Files already up to date');
}

console.log('\n🎉 Ready for deployment!');
console.log('Next steps:');
console.log('1. Push to GitHub: git push origin main');
console.log('2. Choose hosting platform from DEPLOYMENT.md');
console.log('3. Follow the guide for your chosen platform');
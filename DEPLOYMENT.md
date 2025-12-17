# 🚀 KostPro Deployment Guide

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

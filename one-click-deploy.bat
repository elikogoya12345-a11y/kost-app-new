@echo off
echo 🚀 KostPro One-Click Deploy
echo ===========================
echo.

echo 📦 Running deployment preparation...
node deploy.js

echo.
echo 🌐 Opening deployment options...
start https://vercel.com/
start https://render.com/
start https://remotemysql.com/

echo.
echo ✅ Deployment preparation complete!
echo 📖 Check DEPLOYMENT.md for detailed instructions
echo.
pause
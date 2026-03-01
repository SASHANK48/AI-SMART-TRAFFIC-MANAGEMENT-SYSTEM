@echo off
echo =======================================================
echo    Stopping Traffic Management System
echo =======================================================
echo.
echo Stopping all Node.js and Vite server processes...
taskkill /F /IM node.exe
echo.
echo =======================================================
echo    Servers successfully stopped!
echo =======================================================
pause

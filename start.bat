@echo off
echo =======================================================
echo    Starting Traffic Management System (Full Stack)
echo =======================================================

echo.
echo [1/3] Installing root dependencies...
call npm install

echo.
echo [2/3] Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo [3/3] Installing frontend dependencies...
cd project
call npm install
cd ..

echo.
echo =======================================================
echo    All setup complete. Starting both servers...
echo =======================================================
call npm run dev

pause

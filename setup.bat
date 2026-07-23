@echo off
echo ================================================
echo   DAFA Glass Manager - Setup Script
echo ================================================
echo.

echo [1/5] Starting PostgreSQL with Docker...
docker compose up -d
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker failed. Make sure Docker Desktop is running.
    pause
    exit /b 1
)

echo.
echo [2/5] Waiting for database to be ready...
timeout /t 5 /nobreak > nul

echo.
echo [3/5] Running Prisma migrations...
call npx prisma migrate dev --name init
if %ERRORLEVEL% neq 0 (
    echo Trying db push instead...
    call npx prisma db push
)

echo.
echo [4/5] Seeding database with demo data...
call npx prisma db seed

echo.
echo [5/5] Starting development server...
echo.
echo ================================================
echo   Setup complete! Opening http://localhost:3000
echo ================================================
echo.
echo   Login credentials:
echo   Email:    admin@dafaglass.com
echo   Password: dafa2024
echo.
echo ================================================
start http://localhost:3000
call npm run dev

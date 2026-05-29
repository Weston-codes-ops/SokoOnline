@echo off
REM Local Development Setup Script for SokoOnline (Windows)

echo === SokoOnline Local Setup (Windows) ===
echo.

REM Check Node version
echo Checking Node.js version...
node --version >nul 2>&1 || (
    echo Node.js not installed. Please install Node 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo %%i
echo.

REM Check Java version
echo Checking Java version...
java -version >nul 2>&1 || (
    echo Java not installed. Please install Java 17+
    exit /b 1
)
echo Java is installed ✓
echo.

REM Check Maven
echo Checking Maven...
mvn --version >nul 2>&1 || (
    echo Maven not installed
    exit /b 1
)
echo Maven is installed ✓
echo.

REM Setup frontend
echo Setting up frontend...
cd sokoonline-frontend
call npm install
echo Frontend dependencies installed ✓
cd ..
echo.

REM Build backend
echo Building backend...
call mvn clean package -DskipTests
echo Backend built ✓
echo.

REM Test Docker build (optional)
set /p DOCKER_BUILD="Do you want to test the Docker build? (y/n): "
if /i "%DOCKER_BUILD%"=="y" (
    echo Building Docker image...
    docker build -t sokoonline:latest .
    echo Docker build successful ✓
)

echo.
echo === Local Testing Complete ===
echo.
echo To run locally:
echo 1. Start PostgreSQL (or skip for dev)
echo 2. Update .env with local database credentials
echo 3. Terminal 1: mvn spring-boot:run
echo 4. Terminal 2: cd sokoonline-frontend ^&^& npm run dev
echo.
echo Then visit: http://localhost:5173
pause

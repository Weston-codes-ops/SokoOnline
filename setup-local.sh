#!/bin/bash

# Local Development Setup Script for SokoOnline
# This script helps you test locally before deploying to Render

echo "=== SokoOnline Local Setup ==="
echo ""

# Check Node version
echo "Checking Node.js version..."
node --version || { echo "Node.js not installed. Please install Node 18+"; exit 1; }
echo ""

# Check Java version
echo "Checking Java version..."
java -version || { echo "Java not installed. Please install Java 17+"; exit 1; }
echo ""

# Check Maven
echo "Checking Maven..."
mvn --version || { echo "Maven not installed"; exit 1; }
echo ""

# Setup frontend
echo "Setting up frontend..."
cd sokoonline-frontend
npm install
echo "Frontend dependencies installed ✓"
cd ..
echo ""

# Build backend
echo "Building backend..."
mvn clean package -DskipTests
echo "Backend built ✓"
echo ""

# Test Docker build (optional)
read -p "Do you want to test the Docker build? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Building Docker image..."
    docker build -t sokoonline:latest .
    echo "Docker build successful ✓"
fi

echo ""
echo "=== Local Testing Complete ==="
echo ""
echo "To run locally:"
echo "1. Start PostgreSQL (or skip for dev)"
echo "2. Update .env with local database credentials"
echo "3. Terminal 1: mvn spring-boot:run"
echo "4. Terminal 2: cd sokoonline-frontend && npm run dev"
echo ""
echo "Then visit: http://localhost:5173"

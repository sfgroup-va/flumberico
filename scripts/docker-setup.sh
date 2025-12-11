#!/bin/bash

# Docker Setup Script for Next.js Job Board
# This script sets up the complete Docker development environment

set -e

echo "🐳 Setting up Docker environment for Next.js Job Board..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_success "Created .env file from template"
    print_warning "Please update the .env file with your actual configuration"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Remove existing volumes if reset is requested
if [ "$1" = "--reset" ]; then
    print_warning "Removing existing Docker volumes (this will delete all data)..."
    docker-compose down -v
    print_success "Docker volumes removed"
fi

# Start database services
print_status "Starting PostgreSQL and Redis containers..."
docker-compose up -d postgres redis

# Wait for database to be ready
print_status "Waiting for database to be ready..."
npm run wait-for-db

# Run database migrations
print_status "Running database migrations..."
npm run db:migrate:docker

# Seed the database
print_status "Seeding database with sample data..."
npm run seed:docker

# Start Adminer (database management tool)
print_status "Starting database management tool (Adminer)..."
docker-compose --profile tools up -d adminer

print_success "🎉 Docker setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the development server: npm run dev:docker"
echo "   2. Open your browser to: http://localhost:3000"
echo "   3. Manage database at: http://localhost:8080 (Adminer)"
echo "   4. View Prisma Studio: npm run db:studio:docker"
echo ""
echo "🔧 Useful commands:"
echo "   - Stop containers: npm run docker:down"
echo "   - View logs: npm run docker:logs"
echo "   - Reset database: npm run docker:reset"
echo "   - Run migrations: npm run db:migrate:docker"
echo ""
echo "📊 Database credentials:"
echo "   - Host: localhost"
echo "   - Port: 5432"
echo "   - Database: flumbericoco_db"
echo "   - Username: flumbericoco_user"
echo "   - Password: flumbericoco_password"
echo ""
echo "🚀 Happy coding!"
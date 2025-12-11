#!/bin/bash

# Docker Data Backup Script
# This script backs up existing PostgreSQL data before migrating to Docker

set -e

echo "💾 PostgreSQL Data Backup Script"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/flumbericoco_backup_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_status "Creating PostgreSQL backup..."

# Check if PostgreSQL is running locally
if command -v pg_dump &> /dev/null; then
    # Try to dump from local PostgreSQL
    print_status "Attempting to backup from local PostgreSQL..."

    # Extract connection info from current .env if it exists
    if [ -f .env ]; then
        source .env
        # Parse the database URL
        if [[ $POSTGRES_PRISMA_URL == postgresql://* ]]; then
            # Extract connection parameters
            DB_URL=$(echo $POSTGRES_PRISMA_URL | sed 's/postgresql:\/\///')
            DB_USER=$(echo $DB_URL | cut -d':' -f1)
            DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
            DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
            DB_PORT=$(echo $DB_URL | cut -d':' -f4 | cut -d'\/' -f1)
            DB_NAME=$(echo $DB_URL | cut -d'\/' -f2 | cut -d'?' -f1)

            print_status "Connecting to: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

            # Set PGPASSWORD environment variable for pg_dump
            export PGPASSWORD="$DB_PASS"

            # Create backup
            if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
                print_success "✅ Backup created: $BACKUP_FILE"
                echo "   File size: $(du -h "$BACKUP_FILE" | cut -f1)"
            else
                print_warning "Could not backup from local PostgreSQL"
            fi

            unset PGPASSWORD
        fi
    fi
else
    print_warning "pg_dump not found. Skipping local PostgreSQL backup"
fi

# Also backup using Prisma if available
if command -v npx &> /dev/null && [ -f "prisma/schema.prisma" ]; then
    print_status "Creating Prisma backup..."

    PRISMA_BACKUP="${BACKUP_DIR}/flumbericoco_prisma_backup_${TIMESTAMP}.sql"

    if npx prisma db push --accept-data-loss 2>/dev/null && npx prisma db export --schema-only > "$PRISMA_BACKUP" 2>/dev/null; then
        print_success "✅ Prisma schema backup: $PRISMA_BACKUP"
    else
        print_warning "Could not create Prisma backup"
    fi
fi

# Create a simple backup instruction file
cat > "${BACKUP_DIR}/README_${TIMESTAMP}.txt" << EOF
Flumbericoco Database Backup
Generated: $(date)

Backup Files:
- SQL Backup: $BACKUP_FILE
- Prisma Schema: $(ls ${BACKUP_DIR}/*prisma*${TIMESTAMP}* 2>/dev/null || echo "Not available")

To restore this backup:
1. Start Docker containers: docker-compose up -d
2. Wait for database: npm run wait-for-db
3. Restore SQL: psql -h localhost -p 5432 -U flumbericoco_user -d flumbericoco_db < $BACKUP_FILE

Database Configuration:
- Host: localhost
- Port: 5432
- Database: flumbericoco_db
- Username: flumbericoco_user
- Password: flumbericoco_password
EOF

print_success "🎉 Backup process completed!"
echo ""
echo "📁 Backup location: $BACKUP_DIR"
echo "📄 Backup files created:"
ls -la "$BACKUP_DIR" | grep "$TIMESTAMP"
echo ""
print_warning "Please store these backups safely before proceeding with Docker migration."
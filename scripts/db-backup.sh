#!/bin/bash

# =========================================================================
# Nova Wood — Production MySQL Database Backup & Restore Automation
# =========================================================================

# Load env variables if .env file exists
if [ -f .env ]; then
  export $(echo $(grep -v '^#' .env | xargs) | envsubst)
fi

DB_USER="u951829634_user"
DB_PASS="SecureDBPassword"
DB_NAME="u951829634_nova_wood"
BACKUP_DIR="./backups"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${DATE}.sql"

show_help() {
  echo "Usage: $0 {backup|restore <backup_file_path>}"
  echo "  backup  : Creates a gzipped sql dump of the MySQL database"
  echo "  restore : Restores the database from a given SQL backup file path"
}

backup_db() {
  echo "🔄 Starting MySQL backup for database: $DB_NAME..."
  mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "${BACKUP_FILE}.gz"
  
  if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "📁 Backup saved as: ${BACKUP_FILE}.gz"
  else
    echo "❌ Error: MySQL dump failed"
    exit 1
  fi
}

restore_db() {
  FILE=$1
  if [ -z "$FILE" ]; then
    echo "❌ Error: Missing backup file path argument."
    show_help
    exit 1
  fi

  if [ ! -f "$FILE" ]; then
    echo "❌ Error: Backup file not found at path: $FILE"
    exit 1
  fi

  echo "🔄 Restoring database: $DB_NAME from backup: $FILE..."
  
  # Check if file is gzipped
  if [[ "$FILE" == *.gz ]]; then
    gunzip -c "$FILE" | mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME"
  else
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$FILE"
  fi

  if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
  else
    echo "❌ Error: Database restoration failed"
    exit 1
  fi
}

case "$1" in
  backup)
    backup_db
    ;;
  restore)
    restore_db "$2"
    ;;
  *)
    show_help
    ;;
esac

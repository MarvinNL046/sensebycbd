#!/usr/bin/env node

/**
 * Script to create a new Supabase migration file
 * Usage: node scripts/create-migration.js migration_name
 */

const fs = require('fs');
const path = require('path');

// Get migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: Migration name is required');
  console.error('Usage: node scripts/create-migration.js migration_name');
  process.exit(1);
}

// Create timestamp for migration file name
const now = new Date();
const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');

// Create migration file name
const fileName = `${timestamp}_${migrationName}.sql`;
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const filePath = path.join(migrationsDir, fileName);

// Create migrations directory if it doesn't exist
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Template for migration file
const template = `-- Migration: ${migrationName}
-- Created at: ${now.toISOString()}
-- Description: 
-- [Add a description of what this migration does]

-- Write your SQL statements here
-- Example:
-- CREATE TABLE example (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Don't forget to add Row Level Security (RLS) policies if needed
-- Example:
-- ALTER TABLE example ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view their own examples"
--   ON example
--   FOR SELECT
--   USING (auth.uid() = user_id);
`;

// Write template to file
fs.writeFileSync(filePath, template);

console.log(`Migration file created: ${filePath}`);
console.log('You can now edit this file to add your SQL statements.');

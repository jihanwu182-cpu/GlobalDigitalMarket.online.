require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,

  host: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_HOST,

  port: process.env.DATABASE_URL
    ? undefined
    : Number(process.env.DB_PORT || 5432),

  database: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_NAME,

  user: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_USER,

  password: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_PASSWORD,

  ssl:
    process.env.DATABASE_URL || process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const runMigrations = async () => {
  try {
    console.log('Running database migrations...');

    const sqlFile = path.join(__dirname, '001_initial_schema.sql');

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Migration file not found: ${sqlFile}`);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');

    await pool.query(sql);

    console.log('✅ Database migrations completed successfully!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);

    await pool.end();
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;

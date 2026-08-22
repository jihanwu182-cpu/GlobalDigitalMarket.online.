const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Seed Market Data
    const symbols = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    ];

    for (const stock of symbols) {
      await pool.query(
        `INSERT INTO market_data (symbol, name, current_price, previous_close, open_price, high_price, low_price, volume, market_cap)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (symbol) DO NOTHING`,
        [
          stock.symbol,
          stock.name,
          Math.random() * 300 + 50,
          Math.random() * 300 + 50,
          Math.random() * 300 + 50,
          Math.random() * 300 + 50,
          Math.random() * 300 + 50,
          Math.floor(Math.random() * 100000000),
          Math.floor(Math.random() * 1000000000000),
        ]
      );
    }

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

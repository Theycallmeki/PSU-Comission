require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('=== TABLES IN DATABASE ===');
    console.log(tables.rows);

    for (const t of tables.rows) {
      const cols = await pool.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
        [t.table_name]
      );
      console.log(`\n=== Columns for "${t.table_name}" ===`);
      console.log(cols.rows);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkSchema();

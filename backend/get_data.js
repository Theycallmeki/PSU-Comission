require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getData() {
  try {
    const enrollments = await pool.query('SELECT * FROM enrollments ORDER BY school_year ASC');
    const classrooms = await pool.query('SELECT * FROM classrooms');
    
    console.log('--- ENROLLMENTS ---');
    console.log(JSON.stringify(enrollments.rows, null, 2));
    
    console.log('\n--- CLASSROOMS ---');
    console.log(JSON.stringify(classrooms.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

getData();

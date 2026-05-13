const db = require('./config/db');
require('dotenv').config();

async function checkData() {
  try {
    const enrollments = await db.query('SELECT * FROM enrollments ORDER BY school_year DESC');
    const classrooms = await db.query('SELECT * FROM classrooms');
    
    console.log('--- ENROLLMENTS ---');
    console.table(enrollments.rows.map(r => ({
      year: r.school_year,
      total: r.total_enrollees,
      dropped: r.dropped_repeater,
      kinder: r.kinder_total,
      g1: r.grade1_total,
      g6: r.grade6_total
    })));
    
    console.log('--- CLASSROOMS ---');
    console.table(classrooms.rows);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();

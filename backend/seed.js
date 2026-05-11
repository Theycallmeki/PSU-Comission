require('dotenv').config();
const { Pool } = require('pg');
const xlsx = require('xlsx');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  try {
    console.log('Connecting to database...');

    // ==========================================
    // 1. DROP EXISTING TABLES (fresh start)
    // ==========================================
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query('DROP TABLE IF EXISTS enrollments CASCADE');
    await pool.query('DROP TABLE IF EXISTS classrooms CASCADE');
    console.log('Dropped existing tables (if any).');

    // ==========================================
    // 2. CREATE TABLES
    // ==========================================
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created "users" table.');

    await pool.query(`
      CREATE TABLE enrollments (
        id SERIAL PRIMARY KEY,
        school_year VARCHAR(20) NOT NULL,
        kinder_f INTEGER DEFAULT 0,
        kinder_m INTEGER DEFAULT 0,
        kinder_total INTEGER DEFAULT 0,
        grade1_f INTEGER DEFAULT 0,
        grade1_m INTEGER DEFAULT 0,
        grade1_total INTEGER DEFAULT 0,
        grade2_f INTEGER DEFAULT 0,
        grade2_m INTEGER DEFAULT 0,
        grade2_total INTEGER DEFAULT 0,
        grade3_f INTEGER DEFAULT 0,
        grade3_m INTEGER DEFAULT 0,
        grade3_total INTEGER DEFAULT 0,
        grade4_f INTEGER DEFAULT 0,
        grade4_m INTEGER DEFAULT 0,
        grade4_total INTEGER DEFAULT 0,
        grade5_f INTEGER DEFAULT 0,
        grade5_m INTEGER DEFAULT 0,
        grade5_total INTEGER DEFAULT 0,
        grade6_f INTEGER DEFAULT 0,
        grade6_m INTEGER DEFAULT 0,
        grade6_total INTEGER DEFAULT 0,
        total_enrollees INTEGER DEFAULT 0,
        dropped_repeater INTEGER DEFAULT 0
      );
    `);
    console.log('Created "enrollments" table.');

    await pool.query(`
      CREATE TABLE classrooms (
        id SERIAL PRIMARY KEY,
        grade_level VARCHAR(20) NOT NULL,
        num_classrooms INTEGER DEFAULT 0
      );
    `);
    console.log('Created "classrooms" table.');

    // ==========================================
    // 3. SEED ADMIN USER
    // ==========================================
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['admin', adminPassword, 'admin']
    );
    console.log('Seeded admin user (admin/admin123).');

    // ==========================================
    // 4. READ EXCEL FILE
    // ==========================================
    const filePath = path.join(__dirname, 'uploads', 'SCHOOL-PRESENTATION.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    console.log('\nParsing Excel data...');

    // ==========================================
    // 4. INSERT ENROLLMENT DATA (rows 4-8 in Excel, index 3-7 in 0-based)
    // ==========================================
    // Row structure from Excel:
    // [school_year, kinder_f, kinder_m, kinder_total, g1_f, g1_m, g1_total, g2_f, g2_m, g2_total,
    //  g3_f, g3_m, g3_total, g4_f, g4_m, g4_total, g5_f, g5_m, g5_total, g6_f, g6_m, g6_total, total, dropped]

    const enrollmentRows = [];
    for (let i = 0; i < raw.length; i++) {
      const row = raw[i];
      // Enrollment data rows have a school year like "2021 - 2022"
      if (row[0] && typeof row[0] === 'string' && /^\d{4}\s*-\s*\d{4}$/.test(row[0].trim())) {
        enrollmentRows.push(row);
      }
    }

    console.log(`Found ${enrollmentRows.length} enrollment records.`);

    for (const row of enrollmentRows) {
      const values = [
        row[0],                         // school_year
        row[1] || 0, row[2] || 0, row[3] || 0,   // kinder F, M, Total
        row[4] || 0, row[5] || 0, row[6] || 0,   // grade 1
        row[7] || 0, row[8] || 0, row[9] || 0,   // grade 2
        row[10] || 0, row[11] || 0, row[12] || 0, // grade 3
        row[13] || 0, row[14] || 0, row[15] || 0, // grade 4
        row[16] || 0, row[17] || 0, row[18] || 0, // grade 5
        row[19] || 0, row[20] || 0, row[21] || 0, // grade 6
        row[22] || 0,                              // total enrollees
        row[23] || 0                               // dropped/repeater
      ];

      await pool.query(
        `INSERT INTO enrollments 
         (school_year, kinder_f, kinder_m, kinder_total, 
          grade1_f, grade1_m, grade1_total, 
          grade2_f, grade2_m, grade2_total, 
          grade3_f, grade3_m, grade3_total, 
          grade4_f, grade4_m, grade4_total, 
          grade5_f, grade5_m, grade5_total, 
          grade6_f, grade6_m, grade6_total, 
          total_enrollees, dropped_repeater)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
        values
      );
      console.log(`  Inserted enrollment: ${row[0]}`);
    }

    // ==========================================
    // 5. INSERT CLASSROOM DATA
    // ==========================================
    const classroomData = [
      ['KINDER', 1],
      ['GRADE 1', 2],
      ['GRADE 2', 2],
      ['GRADE 3', 2],
      ['GRADE 4', 2],
      ['GRADE 5', 2],
      ['GRADE 6', 1],
    ];

    for (const [grade, count] of classroomData) {
      await pool.query(
        'INSERT INTO classrooms (grade_level, num_classrooms) VALUES ($1, $2)',
        [grade, count]
      );
      console.log(`  Inserted classroom: ${grade} → ${count}`);
    }

    // ==========================================
    // 6. VERIFY
    // ==========================================
    const enrollCheck = await pool.query('SELECT * FROM enrollments ORDER BY id');
    console.log(`\n✅ Enrollments table: ${enrollCheck.rowCount} rows`);
    console.log(enrollCheck.rows);

    const classCheck = await pool.query('SELECT * FROM classrooms ORDER BY id');
    console.log(`\n✅ Classrooms table: ${classCheck.rowCount} rows`);
    console.log(classCheck.rows);

    console.log('\n🎉 Database seeded successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();

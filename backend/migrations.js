require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Connecting to database to run migration...');

    // ==========================================
    // 1. Add is_approved column
    // ==========================================
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
    `);
    console.log('Added is_approved column to users table.');

    // ==========================================
    // 2. Add allowed_pages column
    // ==========================================
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS allowed_pages JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('Added allowed_pages column to users table.');

    // ==========================================
    // 3. Set all admins to approved
    // ==========================================
    await pool.query(`
      UPDATE users 
      SET is_approved = true 
      WHERE role = 'admin';
    `);
    console.log('Set is_approved = true for existing admin users.');

    // ==========================================
    // 4. Update existing admin or create one
    // ==========================================
    const adminPassword = await bcrypt.hash('admin01', 10);

    const existingAdmin = await pool.query(`
      SELECT * FROM users 
      WHERE username = 'admin'
    `);

    if (existingAdmin.rowCount > 0) {
      await pool.query(
        `
        UPDATE users
        SET password = $1,
            is_approved = true
        WHERE username = 'admin'
        `,
        [adminPassword]
      );

      console.log('Updated admin password to admin01.');
    } else {
      await pool.query(
        `
        INSERT INTO users (
          username,
          password,
          role,
          is_approved,
          allowed_pages
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          'admin',
          adminPassword,
          'admin',
          true,
          JSON.stringify(['dashboard'])
        ]
      );

      console.log('Inserted new admin user with password admin01.');
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
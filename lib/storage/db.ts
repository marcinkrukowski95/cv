import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'mysql.mydevil.net',
      user: process.env.DB_USER || 'm1003_cv',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'm1003_cv',
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4',
    });
  }
  return pool;
}

export async function initDB() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS cvs (
      id VARCHAR(36) PRIMARY KEY,
      created_at VARCHAR(64) NOT NULL,
      source ENUM('pdf_upload', 'canva_import') NOT NULL,
      file_name VARCHAR(512),
      file_path VARCHAR(512),
      canva_design_id VARCHAR(256),
      canva_design_name VARCHAR(512),
      canva_thumbnail_url TEXT,
      raw_text MEDIUMTEXT NOT NULL,
      sections JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id VARCHAR(36) PRIMARY KEY,
      created_at VARCHAR(64) NOT NULL,
      source ENUM('url', 'paste') NOT NULL,
      url TEXT,
      raw_text MEDIUMTEXT NOT NULL,
      parsed_data JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS analyses (
      id VARCHAR(36) PRIMARY KEY,
      created_at VARCHAR(64) NOT NULL,
      cv_id VARCHAR(36) NOT NULL,
      job_id VARCHAR(36) NOT NULL,
      match_score INT NOT NULL,
      score_breakdown JSON NOT NULL,
      matched_skills JSON NOT NULL,
      missing_skills JSON NOT NULL,
      partial_skills JSON NOT NULL,
      feedback JSON NOT NULL,
      tailored_cv JSON NOT NULL,
      canva_output_design_id VARCHAR(256),
      canva_output_url TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

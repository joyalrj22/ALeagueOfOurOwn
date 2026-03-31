const { query } = require('../repositories/db');
const fs = require('fs');
const path = require('path');

async function initializeTiDB() {
  console.log("--- TiDB Remote Initialization ---");

  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not defined.");
    console.log("Please export DATABASE_URL or run with: DATABASE_URL=... node scripts/init-db.js");
    return;
  }

  try {
    const schemaPath = path.join(__dirname, '../repositories/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and filter out empty lines/comments
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} schema statements...`);

    for (const sql of statements) {
      await query(sql);
      console.log("SUCCESS: Statement executed.");
    }

    console.log("\nDatabase Initialization COMPLETE!");
    
    const tables = await query("SHOW TABLES");
    console.log("Current Tables:", tables.map(t => Object.values(t)[0]).join(", "));

  } catch (err) {
    console.error("Initialization FAILED!");
    console.error(err.message);
  }
  
  process.exit();
}

initializeTiDB();

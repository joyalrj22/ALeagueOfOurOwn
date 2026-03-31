const mysql = require('mysql2/promise');
const fs = require('fs');

async function runInit() {
  const connectionConfig = {
    host: 'serverless-europe-west9.sysp0000.db2.skysql.com',
    port: 4002,
    user: 'dbpgf07982475',
    password: 'j5zo64T4s9iKwkU_KPJLevSL',
    ssl: { rejectUnauthorized: true }
  };

  console.log("--- MariaDB: Connecting to SkySQL ---");
  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log("Connected to server.");

    console.log("Ensuring Database 'leaguer' exists...");
    await connection.execute("CREATE DATABASE IF NOT EXISTS leaguer");
    await connection.execute("USE leaguer");
    console.log("Database 'leaguer' is selected.");

    console.log("Reading schema.sql...");
    const schemaSql = fs.readFileSync('./repositories/schema.sql', 'utf8');

    // Better SQL splitting: remove multi-line comments and split by ;
    const statements = schemaSql
      .replace(/\/\*[\s\S]*?\*\/|--.*?\n/g, '') // remove comments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} schema statements...`);
    for (const sql of statements) {
      await connection.execute(sql);
      console.log("  SUCCESS: Statement executed.");
    }

    console.log("\nDATABASE INITIALIZATION COMPLETE!");
    
    const [rows] = await connection.execute("SHOW TABLES");
    console.log("Current Tables:", rows.map(r => Object.values(r)[0]).join(", "));

  } catch (err) {
    console.error("FAILED: " + err.message);
  } finally {
    if (connection) await connection.end();
  }
}

runInit();

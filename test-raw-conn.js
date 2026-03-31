const { query } = require('./repositories/db');

async function checkConnection() {
  process.env.DATABASE_URL = "mysql://dbpgf07982475:j5zo64T4s9iKwkU_KPJLevSL@serverless-europe-west9.sysp0000.db2.skysql.com:4002/leaguer";
  
  console.log("--- MariaDB Connectivity Check ---");
  try {
    const result = await query("SELECT VERSION() as v");
    console.log("SUCCESS! Connection established. Version: " + result[0].v);
  } catch (err) {
    console.error("CONNECTION FAILED: " + err.message);
  }
  process.exit();
}

checkConnection();

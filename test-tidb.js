const { query } = require('./repositories/db');

async function testConnection() {
  console.log("--- TiDB Cloud Connectivity Test ---");
  console.log("Checking DATABASE_URL configuration...");

  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not set in your environment.");
    console.log("Suggestion: Create a .env file locally with your TiDB connection string.");
    return;
  }

  try {
    console.log("Attempting to connect with SSL...");
    const result = await query("SELECT VERSION() as version, DATABASE() as db_name");
    
    console.log("SUCCESS! Connected to Database.");
    console.log("TiDB Version:", result[0].version);
    console.log("Database Name:", result[0].db_name);

    console.log("\nVerifying Tables...");
    const tables = await query("SHOW TABLES");
    console.log("Found Tables:", tables.map(t => Object.values(t)[0]).join(", ") || "NONE (Run schema.sql!)");

  } catch (err) {
    console.error("CONNECTION FAILED!");
    console.error("Reason:", err.message);
    console.log("\nTroubleshooting Tips:");
    console.log("1. Ensure your TiDB Cloud cluster is ACTIVE.");
    console.log("2. Check for extra parameters in your URL (e.g. ssl=true).");
    console.log("3. Verify your IP is whitelisted in TiDB Cloud Settings.");
  }
}

testConnection().catch(console.error);

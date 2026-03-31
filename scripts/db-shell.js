const { query } = require('../repositories/db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'mariadb> '
});

async function startShell() {
  console.log("--- A League Of Our Own: MariaDB Shell ---");
  console.log("Connected to: " + (process.env.DATABASE_URL || "NOT CONFIGURED"));
  console.log("Type 'exit' to quit.\n");

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('Goodbye!');
      process.exit(0);
    }

    if (input.length === 0) {
      rl.prompt();
      return;
    }

    try {
      const result = await query(input);
      if (Array.isArray(result)) {
        if (result.length === 0) {
          console.log("Empty set.");
        } else {
          console.table(result);
        }
      } else {
        console.log("Query OK, affected rows: " + (result.affectedRows || 0));
      }
    } catch (err) {
      console.error("ERROR: " + err.message);
    }

    console.log("");
    rl.prompt();
  }).on('close', () => {
    process.exit(0);
  });
}

startShell().catch(err => {
  console.error("Failed to start shell:", err.message);
  process.exit(1);
});

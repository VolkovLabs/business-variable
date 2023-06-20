const { Client } = require('pg');

/**
 * Connect to Postgres
 */
const client = new Client({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});
client.connect();

let temps = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20];

const addMetrics = async () => {
  temps = temps.map((temp) => temp + Math.random());

  temps.forEach(async (temp, i) => {
    await client.query(`insert into metrics values(nextval('seq_metrics'), now(), 'device${i + 1}', ${temp});`);
  });

  let timeout = 1000;
  if (temps.find((temp) => temp > 100)) {
    temps = temps.map((temp) => 20);
    timeout = 5000;
  }

  setTimeout(addMetrics, timeout);
};

/**
 * Update the database
 */
setTimeout(addMetrics, 1000);

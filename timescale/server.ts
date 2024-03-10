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
let names = ['Chicago North 125', 'Chicago North 242', 'Tampa South 124', 'Tampa South 232', 'NY Central 133', 'NY Central 221', 'NY Beach 213', 'NY South 432', 'Sweden 192', 'Sweden 299', 'RU 198 BU', 'RU 12 BU', 'JPY 398', 'JPY 176', 'Asia 287', 'Asia 987'];


const addMetrics = async () => {
  temps = temps.map((temp) => temp + Math.random());

  temps.forEach(async (temp, i) => {
    await client.query(`insert into metrics values(nextval('seq_metrics'), now(), '${names[i]}', ${temp});`);
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

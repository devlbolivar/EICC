const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect()
  .then(() => client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
  .then(res => {
    console.log('Tablas en la base de datos (public):');
    if (res.rows.length === 0) {
      console.log('No hay tablas en el esquema public.');
    } else {
      res.rows.forEach(row => console.log('- ' + row.table_name));
    }
    return client.end();
  })
  .catch(err => {
    console.error('Error conectando a la base de datos o consultando tablas:', err);
    client.end();
  });

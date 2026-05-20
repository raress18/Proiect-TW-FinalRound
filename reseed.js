require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function reseed() {
    try {
        const sql = fs.readFileSync('produse.sql', 'utf8');
        console.log('Se ruleaza scriptul produse.sql...');
        await pool.query(sql);
        console.log('Baza de date a fost actualizata cu succes!');
    } catch (err) {
        console.error('Eroare la actualizarea bazei de date:', err);
    } finally {
        await pool.end();
    }
}

reseed();

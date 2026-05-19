const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'rarespa55',
    port: 5432,
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

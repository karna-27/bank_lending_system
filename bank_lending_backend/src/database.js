// Database connection and table creation for SQLite

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

let db; // Database instance

async function initDb(dbPath) {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error connecting to database:', err.message);
                return reject(err);
            }
            console.log('Connected to SQLite database.');
            createTables().then(resolve).catch(reject);
        });
    });
}

async function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS customers (
                    customer_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `, handleError('customers'));

            db.run(`
                CREATE TABLE IF NOT EXISTS loans (
                    loan_id TEXT PRIMARY KEY,
                    customer_id TEXT NOT NULL,
                    principal_amount REAL NOT NULL,
                    total_amount REAL NOT NULL,
                    interest_rate REAL NOT NULL,
                    loan_period_years INTEGER NOT NULL,
                    monthly_emi REAL NOT NULL,
                    amount_paid REAL DEFAULT 0.0,
                    status TEXT DEFAULT 'ACTIVE',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
                )
            `, handleError('loans'));

            db.run(`
                CREATE TABLE IF NOT EXISTS payments (
                    payment_id TEXT PRIMARY KEY,
                    loan_id TEXT NOT NULL,
                    amount REAL NOT NULL,
                    payment_type TEXT NOT NULL,
                    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (loan_id) REFERENCES loans(loan_id)
                )
            `, (err) => { // This callback is for the last table to indicate completion
                if (err) {
                    console.error('Error creating payments table:', err.message);
                    return reject(err);
                }
                console.log('Database tables checked/created.');
                resolve();
            });
        });
    });
}

function handleError(tableName) {
    return (err) => {
        if (err) {
            console.error(`Error creating ${tableName} table:`, err.message);
            // Don't reject immediately for each table, let serialize finish, but log
        }
    };
}

// Utility functions for database operations
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    initDb,
    runQuery,
    getQuery,
    allQuery,
};
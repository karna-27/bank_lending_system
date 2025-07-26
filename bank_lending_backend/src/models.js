// Data models and business logic for bank operations

const { runQuery, getQuery, allQuery } = require('./database');
const { v4: uuidv4 } = require('uuid');

// Rounds a number to two decimal places for consistent monetary representation.
function roundToTwoDecimalPlaces(num) {
    return parseFloat(num.toFixed(2));
}

class Customer {
    static async findById(customerId) {
        return await getQuery(`SELECT customer_id, name, created_at FROM customers WHERE customer_id = ?`, [customerId]);
    }

    static async create(customerId, name) {
        await runQuery(`INSERT INTO customers (customer_id, name) VALUES (?, ?)`, [customerId, name]);
        return { customer_id: customerId, name: name };
    }
}

class Loan {
    static async create(customerId, principalAmount, loanPeriodYears, interestRate) {
        const totalInterest = principalAmount * loanPeriodYears * (interestRate / 100);
        const totalAmount = principalAmount + totalInterest;
        const totalMonths = loanPeriodYears * 12;

        if (totalMonths <= 0) { // Loan period must be positive
            throw new Error("Loan period cannot be zero or negative.");
        }

        const monthlyEmi = roundToTwoDecimalPlaces(totalAmount / totalMonths);
        const loanId = uuidv4();

        await runQuery(`
            INSERT INTO loans (loan_id, customer_id, principal_amount, total_amount,
                               interest_rate, loan_period_years, monthly_emi, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            loanId, customerId, principalAmount, totalAmount,
            interestRate, loanPeriodYears, monthlyEmi, 'ACTIVE'
        ]);

        return {
            loan_id: loanId,
            customer_id: customerId,
            total_amount_payable: roundToTwoDecimalPlaces(totalAmount),
            monthly_emi: monthlyEmi
        };
    }

    static async findById(loanId) {
        return await getQuery(`
            SELECT loan_id, customer_id, principal_amount, total_amount,
                   interest_rate, loan_period_years, monthly_emi, amount_paid,
                   status, created_at
            FROM loans
            WHERE loan_id = ?
        `, [loanId]);
    }

    static async updatePaidAmount(loanId, newAmountPaid, isFullyPaid) {
        const status = isFullyPaid ? 'PAID_OFF' : 'ACTIVE';
        await runQuery(`UPDATE loans SET amount_paid = ?, status = ? WHERE loan_id = ?`, [newAmountPaid, status, loanId]);
    }

    static async findByCustomerId(customerId) {
        return await allQuery(`
            SELECT loan_id, customer_id, principal_amount, total_amount,
                   interest_rate, loan_period_years, monthly_emi, amount_paid,
                   status
            FROM loans
            WHERE customer_id = ?
        `, [customerId]);
    }
}

class Payment {
    static async create(loanId, amount, paymentType) {
        const paymentId = uuidv4();
        await runQuery(`INSERT INTO payments (payment_id, loan_id, amount, payment_type) VALUES (?, ?, ?, ?)`,
                       [paymentId, loanId, amount, paymentType]);
        return { payment_id: paymentId, loan_id: loanId };
    }

    static async findByLoanId(loanId) {
        return await allQuery(`
            SELECT payment_id AS transaction_id, amount, payment_type AS type, payment_date AS date
            FROM payments
            WHERE loan_id = ?
            ORDER BY payment_date ASC
        `, [loanId]);
    }
}

module.exports = {
    Customer,
    Loan,
    Payment,
    roundToTwoDecimalPlaces
};
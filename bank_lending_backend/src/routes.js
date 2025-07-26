// API routes for the bank lending system

const express = require('express');
const { Customer, Loan, Payment, roundToTwoDecimalPlaces } = require('./models');

const router = express.Router();

// Calculates the number of EMIs left, rounding up.
function calculateEmisLeft(balance, monthlyEmi) {
    if (monthlyEmi <= 0 || balance <= 0) return 0;
    return Math.ceil(balance / monthlyEmi);
}

// POST /api/v1/loans - Create a new loan
router.post('/loans', async (req, res) => {
    const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;

    // Basic input validation
    if (!customer_id || typeof loan_amount !== 'number' || loan_amount <= 0 ||
        typeof loan_period_years !== 'number' || loan_period_years <= 0 ||
        typeof interest_rate_yearly !== 'number' || interest_rate_yearly < 0) {
        return res.status(400).json({ error: "Invalid loan data provided. Please check all fields." });
    }

    try {
        // Find or create customer
        let customer = await Customer.findById(customer_id);
        if (!customer) {
            customer = await Customer.create(customer_id, `Customer ${customer_id}`);
        }

        const newLoan = await Loan.create(customer_id, loan_amount, loan_period_years, interest_rate_yearly);
        res.status(201).json(newLoan); // 201 Created
    } catch (error) {
        console.error('Error in /loans (POST):', error);
        res.status(400).json({ error: error.message || "Failed to create loan." });
    }
});

// POST /api/v1/loans/{loan_id}/payments - Record a payment
router.post('/loans/:loan_id/payments', async (req, res) => {
    const { loan_id } = req.params;
    const { amount, payment_type } = req.body;

    // Input validation
    if (typeof amount !== 'number' || amount <= 0 || (payment_type !== 'EMI' && payment_type !== 'LUMP_SUM')) {
        return res.status(400).json({ error: "Invalid payment data provided. Amount must be positive, type 'EMI' or 'LUMP_SUM'." });
    }

    try {
        const loan = await Loan.findById(loan_id);
        if (!loan) {
            return res.status(404).json({ error: "Loan not found." });
        }

        if (loan.status === 'PAID_OFF') {
            return res.status(400).json({ message: "This loan has already been paid off." });
        }

        let newAmountPaid = loan.amount_paid + amount;
        let remainingBalance = loan.total_amount - newAmountPaid;
        let isFullyPaid = false;

        if (newAmountPaid >= loan.total_amount) {
            newAmountPaid = loan.total_amount;
            remainingBalance = 0;
            isFullyPaid = true;
        }

        await Loan.updatePaidAmount(loan_id, newAmountPaid, isFullyPaid);
        const paymentResult = await Payment.create(loan_id, amount, payment_type);

        const emisLeft = calculateEmisLeft(remainingBalance, loan.monthly_emi);

        res.status(200).json({
            payment_id: paymentResult.payment_id,
            loan_id: loan_id,
            message: "Payment recorded successfully.",
            remaining_balance: roundToTwoDecimalPlaces(remainingBalance),
            emis_left: emisLeft
        });
    } catch (error) {
        console.error('Error in /loans/:loan_id/payments (POST):', error);
        res.status(500).json({ error: "Failed to record payment." });
    }
});

// GET /api/v1/loans/{loan_id}/ledger - View loan details and history
router.get('/loans/:loan_id/ledger', async (req, res) => {
    const { loan_id } = req.params;

    try {
        const loan = await Loan.findById(loan_id);
        if (!loan) {
            return res.status(404).json({ error: "Loan not found." });
        }

        const transactions = await Payment.findByLoanId(loan_id);
        const balanceAmount = roundToTwoDecimalPlaces(loan.total_amount - loan.amount_paid);
        const emisLeft = calculateEmisLeft(balanceAmount, loan.monthly_emi);

        res.status(200).json({
            loan_id: loan.loan_id,
            customer_id: loan.customer_id,
            principal: roundToTwoDecimalPlaces(loan.principal_amount),
            total_amount: roundToTwoDecimalPlaces(loan.total_amount),
            monthly_emi: roundToTwoDecimalPlaces(loan.monthly_emi),
            amount_paid: roundToTwoDecimalPlaces(loan.amount_paid),
            balance_amount: balanceAmount,
            emis_left: emisLeft,
            transactions: transactions.map(t => ({
                transaction_id: t.transaction_id,
                date: t.date,
                amount: roundToTwoDecimalPlaces(t.amount),
                type: t.type
            }))
        });
    } catch (error) {
        console.error('Error in /loans/:loan_id/ledger (GET):', error);
        res.status(500).json({ error: "Failed to retrieve loan ledger." });
    }
});

// GET /api/v1/customers/{customer_id}/overview - View all loans for a customer
router.get('/customers/:customer_id/overview', async (req, res) => {
    const { customer_id } = req.params;

    try {
        const loans = await Loan.findByCustomerId(customer_id);

        if (!loans || loans.length === 0) {
            // If no loans, check if customer actually exists to differentiate 404 from empty list
            const customerExists = await Customer.findById(customer_id);
            if (!customerExists) {
                 return res.status(404).json({ error: "Customer not found." });
            }
            return res.status(200).json({ customer_id: customer_id, total_loans: 0, loans: [] });
        }

        const overviewLoans = loans.map(loan => {
            const totalInterest = roundToTwoDecimalPlaces(loan.total_amount - loan.principal_amount);
            const remainingBalance = roundToTwoDecimalPlaces(loan.total_amount - loan.amount_paid);
            const emisLeft = calculateEmisLeft(remainingBalance, loan.monthly_emi);

            return {
                loan_id: loan.loan_id,
                principal: roundToTwoDecimalPlaces(loan.principal_amount),
                total_amount: roundToTwoDecimalPlaces(loan.total_amount),
                total_interest: totalInterest,
                emi_amount: roundToTwoDecimalPlaces(loan.monthly_emi),
                amount_paid: roundToTwoDecimalPlaces(loan.amount_paid),
                emis_left: emisLeft
            };
        });

        res.status(200).json({
            customer_id: customer_id,
            total_loans: overviewLoans.length,
            loans: overviewLoans
        });
    } catch (error) {
        console.error('Error in /customers/:customer_id/overview (GET):', error);
        res.status(500).json({ error: "Failed to retrieve account overview." });
    }
});

module.exports = router;
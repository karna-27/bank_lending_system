// Component to display loan ledger and transaction history

import React, { useState } from 'react';
import { getLoanLedger } from '../api';
import './shared.css';

function LedgerDisplay() {
  const [loanId, setLoanId] = useState('');
  const [ledger, setLedger] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setLoanId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLedger(null);

    try {
      const result = await getLoanLedger(loanId);
      setLedger(result);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <h2>Loan Ledger</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loan_id">Loan ID:</label>
          <input type="text" id="loan_id" name="loan_id" value={loanId} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn-primary">View Ledger</button>
      </form>

      {message && (
        <p className={isError ? 'message-error' : 'message-success'}>
          {message}
        </p>
      )}

      {ledger && (
        <div>
          <h3>Details for Loan ID: {ledger.loan_id}</h3>
          <table>
            <tbody>
              <tr><th>Customer ID</th><td>{ledger.customer_id}</td></tr>
              <tr><th>Principal</th><td>{ledger.principal}</td></tr>
              <tr><th>Total Amount</th><td>{ledger.total_amount}</td></tr>
              <tr><th>Monthly EMI</th><td>{ledger.monthly_emi}</td></tr>
              <tr><th>Amount Paid</th><td>{ledger.amount_paid}</td></tr>
              <tr><th>Balance Amount</th><td>{ledger.balance_amount}</td></tr>
              <tr><th>EMIs Left</th><td>{ledger.emis_left}</td></tr>
            </tbody>
          </table>

          <h3>Transactions</h3>
          {ledger.transactions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {ledger.transactions.map(transaction => (
                  <tr key={transaction.transaction_id}>
                    <td>{transaction.transaction_id}</td>
                    <td>{new Date(transaction.date).toLocaleString()}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions recorded for this loan yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default LedgerDisplay;
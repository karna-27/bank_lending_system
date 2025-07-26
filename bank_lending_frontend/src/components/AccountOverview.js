// Component to display an overview of all loans for a customer

import React, { useState } from 'react';
import { getAccountOverview } from '../api';
import './shared.css';

function AccountOverview() {
  const [customerId, setCustomerId] = useState('');
  const [overview, setOverview] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setCustomerId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setOverview(null);

    try {
      const result = await getAccountOverview(customerId);
      setOverview(result);
      if (result.total_loans === 0 && !result.customer_name) {
        setMessage('No loans found for this customer, or customer does not exist.');
        setIsError(true);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <h2>Account Overview</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customer_id">Customer ID:</label>
          <input type="text" id="customer_id" name="customer_id" value={customerId} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn-primary">View Overview</button>
      </form>

      {message && (
        <p className={isError ? 'message-error' : 'message-success'}>
          {message}
        </p>
      )}

      {overview && (
        <div>
          <h3>Loans for Customer: {overview.customer_id} ({overview.total_loans} total loans)</h3>
          {overview.loans.length > 0 ? (
            overview.loans.map(loan => (
              <div key={loan.loan_id} className="loan-summary form-container"> {/* Reusing form-container for styling */}
                <h4>Loan ID: {loan.loan_id}</h4>
                <table>
                  <tbody>
                    <tr><th>Principal</th><td>{loan.principal}</td></tr>
                    <tr><th>Total Amount</th><td>{loan.total_amount}</td></tr>
                    <tr><th>Total Interest</th><td>{loan.total_interest}</td></tr>
                    <tr><th>EMI Amount</th><td>{loan.emi_amount}</td></tr>
                    <tr><th>Amount Paid</th><td>{loan.amount_paid}</td></tr>
                    <tr><th>EMIs Left</th><td>{loan.emis_left}</td></tr>
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <p>This customer has no loans recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountOverview;
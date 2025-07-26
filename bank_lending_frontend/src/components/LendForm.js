// Form for creating new loans

import React, { useState } from 'react';
import { createLoan } from '../api';
import './shared.css';

function LendForm() {
  const [formData, setFormData] = useState({
    customer_id: '',
    loan_amount: '',
    loan_period_years: '',
    interest_rate_yearly: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const payload = {
      ...formData,
      loan_amount: parseFloat(formData.loan_amount),
      loan_period_years: parseInt(formData.loan_period_years),
      interest_rate_yearly: parseFloat(formData.interest_rate_yearly)
    };

    try {
      const result = await createLoan(payload);
      setMessage(`Loan granted! ID: ${result.loan_id}, Total Payable: ${result.total_amount_payable}, Monthly EMI: ${result.monthly_emi}`);
      setFormData({ // Clear form
        customer_id: '',
        loan_amount: '',
        loan_period_years: '',
        interest_rate_yearly: ''
      });
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <h2>Lend a New Loan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customer_id">Customer ID:</label>
          <input type="text" id="customer_id" name="customer_id" value={formData.customer_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="loan_amount">Loan Amount (P):</label>
          <input type="number" id="loan_amount" name="loan_amount" value={formData.loan_amount} onChange={handleChange} step="0.01" required />
        </div>
        <div className="form-group">
          <label htmlFor="loan_period_years">Loan Period (Years, N):</label>
          <input type="number" id="loan_period_years" name="loan_period_years" value={formData.loan_period_years} onChange={handleChange} min="1" required />
        </div>
        <div className="form-group">
          <label htmlFor="interest_rate_yearly">Interest Rate (Yearly %, R):</label>
          <input type="number" id="interest_rate_yearly" name="interest_rate_yearly" value={formData.interest_rate_yearly} onChange={handleChange} step="0.01" min="0" required />
        </div>
        <button type="submit" className="btn-primary">Lend Loan</button>
      </form>
      {message && (
        <p className={isError ? 'message-error' : 'message-success'}>
          {message}
        </p>
      )}
    </div>
  );
}

export default LendForm;
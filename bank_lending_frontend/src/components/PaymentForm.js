// Form for recording loan payments

import React, { useState } from 'react';
import { recordPayment } from '../api';
import './shared.css';

function PaymentForm() {
  const [formData, setFormData] = useState({
    loan_id: '',
    amount: '',
    payment_type: 'EMI'
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
      amount: parseFloat(formData.amount),
      payment_type: formData.payment_type
    };

    try {
      const result = await recordPayment(formData.loan_id, payload);
      setMessage(`Payment recorded! Remaining Balance: ${result.remaining_balance}, EMIs Left: ${result.emis_left}`);
      setFormData(prev => ({ ...prev, amount: '' })); // Clear amount on success
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <h2>Record a Payment</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loan_id">Loan ID:</label>
          <input type="text" id="loan_id" name="loan_id" value={formData.loan_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} step="0.01" required />
        </div>
        <div className="form-group">
          <label htmlFor="payment_type">Payment Type:</label>
          <select id="payment_type" name="payment_type" value={formData.payment_type} onChange={handleChange} required>
            <option value="EMI">EMI</option>
            <option value="LUMP_SUM">LUMP SUM</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">Record Payment</button>
      </form>
      {message && (
        <p className={isError ? 'message-error' : 'message-success'}>
          {message}
        </p>
      )}
    </div>
  );
}

export default PaymentForm;
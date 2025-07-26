// Centralized API call utility for the frontend

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

async function callApi(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || response.statusText || 'API request failed');
    }
    return result;
  } catch (error) {
    console.error(`API call to ${url} failed:`, error);
    throw error;
  }
}

// Export API functions for components to use
export const createLoan = (loanData) => callApi('/loans', 'POST', loanData);
export const recordPayment = (loanId, paymentData) => callApi(`/loans/${loanId}/payments`, 'POST', paymentData);
export const getLoanLedger = (loanId) => callApi(`/loans/${loanId}/ledger`);
export const getAccountOverview = (customerId) => callApi(`/customers/${customerId}/overview`);
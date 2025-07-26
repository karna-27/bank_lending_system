// Main application component with navigation and routing

import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import LendForm from './components/LendForm';
import PaymentForm from './components/PaymentForm';
import LedgerDisplay from './components/LedgerDisplay';
import AccountOverview from './components/AccountOverview';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <NavLink to="/" end>Lend Loan</NavLink>
            </li>
            <li>
              <NavLink to="/payment">Record Payment</NavLink>
            </li>
            <li>
              <NavLink to="/ledger">Loan Ledger</NavLink>
            </li>
            <li>
              <NavLink to="/overview">Account Overview</NavLink>
            </li>
          </ul>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<LendForm />} />
            <Route path="/payment" element={<PaymentForm />} />
            <Route path="/ledger" element={<LedgerDisplay />} />
            <Route path="/overview" element={<AccountOverview />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
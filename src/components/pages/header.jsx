import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Header = () => {
  return (
    <header
      className="bg-light py-3 shadow-sm w-100"
      style={{
        marginLeft: '200px', // ⬅️ match this with your sidebar width
      }}
    >
      <div className="d-flex justify-content-center align-items-center px-4">
       

        <i className="bi bi-currency-dollar fs-1 text-success me-3"></i>
        <h2 className="m-0 fw-bold text-success text-center">
          Welcome to Expense Tracker
        </h2>
      </div>
    </header>
  );
};

export default Header;

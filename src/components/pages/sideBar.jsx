import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Sidebar.css'; // Import custom styles

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <>
      {/* Toggle Button - Mobile only */}
      <button
        className="btn btn-dark d-md-none toggle-btn"
        onClick={toggleSidebar}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar ${isOpen ? 'open' : 'd-none'} d-md-block`}
      >
        <h4 className="text-center">💰 Tracker</h4>
        <ul className="nav flex-column">

          <li className="nav-item mb-2">
            <Link to="/main/DashBoard" className="nav-link">
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">

            <Link to="/main/addExpense" className="nav-link">
              <i className="bi bi-plus-circle me-2"></i> Add Expense
            </Link>
          </li>

          <li className="nav-item mb-2">

            <Link to="/main/add-income" className="nav-link">
              <i className="bi bi-cash-stack me-2"></i> Add Income
            </Link>
          </li>



          <li className="nav-item mb-2">
            <Link to="/main/AddLoan" className="nav-link text-white">
              <i className="bi bi-cash-coin me-2"></i> Loan
            </Link>
          </li>

          <li className="nav-item mb-2">
            <Link to="/main/Transfer" className="nav-link text-white">
              <i className="bi bi-cash-coin "></i> Money Transfer
            </Link>
          </li>


          <li className="nav-item mb-2">
            <Link to="/main/Reports" className="nav-link">
              <i className="bi bi-bar-chart-line me-2"></i> Reports
            </Link>
          </li>

          <li className="nav-item mb-2">
            <Link to="/main/Setting" className="nav-link">
              <i className="bi bi-tools me-2"></i> Settings
            </Link>
          </li>

          <li className="nav-item">
            <button className="nav-link btn btn-link" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;

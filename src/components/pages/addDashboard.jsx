// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#00fe3fff', '#00C49F', '#283effff', '#FF8042', '#d9ff19ff', '#FF4D4F'];

const Dashboard = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loans, setLoans] = useState([]);

  const EXPENSE_URL = import.meta.env.VITE_EXPENSE_URL;
  const INCOME_URL = import.meta.env.VITE_INCOME_URL;
  const LOAN_URL = import.meta.env.VITE_LOAN_URL;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    if (currentUser) {
      fetchData(currentUser.id);
    }
  }, []);

  const fetchData = async (userId) => {
    try {
      const [incomeRes, expenseRes, loansRes] = await Promise.all([
        axios.get(`${INCOME_URL}?userId=${userId}`),
        axios.get(`${EXPENSE_URL}?userId=${userId}`),
        axios.get(`${LOAN_URL}?userId=${userId}`)
      ]);

      setIncomes(incomeRes.data);
      setExpenses(expenseRes.data);
      setLoans(loansRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const groupByCategory = (data) =>
    data.reduce((acc, item) => {
      const category = item.category || 'Other';
      const amount = Number(item.amount);
      const existing = acc.find(obj => obj.name === category);
      if (existing) existing.value += amount;
      else acc.push({ name: category, value: amount });
      return acc;
    }, []);

  const totalIncomeAmount = incomes.reduce((acc, cur) => acc + Number(cur.amount), 0);
  const totalLoanAmount = loans.reduce((acc, cur) => acc + Number(cur.amount), 0);
  const totalIncome = totalIncomeAmount + totalLoanAmount;
  const totalExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount), 0);
  const availableBalance = totalIncome - totalExpense;

  const incomeData = groupByCategory(incomes);
  const expenseData = groupByCategory(expenses);

  return (
    <div className="container mt-4" style={{ maxWidth: '1000px' }}>
      <div className="row mb-4 g-4">
        <div className="col-md-4">
          <div className="bg-white p-4 text-center border-start border-success border-4 rounded shadow-sm h-100">
            <h5 className="text-success mb-3">
              <i className="bi bi-arrow-down-circle-fill me-2"></i>Total Income
            </h5>
            <h4 className="fw-bold text-success">₹{totalIncome}</h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white p-4 text-center border-start border-danger border-4 rounded shadow-sm h-100">
            <h5 className="text-danger mb-3">
              <i className="bi bi-arrow-up-circle-fill me-2"></i>Total Expense
            </h5>
            <h4 className="fw-bold text-danger">₹{Math.round(totalExpense)}</h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white p-4 text-center border-start border-primary border-4 rounded shadow-sm h-100">
            <h5 className="text-primary mb-3">
              <i className="bi bi-wallet-fill me-2"></i>Available Balance
            </h5>
            <h4 className="fw-bold text-primary">₹{Math.round(availableBalance)}</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <h6 className="text-success text-center fw-bold fs-5 mb-4 border-bottom pb-2">
            <i className="bi bi-graph-up-arrow me-2"></i>Income by Category
          </h6>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={incomeData} dataKey="value" nameKey="name" outerRadius={100} label>
                {incomeData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6">
          <h6 className="text-danger text-center fw-bold fs-5 mb-4 border-bottom pb-2">
            <i className="bi bi-currency-exchange me-2"></i>Expense by Category
          </h6>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseData} dataKey="value" nameKey="name" outerRadius={100} label>
                {expenseData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

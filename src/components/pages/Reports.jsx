import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [selectedType, setSelectedType] = useState('expense'); // expense, income, or loan
  const [reportPeriod, setReportPeriod] = useState('weekly');  // weekly or monthly
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const EXPENSE_URL = import.meta.env.VITE_EXPENSE_URL;
  const INCOME_URL = import.meta.env.VITE_INCOME_URL;
  const LOAN_URL = import.meta.env.VITE_LOAN_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = currentUser?.id;
        let url = "";

        if (selectedType === 'expense') url = EXPENSE_URL;
        else if (selectedType === 'income') url = INCOME_URL;
        else if (selectedType === 'loan') url = LOAN_URL;

        const res = await axios.get(`${url}?userId=${userId}`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    if (currentUser?.id) {
      fetchData();
    }
  }, [selectedType]);

  useEffect(() => {
    const now = new Date();
    let fromDate = new Date();

    if (reportPeriod === 'weekly') {
      fromDate.setDate(now.getDate() - 7);
    } else if (reportPeriod === 'monthly') {
      fromDate.setMonth(now.getMonth() - 1);
    }

    const result = data.filter(item => new Date(item.date) >= fromDate);
    setFilteredData(result);
  }, [data, reportPeriod]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`${selectedType.toUpperCase()} REPORT (${reportPeriod.toUpperCase()})`, 10, 10);

    let headers = [];
    let body = [];

    if (selectedType === 'loan') {
      headers = ['Title', 'Amount', 'Date', 'Category', 'Bank'];
      body = filteredData.map(item => [
        item.loanTitle || item.title,
        `₹${item.amount}`,
        new Date(item.date).toLocaleDateString('en-GB'),
        item.category || 'N/A',
        item.Bank || 'N/A',
      ]);
    } else {
      headers = ['Title', 'Amount', 'Date', 'Category'];
      body = filteredData.map(item => [
        item.title,
        `₹${item.amount}`,
        new Date(item.date).toLocaleDateString('en-GB'),
        item.category || 'N/A',
      ]);
    }

    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: body,
    });

    doc.save(`${selectedType}_${reportPeriod}_report.pdf`);
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Download Reports</h3>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <select className="form-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="loan">Loan</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 1 Month</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary w-100" onClick={generatePDF}>
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Table Display */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th>Sr No</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Category</th>
              {selectedType === 'loan' && <th>Bank</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={selectedType === 'loan' ? 6 : 5} className="text-center">
                  No data found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.loanTitle || item.title}</td>
                  <td>₹{item.amount}</td>
                  <td>{new Date(item.date).toLocaleDateString('en-GB')}</td>
                  <td>{item.category || 'N/A'}</td>
                  {selectedType === 'loan' && <td>{item.Bank || 'N/A'}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;

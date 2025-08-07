import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const BeneficiaryForm = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const TRANSFER_URL = import.meta.env.VITE_TRANSFER_URL;
  const EXPENSE_URL = import.meta.env.VITE_EXPENSE_URL;
  
const INCOME_URL = import.meta.env.VITE_INCOME_URL;
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
 
const [availableBalance, setAvailableBalance] = useState(0);

// Example fetch logic:
useEffect(() => {
  const fetchBalance = async () => {
    const incomeRes = await axios.get(`${INCOME_URL}?userId=${currentUser.id}`);
    const expenseRes = await axios.get(`${EXPENSE_URL}?userId=${currentUser.id}`);
    const transferRes = await axios.get(`${TRANSFER_URL}?userId=${currentUser.id}`);

    const totalIncome = incomeRes.data.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpense = expenseRes.data.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalTransfers = transferRes.data.reduce((sum, t) => sum + Number(t.amount), 0);

    setAvailableBalance(totalIncome - totalExpense - totalTransfers);
  };

  fetchBalance();
  fetchBeneficiaries(); 
}, []);

  const fetchBeneficiaries = async () => {
    try {
      const res = await axios.get(`${TRANSFER_URL}?userId=${currentUser.id}`);
      const data = res.data;
      setBeneficiaries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch beneficiaries:", err);
      setBeneficiaries([]); // fallback
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transfer?")) {
      try {
        await axios.delete(`${TRANSFER_URL}/${id}`);
        setBeneficiaries((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting transfer:", error);
      }
    }
  };


  const handleSubmit = async (values, { resetForm }) => {

 const transferAmount = Number(values.amount);


    const newExpense = {
      userId: currentUser.id,
      category: 'Transfer',
      amount: transferAmount,
      date: new Date().toISOString().split('T')[0],
      note: `Money sent to ${values.name}`
    };

    try {
      const res = await axios.post(TRANSFER_URL, {
        ...values,
        userId: currentUser.id
      });
      setBeneficiaries(prev => [...prev, res.data]);

      await axios.post(EXPENSE_URL, newExpense);

      resetForm();
    } catch (err) {
      console.error('Error sending money:', err);
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    accountNumber: Yup.string().required('Required'),
    bankName: Yup.string().required('Required'),
    amount: Yup.number().required('Required').positive('Must be positive')
      .max(availableBalance, `Amount must be ≤ ₹${availableBalance}`)

  });






  return (
    <div className="container ">
      <div className="row">
        {/* Left: Add Beneficiary Form */}
        <div className="col-md-4">
          <div className="card p-4 shadow-sm">
            <h4 className="text-center text-success mb-4">Add Beneficiary</h4>
            <Formik
              initialValues={{
                name: '',
                accountNumber: '',
                bankName: '',
                amount: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              <Form>
                <div className="mb-3">
                  <Field name="name" className="form-control" placeholder="Name" />
                  <div className="text-danger"><ErrorMessage name="name" /></div>
                </div>
                <div className="mb-3">
                  <Field name="accountNumber" className="form-control" placeholder="Account Number" />
                  <div className="text-danger"><ErrorMessage name="accountNumber" /></div>
                </div>
                <div className="mb-3">
                  <Field name="bankName" className="form-control" placeholder="Bank Name" />
                  <div className="text-danger"><ErrorMessage name="bankName" /></div>
                </div>
                <div className="mb-3">
                  <Field name="amount" type="number" className="form-control" placeholder="Amount" />
                  <div className="text-danger"><ErrorMessage name="amount" /></div>
                </div>
                <button type="submit" className="btn btn-success w-100">+ Send Money</button>
              </Form>
            </Formik>
            
            

          </div>
        </div>

        {/* Right: Transfer History Table */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">Transfer History</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-bordered table-hover mb-0">
                <thead className="table-light text-center">
                  <tr>
                    <th>Sr No</th>
                    <th>Name</th>
                    <th>Account Number</th>
                    <th>Bank Name</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {beneficiaries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-muted">No transfers yet.</td>
                    </tr>
                  ) : (
                    beneficiaries.map((b, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{b.name}</td>
                        <td>{b.accountNumber}</td>
                        <td>{b.bankName}</td>
                        <td>₹{b.amount}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(b.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );


};

export default BeneficiaryForm;


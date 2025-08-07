import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const URL = import.meta.env.VITE_INCOME_URL;

const AddIncome = () => {
  const [incomes, setIncomes] = useState([]);
  const [editingIncome, setEditingIncome] = useState(null);

  const initialValues = {
    title: '',
    category: '',
    amount: '',
    date: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    category: Yup.string().required('Category is required'),
    amount: Yup.number().typeError('Must be a number').positive('Must be positive').required('Amount is required'),
    date: Yup.date().required('Date is required')
      .max(new Date(), 'Date cannot be in the future')
      .min(new Date(new Date().setDate(new Date().getDate() - 30)), 'Date must be within the last 30 days'),
  });

  const fetchIncomes = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser?.id) return;
      const res = await axios.get(`${URL}?userId=${currentUser.id}`);
      setIncomes(res.data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const incomesPerPage = 5;
  const indexOfLastIncome = currentPage * incomesPerPage;
  const indexOfFirstIncome = indexOfLastIncome - incomesPerPage;
  const currentIncomes = incomes.slice(indexOfFirstIncome, indexOfLastIncome);
  const totalPages = Math.ceil(incomes.length / incomesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userId = currentUser?.id;
      if (!userId) return;

      if (editingIncome) {
        await axios.put(`${URL}/${editingIncome.id}`, { ...values, userId });
        setEditingIncome(null);
      } else {
        await axios.post(`${URL}`, { ...values, userId });
      }
      fetchIncomes();
      resetForm();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this income?");
    if (confirm) {
      try {
        await axios.delete(`${URL}/${id}`);
        setIncomes(incomes.filter(income => income.id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div className="row g-4">
        
        {/* Form */}
        <div className="col-md-4">
          <div className="card border-0 shadow p-4 rounded-4 bg-white">
            <h4 className="text-center mb-4 text-primary fw-bold">Add Income</h4>
            <Formik
              enableReinitialize
              initialValues={editingIncome || initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              <Form>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Title</label>
                  <Field type="text" name="title" placeholder="Enter income title" className="form-control" />
                  <ErrorMessage name="title" component="div" className="text-danger small" />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Category</label>
                  <Field as="select" name="category" className="form-select">
                    <option value="">-- Select Category --</option>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Gift">Gift</option>
                  </Field>
                  <ErrorMessage name="category" component="div" className="text-danger small" />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Amount</label>
                  <Field type="number" name="amount" className="form-control" placeholder="Enter amount" />
                  <ErrorMessage name="amount" component="div" className="text-danger small" />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Date</label>
                  <Field type="date" name="date" className="form-control" />
                  <ErrorMessage name="date" component="div" className="text-danger small" />
                </div>

                <button type="submit" className="btn btn-success w-100 fw-bold">
                  {editingIncome ? "Update Income" : "+ Add Income"}
                </button>
              </Form>
            </Formik>
          </div>
        </div>

        {/* Table */}
        <div className="col-md-8">
          <div className="card border-0 shadow p-4 rounded-4 bg-white">
            <h4 className="mb-4 text-dark fw-bold">Your Income List</h4>

            <div className="table-responsive">
              <table className="table table-hover table-bordered text-center align-middle">
                <thead className="table-light">
                  <tr className="small text-secondary">
                    <th>Sr No</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {currentIncomes.map((income, index) => (
                    <tr key={income.id}>
                      <td>{indexOfFirstIncome + index + 1}</td>
                      <td className="fw-semibold">{income.title}</td>
                      <td>{income.category}</td>
                      <td className="text-success fw-semibold">₹{income.amount}</td>
                      <td>{income.date}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setEditingIncome(income)}
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(income.id)}
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {incomes.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-muted text-center">
                        No income records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-3">
              <ul className="pagination pagination-sm">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Total Income */}
            <div className="mt-4 text-end">
              <div className="bg-light px-4 py-3 rounded shadow-sm d-inline-block">
                <h6 className="mb-1 text-success fw-bold">Total Income</h6>
                <h5 className="mb-0 fw-bold">₹{totalIncome}</h5>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddIncome;

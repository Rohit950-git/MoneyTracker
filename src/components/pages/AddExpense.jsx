import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const EXPENSE_URL = import.meta.env.VITE_EXPENSE_URL;
const INCOME_URL = import.meta.env.VITE_INCOME_URL;

const AddExpense = () => {
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const userId = currentUser?.id;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  useEffect(() => {
    const fetchExpensesAndIncome = async () => {
      try {
        const [expenseRes, incomeRes] = await Promise.all([
          axios.get(`${EXPENSE_URL}?userId=${userId}`),
          axios.get(`${INCOME_URL}?userId=${userId}`),
        ]);
        setExpenses(expenseRes.data);
        setIncomeData(incomeRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (userId) fetchExpensesAndIncome();
  }, [userId]);

  useEffect(() => {
    const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const adjustedBalance = editingExpense
      ? totalIncome - (totalExpense - Number(editingExpense.amount))
      : totalIncome - totalExpense;
    setAvailableBalance(adjustedBalance);
  }, [incomeData, expenses, editingExpense]);

  const initialValues = {
    title: editingExpense?.title || '',
    category: editingExpense?.category || '',
    amount: editingExpense?.amount || '',
    date: editingExpense?.date || '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    category: Yup.string().required('Category is required'),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .max(availableBalance, `You only have ₹${availableBalance} available`),
    date: Yup.date()
      .required('Date is required')
      .max(new Date(), 'Date cannot be in the future')
      .min(
        new Date(new Date().setDate(new Date().getDate() - 30)),
        'Date must be within the last 30 days'
      ),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const newExpense = {
        ...values,
        amount: Number(values.amount),
        userId: currentUser.id,
      };
      if (editingExpense) {
        await axios.put(`${EXPENSE_URL}/${editingExpense.id}`, newExpense);
        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === editingExpense.id ? { ...newExpense, id: exp.id } : exp
          )
        );
        setEditingExpense(null);
        alert('Expense updated successfully!');
      } else {
        const res = await axios.post(EXPENSE_URL, newExpense);
        setExpenses((prev) => [...prev, res.data]);
        alert('Expense added successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error adding/updating expense:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${EXPENSE_URL}/${id}`);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      alert('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div className="container-fluid bg-light py-4">
      <div className="row">
        <div className="col-md-4">
          <div className="card border-success shadow-sm">
            <div className="card-header bg-success text-white text-center">
              <h5>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h5>
            </div>
            <div className="card-body">
              <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                <Form>
                  <div className="mb-3">
                    <Field name="title" className="form-control" placeholder="Title" />
                    <ErrorMessage name="title" component="div" className="text-danger small" />
                  </div>
                  <div className="mb-3">
                    <Field as="select" name="category" className="form-select">
                      <option value="">Select Category</option>
                      <option value="Food">Food</option>
                      <option value="Rent">Rent</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Transport">Transport</option>
                    </Field>
                    <ErrorMessage name="category" component="div" className="text-danger small" />
                  </div>
                  <div className="mb-3">
                    <Field
                      name="amount"
                      type="number"
                      className="form-control"
                      placeholder="Enter amount"
                    />
                    <ErrorMessage name="amount" component="div" className="text-danger small" />
                  </div>
                  <div className="mb-3">
                    <Field name="date" type="date" className="form-control" />
                    <ErrorMessage name="date" component="div" className="text-danger small" />
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    {editingExpense ? 'Update Expense' : '+ Add Expense'}
                  </button>
                </Form>
              </Formik>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Your Expenses List</h5>
            </div>
            <div className="card-body">
              {expenses.length === 0 ? (
                <p className="text-center">No expenses yet.</p>
              ) : (
                <>
                  <table className="table table-bordered table-hover table-striped">
                    <thead className="table-dark text-center">
                      <tr>
                        <th>Sr No</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {currentExpenses.map((expense, index) => (
                        <tr key={expense.id}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>{expense.title}</td>
                          <td>{expense.category}</td>
                          <td className="text-danger fw-bold">₹{Math.round(expense.amount)}</td>

                          <td>{new Date(expense.date).toLocaleDateString('en-GB')}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleEdit(expense)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(expense.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <nav>
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index}
                          className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                        >
                          <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 text-end">
            <div className="p-3 bg-warning-subtle border rounded shadow-sm">
              <h6 className="mb-1 text-secondary">Total Expense</h6>
              <h5 className="text-danger">₹{Math.round(totalExpense)}</h5>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;

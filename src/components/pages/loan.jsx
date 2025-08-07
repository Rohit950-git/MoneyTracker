import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "./addLoan.css";

const URL = import.meta.env.VITE_LOAN_URL;
const EXPENSE_URL = import.meta.env.VITE_EXPENSE_URL;

// ✅ EMI Auto Calculator Component
const EmiAutoCalculator = ({ calculateEmi }) => {
  const { values, setFieldValue } = useFormikContext();

  useEffect(() => {
    if (values.amount && values.interest && values.startDate && values.endDate) {
      const { emi, totalPayable, totalInterest } = calculateEmi(
        values.amount,
        values.interest,
        values.startDate,
        values.endDate
      );
      setFieldValue("Emi", emi);
      setFieldValue("totalPayable", totalPayable);
      setFieldValue("totalInterest", totalInterest);
    }
  }, [values.amount, values.interest, values.startDate, values.endDate, setFieldValue]);

  return null;
};

// ✅ Main Component
const AddLoan = () => {
  const [loans, setLoans] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const fetchLoans = async () => {
    const res = await axios.get(`${URL}?userId=${currentUser.id}`);
    setLoans(res.data);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handlePayEMI = async (loan) => {
    const emi = Number(loan.Emi);
    const totalPaid = Number(loan.emiPaid || 0);
    const totalPayable = Number(loan.totalPayable || 0);

    if (totalPaid + emi > totalPayable) {
      alert("❌ Cannot pay more than the total loan amount.");
      return;
    }

    try {
      await axios.post(`${EXPENSE_URL}`, {
        userId: currentUser.id,
        title: `EMI for Loan #${loan.id}`,
        amount: emi,
        date: new Date().toISOString(),
      });

      await axios.patch(`${URL}/${loan.id}`, {
        emiPaid: totalPaid + emi,
      });

      alert(`✅ ₹${emi} EMI paid successfully!`);
      fetchLoans();
    } catch (err) {
      console.error("Error paying EMI:", err);
      alert("❌ Something went wrong while paying EMI.");
    }
  };

  // ✅ New EMI Calculation Function
  const calculateEmi = (amount, interestRate, startDate, endDate) => {
    const principal = parseFloat(amount);
    const annualInterest = parseFloat(interestRate);

    const months =
      (new Date(endDate).getFullYear() - new Date(startDate).getFullYear()) * 12 +
      (new Date(endDate).getMonth() - new Date(startDate).getMonth());

    if (months <= 0 || isNaN(months)) return { emi: 0, totalPayable: 0, totalInterest: 0 };

    const totalInterest = (principal * annualInterest * months) / (12 * 100);
    const totalPayable = principal + totalInterest;
    const emi = totalPayable / months;

    return {
      emi: Math.round(emi),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest),
    };
  };

  const initialValues = {
    amount: "",
    interest: "",
    startDate: "",
    endDate: "",
    category: "",
    Emi: "",
    totalPayable: "",
    totalInterest: "",
    date: new Date().toISOString().split("T")[0],
    userId: currentUser.id,
    emiPaid: 0,
  };

  const validationSchema = Yup.object({
    amount: Yup.number().required("Amount is required"),
    interest: Yup.number().required("Interest is required"),
    startDate: Yup.date().required("Start Date is required"),
    endDate: Yup.date()
      .required("End Date is required")
      .min(Yup.ref("startDate"), "End Date must be after Start Date"),
    category: Yup.string().required("Category is required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      await axios.post(URL, { ...values, emiPaid: 0 });
      fetchLoans();
      resetForm();
    } catch (err) {
      console.error("Error saving loan:", err);
    }
  };

  return (
    <div className="container">
      <div className="row gx-4">
        {/* 👉 Left Side: Loan Form */}
        <div className="col-md-4">
          <div className="bg-light shadow p-4 rounded-3">
            <h4 className="mb-4 text-primary fw-bold border-bottom pb-2">➕ Add New Loan</h4>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              <Form>
                <EmiAutoCalculator calculateEmi={calculateEmi} />

                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <Field type="number" name="amount" className="form-control" />
                  <ErrorMessage name="amount" component="div" className="text-danger small" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Interest (%)</label>
                  <Field type="number" name="interest" className="form-control" />
                  <ErrorMessage name="interest" component="div" className="text-danger small" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <Field type="text" name="category" className="form-control" />
                  <ErrorMessage name="category" component="div" className="text-danger small" />
                </div>

                <div className="row">
                  <div className="col">
                    <label className="form-label">Start Date</label>
                    <Field type="date" name="startDate" className="form-control" />
                    <ErrorMessage name="startDate" component="div" className="text-danger small" />
                  </div>
                  <div className="col">
                    <label className="form-label">End Date</label>
                    <Field type="date" name="endDate" className="form-control" />
                    <ErrorMessage name="endDate" component="div" className="text-danger small" />
                  </div>
                </div>

                <div className="mt-3 mb-2">
                  <label className="form-label">Total Interest</label>
                  <Field type="text" name="totalInterest" className="form-control" readOnly />
                </div>

                <div className="mb-2">
                  <label className="form-label">Total Payable</label>
                  <Field type="text" name="totalPayable" className="form-control" readOnly />
                </div>

                <div className="mb-3">
                  <label className="form-label">Monthly EMI</label>
                  <Field type="text" name="Emi" className="form-control" readOnly />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-outline-success">
                    ➕ Add Loan
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>

        {/* 👉 Right Side: Loan Table */}
        <div className="col-md-8">
          <div className="bg-white shadow p-4 rounded-3">
            <h4 className="mb-4 text-primary fw-bold border-bottom pb-2">📋 Loan List</h4>

            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-primary text-center">
                  <tr>
                    <th>Amount</th>
                    <th>Interest</th>
                    <th>Category</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Total Payable</th>
                    <th>EMI</th>
                    <th>Paid</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>₹{loan.amount}</td>
                      <td>{loan.interest}%</td>
                      <td>{loan.category}</td>
                      <td>{loan.startDate}</td>
                      <td>{loan.endDate}</td>
                      <td>₹{loan.totalPayable}</td>
                      <td>₹{loan.Emi}</td>
                      <td>₹{(loan.emiPaid || 0)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handlePayEMI(loan)}
                          disabled={Number(loan.emiPaid) >= Number(loan.totalPayable)}
                        >
                          Pay EMI
                        </button>
                      </td>
                    </tr>
                  ))}
                  {loans.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center text-muted">
                        No loans available.
                      </td>
                    </tr>
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

export default AddLoan;

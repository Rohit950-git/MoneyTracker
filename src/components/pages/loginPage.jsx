import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const URL = import.meta.env.VITE_BASE_URL;

const Login = () => {
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const { data: users } = await axios.get(URL);

      const matchedUser = users.find(
        (user) => user.email === values.email && user.password === values.password
      );

      if (matchedUser) {
        const { password, ...User } = matchedUser; // ✅ exclude password
        localStorage.setItem('currentUser', JSON.stringify(User));
        localStorage.setItem('userId', matchedUser.id); // ✅ done

        navigate('/main/DashBoard');
      } else {
        // ✅ Fix: clear old/stale user data if login fails
        localStorage.removeItem('currentUser');
        setStatus({ error: 'Invalid email or password!' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus({ error: 'Server error. Please try again.' });
    }

    setSubmitting(false);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="p-4 rounded shadow bg-white" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4 fw-bold">Login</h3>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <Field
                  name="email"
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter email"
                />
                <ErrorMessage name="email" component="div" className="text-danger small" />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <Field
                  name="password"
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Enter password"
                />
                <ErrorMessage name="password" component="div" className="text-danger small" />
              </div>

              {status?.error && (
                <div className="text-danger text-center mb-3">{status.error}</div>
              )}
              {status?.success && (
                <div className="text-success text-center mb-3">Login successful</div>
              )}

              <button type="submit" className="btn btn-success w-100" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-3 text-center">
          <span>Don't have an account? </span>
          <Link to="/signup" className="text-primary text-decoration-none fw-semibold">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

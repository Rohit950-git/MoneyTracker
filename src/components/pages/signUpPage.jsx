import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
const SignUp = () => {

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const URL = import.meta.env.VITE_BASE_URL;

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSubmit = async (values, { resetForm }) => {
    debugger;
    try {
      const { data: existingUsers } = await axios.get(URL);
      const isEmailExist = existingUsers.some(user => user.email === values.email);

      if (isEmailExist) {
        alert('Email already exists!');
        return;
      }

      const tempData = {
        id: Date.now(),
        ...values,
      };

      const {confirmPassword, ...newUser} = tempData;

      await axios.post(URL, newUser);
      alert('User registered successfully!');
      resetForm();
    } catch (error) {
      console.error('Error while signing up:', error);
      alert('Something went wrong. Please try again later.');
    }
  };

  return (
 
 
<div className="container d-flex justify-content-center align-items-center vh-100 vw-100">
  <div className="p-4 rounded bg-white shadow" style={{ width: "100%", maxWidth: "700px" }}>
    <h3 className="text-center mb-4 fw-bold">Signup Form</h3>

    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      <Form>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <Field name="name" className="form-control" placeholder="Enter username" />
          <ErrorMessage name="name" component="div" className="text-danger small" />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <Field name="email" type="email" className="form-control" placeholder="Enter email" />
          <ErrorMessage name="email" component="div" className="text-danger small" />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <Field name="password" type="password" className="form-control" placeholder="Enter password" />
          <ErrorMessage name="password" component="div" className="text-danger small" />
        </div>

        <div className="mb-4">
          <label className="form-label">Confirm Password</label>
          <Field name="confirmPassword" type="password" className="form-control" placeholder="Re-enter password" />
          <ErrorMessage name="confirmPassword" component="div" className="text-danger small" />
        </div>

        <button type="submit" className="btn btn-success w-100">Signup</button>
      </Form>
    </Formik>
    
        <div className="mt-3 text-center">
          <span>If have Already  account </span>
          <Link to="/" className="text-primary text-decoration-none fw-semibold">
            log in
          </Link>
        </div>
  </div>
</div>


 
  );
};

export default SignUp;

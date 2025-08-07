import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const URL = import.meta.env.VITE_BASE_URL;

const Settings = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

 

  const validationSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string().min(6, 'Minimum 6 characters').required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

 const handleChangePassword = async (values, { setStatus, setSubmitting, resetForm }) => {
  try {
    const { data: users } = await axios.get(URL);
    const user = users.find((u) => u.id === currentUser.id);

    if (!user || user.password !== values.currentPassword) {
      setStatus({ error: 'Current password is incorrect' });
      return;
    }

    await axios.put(`${URL}/${user.id}`, { ...user, password: values.newPassword });

    // ✅ SHOW ALERT HERE
    window.alert('Password updated successfully!');

    setStatus({ success: 'Password updated successfully' });
    resetForm();
  } catch (error) {
    console.error(error);
    setStatus({ error: 'Something went wrong' });
  } finally {
    setSubmitting(false);
  }
};

  

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Settings</h3>
      <p><strong>Name:</strong> {currentUser?.name}</p>
      <p><strong>Email:</strong> {currentUser?.email}</p>

      <hr />
      <h5 className="mt-4">Change Password</h5>

      <Formik
        initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        validationSchema={validationSchema}
        onSubmit={handleChangePassword}
      >
        {({ isSubmitting, status }) => (
          <Form>
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <Field type="password" name="currentPassword" className="form-control" />
              <ErrorMessage name="currentPassword" component="div" className="text-danger" />
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <Field type="password" name="newPassword" className="form-control" />
              <ErrorMessage name="newPassword" component="div" className="text-danger" />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <Field type="password" name="confirmPassword" className="form-control" />
              <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
            </div>

            {status?.error && <div className="text-danger mb-2">{status.error}</div>}
            {status?.success && <div className="text-success mb-2">{status.success}</div>}

            <button type="submit" className="btn btn-primary" >
              {  'Change Password'}
            </button>
          </Form>
        )}
      </Formik>

      <hr />
      
    </div>
  );
};

export default Settings;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/pages/loginPage';
import SignUp from './components/pages/signUpPage';
import 'bootstrap-icons/font/bootstrap-icons.css';

import ProtectedRoute from './components/pages/ProtectedRoute';
import PublicRoute from './components/pages/publicRoute';
import AddExpense from './components/pages/AddExpense';
import Layout from './components/pages/layout';
import AddIncome from './components/pages/addIncome';
import Dashboard from './components/pages/addDashboard';
import Reports from './components/pages/Reports';
import Settings from './components/pages/setting';
import AddLoan from './components/pages/loan';

import BeneficiaryForm from './components/pages/addBenificiary';




function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<PublicRoute />}>
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
        </Route>

        <Route path='/main' element={<ProtectedRoute>
          <Layout />
        </ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path='addExpense' element={<AddExpense />} />
           <Route path='add-income' element={<AddIncome/>} />
           <Route path='DashBoard' element={<Dashboard/>} />
          <Route path='Reports' element={<Reports/>} />
          <Route path='Setting' element={<Settings/>} />
          <Route path='AddLoan' element={<AddLoan/>} />
          <Route path='Transfer' element={<BeneficiaryForm/>} />

        </Route>

        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

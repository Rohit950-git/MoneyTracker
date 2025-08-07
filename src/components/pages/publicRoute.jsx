import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  
  const user = JSON.parse(localStorage.getItem('currentUser'));
  // // if logged in, redirect to /home; otherwise render child routes
  return user ? <Navigate to="/main/DashBoard" replace /> : <Outlet />;
};

export default PublicRoute;

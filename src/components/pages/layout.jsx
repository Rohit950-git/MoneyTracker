
import React from 'react';
import Header from './header';
import Sidebar from './sideBar';
import { Outlet } from 'react-router';

const Layout = ({ children }) => {
  return (
    <div >
     <div className="col-2"><Sidebar/></div>
     <div className="col-10"><Header/></div>
     
     


      <div className="flex-grow-1" style={{ marginLeft: '220px' }}>
        
        <main className="p-4">
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default Layout;

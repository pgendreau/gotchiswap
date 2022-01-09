import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <React.Fragment>
      <Header />
      <div>
        <main>{children}</main>
      </div>
    </React.Fragment>
  );
};

export default Layout;

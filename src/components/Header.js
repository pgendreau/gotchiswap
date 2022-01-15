import React from 'react';

import logo from '../images/logo.png';

const Header = () => {
  return (
    <div className="header">
      <a href="/"><img src={logo} alt="Gotchiswap Logo" /></a>
      <h1>Gotchiswap</h1>
    </div>
  );
};

export default Header;

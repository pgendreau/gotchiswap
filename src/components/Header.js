import React from 'react';


import logo from '../images/logo.png';

//const connectWalletPressed = async () => {
//    const walletResponse = await connectWallet();
//    setStatus(walletResponse.status);
//    setWallet(walletResponse.address);
//};

const Header = () => {
  return (
    <header>
      <img src={logo} alt="Gotchiswap Logo" />
    </header>
  );
};

export default Header;

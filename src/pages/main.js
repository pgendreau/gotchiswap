import React from 'react';
import {Link} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const Main = () => {

  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {

    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }
  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const buttons = () => {
    return(
      <div>
        <Link to='/sell'>
          <button className='cta-button sell-button'>
            Sell
          </button>
        </Link>
        <Link to='/buy'>
          <button className='cta-button buy-button'>
            Buy 
          </button>
        </Link>
      </div>
    );
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      <h2>Main Page</h2>
      <div>
        {currentAccount ? buttons() : connectWalletButton()}
      </div>
    </div>
  );
};

export default Main;

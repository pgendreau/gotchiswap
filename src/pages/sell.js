import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import { ethers } from 'ethers';

import contract from '../artifacts/contracts/Escrow.sol/Escrow.json';

const contractAddress = "0x0A46Ff3e5c6B5F43ee85A20fec1349AC0460D035";
const contractAbi = contract.abi;


const Sell = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [sales, setSales] = useState([]);

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

  const getSales = async () => {

    try {
      const { ethereum } = window;

      const _sales = [];

      if (ethereum && currentAccount) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        const salesCount = await contract.getSellerSalesCount(currentAccount);

        console.log("salesCount: ", salesCount);

        for (let i = 0; i < salesCount; i++) {
          console.log("i: ", i);
          const sale = await contract.getSale(currentAccount, i);
          console.log("Sale: ", sale);
          _sales.push(sale);
        };

      }
        
      setSales(_sales);

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(async () => {
    document.title = 'Gotchiswap: Sell';
    checkWalletIsConnected();
    getSales();
    console.log("Sales: ", sales);
  }, [currentAccount]);

  return (
    <div className='main-app'>
      <h2>Sell</h2>
      <Link to='/create'>
        <button className='cta-button sell-button'>
          Create Sale 
        </button>
      </Link>
      <p>My Sales</p>
    </div>
  );
};

export default Sell;

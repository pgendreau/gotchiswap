import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import Grid from "@material-ui/core/Grid";
import { ethers } from 'ethers';

import contract from '../artifacts/contracts/Escrow.sol/Escrow.json';

const contractAddress = "0xf6Fc59d9225b7f4b920126A6A5a4ABE4E8BF344A";
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

  const abortHandler = async (index) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(contractAddress, contractAbi, signer);
        console.log("Aborting sale: ", index);
        let txn = await contract.abortGotchiSale(index);
        console.log("Mining... please wait");
        await txn.wait();

        console.log(
          `Mined, see transaction: https://kovan.etherscan.io/tx/${txn.hash}`
        );

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
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
          _sales.push(
            { 'id': sale[0], 'price': sale[1], 'buyer': sale[2] }
          );
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

  const rows = sales;

  return (
    <div className='main-app'>
      <h2>Sell</h2>
      {rows === undefined ? <p>Loading...</p> : <p>My Sales</p>}
      {console.log("Rows: ", rows)}
      {rows.map((row, index) => (
        <Grid key={row.id}>
          <p>Id: {parseInt(row.id)}</p>
          <p>Price: {parseInt(ethers.utils.formatEther(row.price))}</p>
          <p>To: {row.buyer}</p>
          <button onClick={() => abortHandler(index)} className='cta-button buy-button'>
            Abort
          </button>
        </Grid>
      ))}
      <Link to='/create'>
        <button className='cta-button sell-button'>
          Create Sale 
        </button>
      </Link>
    </div>
  );
};

export default Sell;

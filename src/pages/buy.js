import React, { useEffect, useRef, useState } from 'react';
import Grid from "@material-ui/core/Grid";
import { ethers } from 'ethers';

import contract from '../artifacts/contracts/Escrow.sol/Escrow.json';

const contractAddress = "0x12fD9E1227091442d20e78A4c98AD61C58baeAe0";
const ghstAddress = "0xeDaA788Ee96a0749a2De48738f5dF0AA88E99ab5";
const contractAbi = contract.abi;

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
];

const Buy = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [allowance, setAllowance] = useState();
  const [sales, setSales] = useState([]);
  const hasLoadedSales = useRef(true);

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

  const getAllowance = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(ghstAddress, erc20Abi, provider);
        const allowance = await contract.allowance(currentAccount, contractAddress);
        console.log("Current allowance: ", allowance.toString());
        setAllowance(allowance.toString());
      }
    } catch (err) {
      console.log(err);
    }
  }

  const getOffers = async () => {

    const _offers = [];

    try {
      const { ethereum } = window;

      if (ethereum && currentAccount) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        const salesCount = await contract.getBuyerSalesCount(currentAccount);
        console.log("salesCount: ", salesCount);
        for (let i = 0; i < salesCount; i++) {
          console.log("i: ", i);
          const offer = await contract.getOffer(currentAccount, i);
          console.log("Offer: ", offer);
          _offers.push(offer);
        };

      }
        
      return _offers;

    } catch (err) {
      console.log(err);
    }
  }

  const getSales = async () => {

    try {
      const { ethereum } = window;

      const _sales = [];
      const offers = await getOffers();

      console.log("Offers: ", offers.toString());

      if (ethereum && currentAccount) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        for (let i = 0; i < offers.length; i++) {
          const seller = offers[i][0];
          console.log("Seller: ", seller);
          const index = offers[i][1];
          console.log("Index: ", index);
          const sale = await contract.getSale(seller, index);
          console.log("Sale: ", sale.toString());
          
          _sales.push(
            { 'id': sale[0], 'price': sale[1], 'seller': seller }
          );
        };

      }
        
      console.log("Sales: ", _sales.toString());
      setSales(_sales);

    } catch (err) {
      console.log(err);
    }
  }

  const checkAllowance = (price) => {
    return parseInt(allowance) >= parseInt(price)
  }

  const buyHandler = async (price, index) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        if (checkAllowance(price)) {

          const contract = new ethers.Contract(contractAddress, contractAbi, signer);
          console.log("Initialize payment");
          let txn = await contract.buyGotchi(index);
          console.log("Mining... please wait");
          await txn.wait();

          console.log(
            `Mined, see transaction: https://kovan.etherscan.io/tx/${txn.hash}`
          );

        } else {

          const contract = new ethers.Contract(ghstAddress, erc20Abi, signer);
          console.log("Approving GHST spending");
          let txn = await contract.approve(
              contractAddress,
              price.toString()
          );
          console.log("Mining... please wait");
          await txn.wait();

          console.log(
            `Mined, see transaction: https://kovan.etherscan.io/tx/${txn.hash}`
          );

        }

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    document.title = 'Gotchiswap: Buy';
    checkWalletIsConnected();
    getAllowance();
    getSales();
    if (!hasLoadedSales.current) {
      hasLoadedSales.current = true;
    };
  },[currentAccount, allowance]);

  const rows = sales;

  return (
    <div className='main-app'>
      <h2>Buy</h2>
      {rows === undefined ? <p>Loading...</p> : <p>My Offers</p>}
      {console.log("Rows: ", rows)}
      {rows.map((row, index) => (
        <Grid key={row.id}>
          <p>Id: {parseInt(row.id)}</p>
          <p>Price: {parseInt(ethers.utils.formatEther(row.price))}</p>
          <p>Seller: {row.seller}</p>
          <button onClick={() => buyHandler(row.price, index)} className='cta-button buy-button'>
            {checkAllowance(row.price) ? 'Buy' : 'Approve GHST'} 
          </button>
        </Grid>
      ))}
    </div>
  );
};

export default Buy;

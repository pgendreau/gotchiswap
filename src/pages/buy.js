import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { DataGrid } from '@mui/x-data-grid';

import contract from '../artifacts/contracts/Escrow.sol/Escrow.json';

const contractAddress = "0x0A46Ff3e5c6B5F43ee85A20fec1349AC0460D035";
const ghstAddress = "0xeDaA788Ee96a0749a2De48738f5dF0AA88E99ab5";
const contractAbi = contract.abi;

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
];

// tmp
const price = ethers.utils.parseEther("427");
//const currentAccount = "0xfEC36843fcADCbb13B7b14aB12403d45Df6dEc4E";

const Buy = () => {

  const [currentAccount, setCurrentAccount] = useState(0);
  const [allowance, setAllowance] = useState(0);
  //const [offersCount, setOffersCount] = useState(0);
  //const [sales, setSales] = useState([]);

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

    const offers = [];

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        const salesCount = await contract.getBuyerSalesCount(currentAccount);
        console.log("salesCount: ", salesCount);
        for (let i = 0; i < salesCount; i++) {
          console.log("i: ", i);
          const offer = await contract.getOffer(currentAccount, i);
          console.log("Offer: ", offer);
          offers.push(offer);
        };

      }
        
      return offers;

    } catch (err) {
      console.log(err);
    }
  }

  const getSales = async () => {

    try {
      const { ethereum } = window;

      const sales = [];
      const offers = await getOffers();

      console.log("Offers: ", offers.toString());

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        for (let i = 0; i < offers.length; i++) {
          const seller = offers[i][0];
          console.log("Seller: ", seller);
          const index = offers[i][1];
          console.log("Index: ", index);
          const sale = await contract.getSale(seller, index);
          console.log("Sale: ", sale.toString());
          sales.push(sale);
        };

      }
        
      console.log("Sales: ", sales.toString());
      //setSales(sales);
      return sales;

    } catch (err) {
      console.log(err);
    }
  }

  const checkAllowance = () => {
    return parseInt(allowance) >= parseInt(price)
  }

  const buyHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        if (checkAllowance()) {

          const contract = new ethers.Contract(contractAddress, contractAbi, signer);
          console.log("Initialize payment");
          let txn = await contract.buyGotchi(0);
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
    getSales();
    // move out
    //getAllowance();
  });

  const columns = [
    { field: 'id', headerName: 'Gotchi Id', width: 70, identity: true },
    { field: 'price', headerName: 'Price', width:  90 },
    { field: 'seller', headerName: 'Seller', width: 130 },
  ];

//  const rows = [[1901, 427, "0xfEC36843fcADCbb13B7b14aB12403d45Df6dEc4E"]].reduce(
//    function(sale) {
//      return {
//        'id': sale[0],
//        'price': sale[1],
//        'seller': sale[2]
//      },
//      {} 
//    }
//  );


  const rows = [
    {
      'id': 1901,
      'price': price,
      'seller': "0xfEC36843fcADCbb13B7b14aB12403d45Df6dEc4E"
    }
  ];
    
  return (
    <div className='main-app'>
      <h2>Buy</h2>
      <p>My Offers</p>
      {console.log("Rows: ", rows)}
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          id={Math.random()}
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </div>
      <button onClick={buyHandler} className='cta-button buy-button'>
        {checkAllowance() ? 'Buy' : 'Approve GHST'} 
      </button>
    </div>
  );
};

export default Buy;

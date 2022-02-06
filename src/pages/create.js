import React from 'react';
import { useState, useEffect } from "react";
import { ethers } from 'ethers';

import aavegotchiDiamondAbi from "../artifacts/contracts/aavegotchiDiamondAbi.json";
import contract from '../artifacts/contracts/Escrow.sol/Escrow.json';
const contractAddress = "0x12fD9E1227091442d20e78A4c98AD61C58baeAe0";
const contractAbi = contract.abi;
const aavegotchiDiamondAddress = "0x07543dB60F19b9B48A69a7435B5648b46d4Bb58E";


const Sell = () => {
  const [gotchi, setGotchi] = useState(null);
  const [price, setPrice] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [isApproved, setApproval] = useState(false);
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

  const checkApprovalForAll = async () => {
    try {
      const { ethereum } = window;

      if (ethereum && currentAccount) {
        console.log("aavegotchiDiamondAddress: ", aavegotchiDiamondAddress);
        console.log("aavegotchiDiamondAbi: ", aavegotchiDiamondAbi);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(
            aavegotchiDiamondAddress,
            aavegotchiDiamondAbi,
            provider
        );
        const isApprovedForAll = await contract.isApprovedForAll(currentAccount, contractAddress);
        console.log("Approved For All: ", isApprovedForAll);
        setApproval(isApprovedForAll);
      }


    } catch (err) {
      console.log(err);
    }
  }

  const checkApproval = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(
            aavegotchiDiamondAddress,
            aavegotchiDiamondAbi,
            provider
        );
        const approved = await contract.getApproved(gotchi);
        console.log("Approved: ", approved);
        setApproval(approved == contractAddress);
      }

    } catch (err) {
      console.log(err);
    }
  }

  const addSaleHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        if (isApproved) {
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const priceInWei = ethers.utils.parseEther(price);

            console.log("Creating sale");
            let txn = await contract.sellGotchi(
              gotchi,
              priceInWei,
              buyer 
            );

            console.log("mining... please wait");
            await txn.wait();

            console.log(
              `mined, see transaction: https://kovan.etherscan.io/tx/${txn.hash}`
            );

        } else {
            const contract = new ethers.Contract(aavegotchiDiamondAddress, aavegotchiDiamondAbi, signer);
            let txn = await contract.approve(contractAddress, gotchi);

            console.log("mining... please wait");
            await txn.wait();

            console.log(
              `mined, see transaction: https://kovan.etherscan.io/tx/${txn.hash}`
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
    document.title = 'Gotchiswap: Create Sale';
    checkWalletIsConnected();
    checkApproval()
  }, [currentAccount, gotchi, isApproved]);

  return (
    <div className='main-app'>
      <h2>Create Sale</h2>
      <form>
        <p>
          <label>Gotchi Id:
            <input
              type="text"
              value={gotchi}
              onChange={(e) => setGotchi(e.target.value)}
            />
          </label>
        </p><p>
          <label>Price:
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
        </p><p>
          <label>To:
            <input
              type="text"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
            />
          </label>
        </p>
      </form>
      <button onClick={addSaleHandler} className='cta-button sell-button'>
        {isApproved ? 'New Sale' : 'Approve Gotchi transfer'} 
      </button>
    </div>
  );
};

export default Sell;

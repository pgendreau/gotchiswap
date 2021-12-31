import { useEffect, useState } from 'react';
import './App.css';
import { ethers } from 'ethers';

import contract from './artifacts/contracts/Escrow.sol/Escrow.json';

const contractAddress = "0xBef4c6C2c5Fed6B1d19c1508f955Cb39E2383C4f";
const ghstAddress = "0xeDaA788Ee96a0749a2De48738f5dF0AA88E99ab5";
const contractAbi = contract.abi;

// tmp
const owner = '0xfEC36843fcADCbb13B7b14aB12403d45Df6dEc4E';
const price = ethers.utils.parseEther("427");
const id = 1901;

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
];

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [allowance, setAllowance] = useState(0);
  //const [approval, setApproval] = useState(false);

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
        const allowance = await contract.allowance(owner, contractAddress);
        console.log("Current allowance: ", allowance.toString());
        setAllowance(allowance.toString());
      }
    } catch (err) {
      console.log(err);
    }
  }

  const checkAllowance = () => {
    return parseInt(allowance) >= parseInt(price)
  }

  const sellHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        console.log("Creating sale");
        let txn = await contract.sellGotchi(
          id,
          price,
          owner
        );

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
        <button onClick={sellHandler} className='cta-button sell-button'>
          Sell
        </button>
        <button onClick={buyHandler} className='cta-button buy-button'>
          {checkAllowance() ? 'Buy' : 'Approve GHST'} 
        </button>
      </div>
    );
  }

  useEffect(() => {
    checkWalletIsConnected();
    getAllowance()
  }, [])

  return (
    <div className='main-app'>
      <h1>GotchiSwap main page</h1>
      <div>
        {currentAccount ? buttons() : connectWalletButton()}
      </div>
    </div>
  )
}

export default App;

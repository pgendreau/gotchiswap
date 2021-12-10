import { useEffect } from 'react';
import './App.css';

import contract from './artifacts/contracts/Escrow.sol/Escrow.json';

const contractAddress = "0xBef4c6C2c5Fed6B1d19c1508f955Cb39E2383C4f";
const abi = contract.abi;

function App() {

  const checkWalletIsConnected = () => { }

  const connectWalletHandler = () => { }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      <h1>GotchiSwap main page</h1>
      <div>
        {connectWalletButton()}
      </div>
    </div>
  )
}

export default App;

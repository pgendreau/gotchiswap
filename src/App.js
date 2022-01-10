import { useEffect, useState } from "react";

import {
  connectWallet,
  getCurrentWalletConnected,
} from "./util/interact.js";

import './App.css';
import Index from './pages';

function App() {

  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  function addWalletListener() { //TODO: implement
  }

  const connectWalletPressed = async () => { //TODO: implement
  };

  //called only once
  useEffect(() => { //TODO: implement
  }, []);

  return (
    <div>
      <Index />
    </div>
  );
}

export default App;

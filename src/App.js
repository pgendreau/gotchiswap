import { useEffect } from "react";

import './App.css';
import Index from './pages';

function App() {

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

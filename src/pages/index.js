import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Main from './main';
import Buy from './buy';
import Sell from './sell';

const Index = () => {
  return(
    <Router>
      <Routes>
        <Route exact path="/" element={<Main />}></Route>
        <Route path="/buy" element={<Buy />}></Route>
        <Route path="/sell" element={<Sell />}></Route>
      </Routes>
    </Router>
  );
};

export default Index;

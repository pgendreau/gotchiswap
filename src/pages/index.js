import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Layout from '../components/Layout';

import Main from './main';
import Buy from './buy';
import Sell from './sell';
import Create from './create';

const Index = () => {
  return(
    <Router>
      <Layout>
        <Routes>
          <Route exact path="/" element={<Main />}></Route>
          <Route path="/buy" element={<Buy />}></Route>
          <Route path="/sell" element={<Sell />}></Route>
          <Route path="/create" element={<Create />}></Route>
        </Routes>
      </Layout>
    </Router>
  );
};

export default Index;

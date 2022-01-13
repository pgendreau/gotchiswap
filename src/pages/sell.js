import React, { useEffect } from 'react';
import {Link} from 'react-router-dom';

const Sell = () => {
  useEffect(() => {
    document.title = 'Gotchiswap: Sell';
  });
  return (
    <div className='main-app'>
      <h2>Sell</h2>
      <Link to='/create'>
        <button className='cta-button sell-button'>
          Create Sale 
        </button>
      </Link>
      <p>My Sales</p>
    </div>
  );
};

export default Sell;

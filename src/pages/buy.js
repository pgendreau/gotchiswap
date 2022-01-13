import React, { useEffect } from 'react';

const Buy = () => {
  useEffect(() => {
    document.title = 'Gotchiswap: Buy';
  });
  return (
    <div className='main-app'>
      <h2>Buy</h2>
      <p>My Offers</p>
    </div>
  );
};

export default Buy;

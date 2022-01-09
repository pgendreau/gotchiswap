import React, { useEffect } from 'react';

const Sell = () => {
  useEffect(() => {
    document.title = 'Gotchiswap: Sell';
  });
  return (
    <div>
      <h1>Gotchiswap Sell</h1>
      <p>My Sales</p>
    </div>
  );
};

export default Sell;

// src/pages/tortilla.js
"use client";

import React from 'react';
import ProductionOrders from '../../components/ProductionOrderList/ProductionOrderList';

const TortillaProductionOrders = () => {
 
  return (
    <div >
   
      <ProductionOrders type='Tortillas'/>
    </div>
   
  );
};

export default TortillaProductionOrders;

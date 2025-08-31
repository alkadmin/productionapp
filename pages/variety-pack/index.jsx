// src/pages/tortilla.js
"use client";

import React from 'react';
import ProductionOrders from '../../components/ProductionOrderListVariety/ProductionOrderListVariety';

const TortillaProductionOrders = () => {
 
  return (
    <div >
   
      <ProductionOrders type='VarietyPack'/>
    </div>
   
  );
};

export default TortillaProductionOrders;

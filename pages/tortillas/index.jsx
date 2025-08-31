// src/pages/tortilla.js
"use client";

import React from 'react';
import ProductionOrders from '../../components/ProductionOrderList/ProductionOrderList';
import { useTranslation } from '../../utilities/i18n';

const TortillaProductionOrders = () => {
  const { t } = useTranslation();

  return (
    <div>
      <ProductionOrders type={t('tortillas')} />
    </div>
  );
};

export default TortillaProductionOrders;

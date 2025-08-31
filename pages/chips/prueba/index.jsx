
"use client";

import React from 'react';
import ProductionOrders from '../../../components/ProductionOrderListChips/ProductionOrderListChips';
import { useTranslation } from '../../../utilities/i18n';

const ChipsProductionOrders = () => {
  const { t } = useTranslation();

  return (
        <div>
      <ProductionOrders type={t('menu.chips')}/>
      </div>

  );
};

export default ChipsProductionOrders;

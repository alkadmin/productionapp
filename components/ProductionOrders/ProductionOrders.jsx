"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import './index.css';
import IssueProduction from '@/components/IssueProduction/IssueProduction';
import { useTranslation } from '@/utilities/i18n';

const ProductionOrder = (id) => {

  const [order, setOrder] = useState(null);
  const [allItems, setAllItems] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const API = process.env.API
  const { t } = useTranslation();
  const router = useRouter();
  const handleProduceClick = (child) => {
    router.push(`/production/${child.POChildrenDocEntry}`);
  };

  ///////modal Issue
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const showDialog = (rowData) => {
    setSelectedRowData(rowData);
    setIsDialogVisible(true);
  };

  const showBatchDialog = () => {
    setSelectedRowData(order); // Enviar todo el detalle
    setIsDialogVisible(true);
  };

  const hideDialog = () => {
    setIsDialogVisible(false);
    setSelectedRowData(null);
  };
  //////

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        const response = await fetch(`/api/OneProductionOrder/${id}`);
        const data = await response.json();
        setOrder(data);

        const allItemsCheck = data.every((child) => child.Type === 'Item');
        setAllItems(allItemsCheck);
      };

      fetchOrder();
    }
  }, [id]);

  if (!order) {
    return <div>{t('productionOrder.loading')}</div>;
  }

  const linkTemplate = (rowData) => {
    return (
      <a href={`/production/${rowData.POChildrenDocEntry}`}>
        {rowData.POChildrenDocNum}
      </a>
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <>
          {rowData.Type === 'PO' && (
            <Button
              label={t('productionOrder.produce')}
              className="p-button-info"
              onClick={() => handleProduceClick(rowData)}
            />
          )}
          {rowData.Type === 'Item' && (
            <Button
              label={t('productionOrder.issue')}
              className="p-button-warning"
              onClick={() => showDialog(rowData)}
            />
          )}
      </>
    );
  };

  return (
    <>
      <Card title={t('productionOrder.title')} className="p-card">
        <div className="p-grid p-nogutter">
          <div className="p-col-12 p-md-6">
            <div><b>{t('productionOrder.productNo')}:</b> {order[0].ItemCode}</div>
            <div><b>{t('productionOrder.productDescription')}:</b> {order[0].ProdName}</div>
            <div><b>{t('productionOrder.plannedQuantity')}:</b> {order[0].PlannedQty}</div>
            <div><b>{t('productionOrder.warehouse')}:</b> {order[0].Warehouse}</div>
          </div>
          <div className="p-col-12 p-md-6">
            <div><b>{t('productionOrder.poNumber')}:</b> {order[0].DocNum}</div>
            <div><b>{t('productionOrder.orderDate')}:</b> {order[0].CreateDate}</div>
            <div><b>{t('productionOrder.startDate')}:</b> {order[0].StartDate}</div>
            <div><b>{t('productionOrder.finishDate')}:</b> {order[0].DueDate}</div>
            <div><b>{t('productionOrder.linkedTo')}:</b> {t('productionOrder.salesOrder')}</div>
            <div><b>{t('productionOrder.linkedOrder')}:</b> {order[0].OriginNum}</div>
          </div>
        </div>
        <div className="p-grid p-nogutter p-justify-end p-mt-3">
          {!allItems && (
            <>
              <Button label={t('topbar.startProduction')} className="p-button-success p-mr-2" />
              <Button label={t('topbar.endProduction')} className="p-button-danger" />
            </>
          )}
          {allItems && (
            <>
              <Button label={t('productionOrder.closeOrder')} className="p-button-danger" />
              <Button label={t('productionOrder.addBatch')}
              className="p-button-success p-mr-2"
              onClick={showBatchDialog} />
            </>
          )}
        </div>
      </Card>
      <Card title={t('productionOrder.components')} className="p-card p-mt-3">
        <div className="p-datatable-wrapper">
          <DataTable value={order} paginator rows={10} responsiveLayout="scroll">
            <Column field="Type" header={t('productionOrder.type')} />
            <Column field="ItemCode2" header={t('productionOrder.product')} />
            <Column field="ItemName" header={t('productionOrder.description')} />
            <Column field="BaseQty" header={t('productionOrder.baseQuantity')} />
            <Column field="PlannedQty" header={t('productionOrder.planned')} />
            <Column field="CmpltQty" header={t('productionOrder.issued')} />
            <Column field="DocNum" header={t('productionOrder.available')} />
            {!allItems && <Column body={linkTemplate} header={t('productionOrder.childPO')} />}
            {!allItems && <Column body={actionTemplate} header={t('productionOrder.actions')} />}
          </DataTable>
        </div>
      </Card>
      
      <IssueProduction visible={isDialogVisible} onHide={hideDialog} data={selectedRowData} />
    </>
  );
};

export default ProductionOrder;

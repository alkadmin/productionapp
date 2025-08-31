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

const ProductionOrder = (id) => {

  const [order, setOrder] = useState(null);
  const [allItems, setAllItems] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const API = process.env.API
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
    return <div>Loading...</div>;
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
            label="Produce"
            className="p-button-info"
            onClick={() => handleProduceClick(rowData)}
          />
        )}
        {rowData.Type === 'Item' && (
          <Button
            label="Issue"
            className="p-button-warning"
            onClick={() => showDialog(rowData)}
          />
        )}
      </>
    );
  };

  return (
    <>
      <Card title="Production Order" className="p-card">
        <div className="p-grid p-nogutter">
          <div className="p-col-12 p-md-6">
            <div><b>Product No.:</b> {order[0].ItemCode}</div>
            <div><b>Product Description:</b> {order[0].ProdName}</div>
            <div><b>Planned Quantity:</b> {order[0].PlannedQty}</div>
            <div><b>Warehouse:</b> {order[0].Warehouse}</div>
          </div>
          <div className="p-col-12 p-md-6">
            <div><b>No. (PO):</b> {order[0].DocNum}</div>
            <div><b>Order Date:</b> {order[0].CreateDate}</div>
            <div><b>Start Date:</b> {order[0].StartDate}</div>
            <div><b>Production Finish Date:</b> {order[0].DueDate}</div>
            <div><b>Linked To:</b> Sales Order</div>
            <div><b>Linked Order:</b> {order[0].OriginNum}</div>
          </div>
        </div>
        <div className="p-grid p-nogutter p-justify-end p-mt-3">
          {!allItems && (
            <>
              <Button label="Start Production" className="p-button-success p-mr-2" />
              <Button label="End Production" className="p-button-danger" />
            </>
          )}
          {allItems && (
            <>
              <Button label="Close Order" className="p-button-danger" />
              <Button label="Add Batch" 
              className="p-button-success p-mr-2"
              onClick={showBatchDialog} />
            </>
          )}
        </div>
      </Card>
      <Card title="Components" className="p-card p-mt-3">
        <div className="p-datatable-wrapper">
          <DataTable value={order} paginator rows={10} responsiveLayout="scroll">
            <Column field="Type" header="Type" />
            <Column field="ItemCode2" header="Product" />
            <Column field="ItemName" header="Description" />
            <Column field="BaseQty" header="Base Quantity" />
            <Column field="PlannedQty" header="Planned" />
            <Column field="CmpltQty" header="Issued" />
            <Column field="DocNum" header="Available" />
            {!allItems && <Column body={linkTemplate} header="Child PO" />}
            {!allItems && <Column body={actionTemplate} header="Actions" />}
          </DataTable>
        </div>
      </Card>
      
      <IssueProduction visible={isDialogVisible} onHide={hideDialog} data={selectedRowData} />
    </>
  );
};

export default ProductionOrder;

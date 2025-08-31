"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { formatDate } from '../../utilities/formatDate'
import { useTranslation } from '../../utilities/i18n';

const ProductionOrders = ({ type }) => {
  const [pOrders, setPOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerPOSearch, setCustomerPOSearch] = useState('');
  const { t } = useTranslation();

  const statusOptions = [
    { label: t('productionList.statusAll'), value: 'All' },
    { label: t('productionList.statusReleased'), value: 'Released' },
    { label: t('productionList.statusOpen'), value: 'Open' },
    { label: t('productionList.statusClose'), value: 'Close' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/ProductionOrder${type}`);
        setPOrders(response.data);
        setFilteredOrders(response.data); // Mostrar todas las órdenes por defecto
      } catch (error) {
        console.error('Error fetching the production orders', error);
      }
    };

    fetchData();
  }, [type]);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, searchTerm, customerPOSearch, pOrders]);

  const filterOrders = () => {
    let filtered = pOrders;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.Status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order => order?.OriginNum.includes(searchTerm.toLowerCase()));
    }

    if (customerPOSearch) {
      filtered = filtered.filter(order => order?.CustomerPO?.toLowerCase().includes(customerPOSearch.toLowerCase()));
    }

    setFilteredOrders(filtered);
  };

  const onStatusChange = (e) => {
    setStatusFilter(e.value);
  };

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const onCustomerPOSearchChange = (e) => {
    setCustomerPOSearch(e.target.value);
  };

  const linkTemplate = (rowData) => {
    return (
      <Link href={`/productionVariety/${rowData.DocEntry}`}>
        {rowData.CustomerPO}
      </Link>
    );
  };

  const dateTemplate = (rowData) => {
    if (!rowData.StartDate) {
      return '';
    }
    
    return formatDate(rowData.StartDate);
  };
  

  const infoMixes = (rowData) => {
    return rowData.Mixes + "/" + rowData.TotalMixes;
  };

  const infoPallets = (rowData) => {
    return rowData.Pallets + "/" + rowData.TotalPallets;
  };

  const dateTemplateDelivery = (rowData) => {
    if (!rowData.DeliveryDate) {
      return '';
    }

    
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return new Date(rowData.DeliveryDate).toLocaleDateString('en-US', options);
  };

  const dateTemplateFinish = (rowData) => {
    if (!rowData.CloseDate) {
      return '';
    }
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return new Date(rowData.CloseDate).toLocaleDateString('en-US', options);
  };

  return (
    <>
      <Card>
        <div style={styles.header}>
          <h1 style={styles.title}>{t('menu.varietyPack')} {t('productionList.orders')}</h1>
          <div style={styles.filters}>
            <Dropdown
              value={statusFilter}
              options={statusOptions}
              onChange={onStatusChange}
              placeholder={t('productionList.selectStatus')}
              style={styles.dropdown}
            />
            <InputText
              value={customerPOSearch}
              onChange={onCustomerPOSearchChange}
              placeholder={t('productionList.searchCustomerPO')}
              style={styles.searchInput}
            />
          </div>
        </div>

        <DataTable
          value={filteredOrders}
          paginator
          rows={10}
          style={styles.table}
        >
          <Column
            body={linkTemplate}
            header={t('productionList.customerPO')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '30rem' }}
          />
          <Column
            field="Status"
            header={t('productionList.status')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '15rem' }}
          />
          <Column
            field="ItemCode"
            header={t('productionList.sku')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
          <Column
            field="ProdName"
            header={t('productionList.productDescription')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '60rem' }}
          />
          <Column
            field="DocNum"
            header={t('productionList.originPOs')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '15rem' }}
          />
          <Column
            field="PlannedQty"
            header={t('productionOrder.plannedQuantity')}
            body={(rowData) => `${parseFloat(rowData.PlannedQty).toFixed(0)} ${rowData.SalUnitMsr}`}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody1}
            style={{ width: '15rem' }}
          />
          {/* <Column
            body={infoMixes}
            header={t('productionList.mixes')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '10rem' }}
          /> */}
          <Column
            body={infoPallets}
            header={t('productionList.pallets')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '10rem' }}
          />
          <Column
            body={dateTemplate}
            header={t('productionList.startedDate')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
          <Column
            body={dateTemplateFinish}
            header={t('productionList.finishDate')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
          <Column
            body={dateTemplateDelivery}
            header={t('productionList.deliveryDate')}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
        </DataTable>
      </Card>
    </>
  );
};

// Estilos en línea
const styles = {
  header: {
    backgroundColor: 'var(--primary-color)',
    color: 'var(--primary-color-text)',
    padding: '10px',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'left',
  },
  title: {
    color: 'var(--primary-color-text)',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  filters: {
    display: 'flex',
    alignItems: 'center',
  },
  dropdown: {
    marginRight: '10px',
  },
  searchInput: {
    marginLeft: '10px',
  },
  table: {
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: 'var(--primary-color-light)',
    color: 'var(--primary-color-text)',
    padding: '0.5rem',
  },
  tableBody1: {
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
};

export default ProductionOrders;

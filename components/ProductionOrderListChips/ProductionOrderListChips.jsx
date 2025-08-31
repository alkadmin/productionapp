"use client";

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import { Card } from 'primereact/card';
import {formatDate} from '../../utilities/formatDate'

const ProductionOrders = ({ type }) => {
  const [pOrders, setPOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [groupDetails, setGroupDetails] = useState({});
  const [username, setUsername] = useState(localStorage.getItem("username"))
  const [group, setGroup] = useState(null)
  const [customerPOSearch, setCustomerPOSearch] = useState('');
  const toast = useRef(null);

  const statusOptions = [
    { label: 'All', value: 'All' },
    { label: 'Released', value: 'Released' },
    { label: 'Open', value: 'Open' },
    { label: 'Close', value: 'Close' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/ProductionOrder${type}`);
        const response1 = await axios.get(`/api/ValidateUserGroup?username='${username}'`);
        setGroup(response1.data[0].U_CTS_GroupWeProd)
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
  }, [statusFilter, customerPOSearch, pOrders]);

  const filterOrders = () => {
    let filtered = pOrders;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.Status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order => order.ProdName.toLowerCase().includes(searchTerm.toLowerCase()));
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
    setCustomerPOSearch(e.target.value);
    // setSearchTerm(e.target.value);
  };

  const onCustomerPOSearchChange = (e) => {
    setCustomerPOSearch(e.target.value);
  };


  const linkTemplate = (rowData) => {
    if (rowData.Group) {
      return (
        <Link href={`/productionChips/${rowData.Group}`}>
          {rowData.CustomerPO}
        </Link>
      );
    }
    else {
      return (
        <Link href={`/production/${rowData.DocEntry}`}>
          {rowData.CustomerPO}
        </Link>)
    }
    return rowData.CustomerPO;
  };


  const dateTemplateDelivery = (rowData) => {
    if (!rowData.DeliveryDate) {
      return '';
    }
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return new Date(rowData.DeliveryDate).toLocaleDateString('en-US', options);
  };

  const handleProduceClick = async () => {
    const grouped = groupByDoughItem(selectedOrders);
  
    try {
      // Recorrer los grupos de DoughItem
      const updatePromises = [];
  
      for (const doughItem in grouped) {
        const uniqueId = generateUniqueId(10);
        const orders = grouped[doughItem];
  
        // Añadir todas las promesas de actualización a la lista de promesas
        orders.forEach(order => {
          updatePromises.push(updateGroupChips(order.DocEntry, uniqueId));
        });
      }
  
      // Esperar a que todas las promesas se resuelvan
      await Promise.all(updatePromises);
  
      // Mostrar un toast de éxito solo al final de la operación
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'All selected orders have been grouped successfully', life: 3000 });
  
      // Recargar las órdenes y limpiar la selección
      await reloadOrders();
      setSelectedOrders([]);
    } catch (error) {
      // En caso de error, mostrar un toast de error
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to group all selected orders', life: 3000 });
      console.error('Error grouping orders:', error);
    }
  };
  

  const dateTemplate = (rowData) => {
    if (!rowData.StartDate) {
      return '';
    }
    console.log(rowData.StartDate)
    
    return formatDate(rowData.StartDate);
  };
  

  const dateTemplateFinish = (rowData) => {
    if (!rowData.CloseDate) {
      return '';
    }
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return new Date(rowData.CloseDate).toLocaleDateString('en-US', options);
  };

  // const handleSelectionChange = (e) => {
  //   const selected = e.value;
  //   if (selected.length > 0) {
  //     const doughItem = pOrders.find(order => order.DocEntry === selected[0].DocEntry).DoughItem;
  //     const allSameDoughItem = selected.every(order => pOrders.find(po => po.DocEntry === order.DocEntry).DoughItem === doughItem);
  //     const allNotGrouped = selected.every(order => pOrders.find(po => po.DocEntry === order.DocEntry).Group === null);

  //     if (!allSameDoughItem) {
  //       toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'All selected orders must have the same DoughItem.', life: 3000 });
  //     } else if (!allNotGrouped) {
  //       toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Selected orders must not be already grouped.', life: 3000 });
  //     } else {
  //       setSelectedOrders(selected);
  //     }
  //   } else {
  //     setSelectedOrders([]);
  //   }
  // };

  const handleSelectionChange = (e) => {
    const selected = e.value;
    const latestSelected = selected[selected.length - 1];

    if (selected.length > 0) {
      const doughItem = pOrders.find(order => order.DocEntry === latestSelected.DocEntry).DoughItem;
      const allSameDoughItem = selected.every(order => pOrders.find(po => po.DocEntry === order.DocEntry).DoughItem === doughItem);
      const allNotGrouped = selected.every(order => pOrders.find(po => po.DocEntry === order.DocEntry).Group === null);
     
      const noStartDate = selected.every(order => !pOrders.find(po => po.DocEntry === order.DocEntry).StartDate); // Verifica que no haya StartDate

      if (!allSameDoughItem) {
        toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'All selected orders must have the same DoughItem.', life: 3000 });
        setSelectedOrders(selectedOrders.filter(order => order.DocEntry !== latestSelected.DocEntry)); // Revert selection
      } 
      // else if (!allNotGrouped) {
      //   toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Selected orders must not be already grouped.', life: 3000 });
      //   setSelectedOrders(selectedOrders.filter(order => order.DocEntry !== latestSelected.DocEntry)); // Revert selection
      // } 
      
      else if (!noStartDate) {
        toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Orders that have already started cannot be grouped or ungrouped.', life: 3000 });
        setSelectedOrders(selectedOrders.filter(order => order.DocEntry !== latestSelected.DocEntry)); // Revert selection
      }
      else if (!allNotGrouped && selectedOrders.some(order => order.Group !== null)) {
        toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Some selected orders are already grouped.', life: 3000 });
      }


      else {
        setSelectedOrders(selected);
      }
    } else {
      setSelectedOrders([]);
    }
  };


  const groupByDoughItem = (orders) => {
    return orders.reduce((groups, order) => {
      const doughItem = order.DoughItem;
      if (!groups[doughItem]) {
        groups[doughItem] = [];
      }
      groups[doughItem].push(order);
      return groups;
    }, {});
  };

  const generateUniqueId = (length) => {
    return Math.random().toString(36).substr(2, length);
  };

  const updateGroupChips = async (docEntry, uniqueId) => {
    try {
      // Hacer la llamada al API para actualizar el GroupChips
      await axios.post('/api/GroupChipsOrders', { docEntry: Number(docEntry), U_CTS_GroupChips: uniqueId });
  
      // No mostramos el toast aquí; será mostrado una vez que todas las órdenes hayan sido agrupadas
    } catch (error) {
      throw error; // Lanza el error para que sea capturado en el Promise.all
    }
  };
  


  //desagrupar
  const deleteGroupChips = async (docEntry) => {
    try {
      await axios.post('/api/DeleteGroupChipsOrders', { docEntry: Number(docEntry) });
      // No mostramos el toast aquí, sino después de que todas las órdenes sean desagrupadas
    } catch (error) {
      throw error; // Lanza el error para que lo capture el Promise.all
    }
  };
  
  const reloadOrders = async () => {
    try {
      const response = await axios.get(`/api/ProductionOrder${type}`);
      setPOrders(response.data);
    } catch (error) {
      console.error('Error fetching the production orders', error);
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      const response = await axios.get(`/api/GetGroupDetail?groupId='${groupId}'`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group details', error);
      return [];
    }
  };

  const onRowExpand = async (e) => {
    const data = e.data;
    const groupId = data.Group;
    if (groupId && !groupDetails[groupId]) {
      const details = await fetchGroupDetails(groupId);
      console.log(details)
      setGroupDetails((prevDetails) => ({ ...prevDetails, [groupId]: details }));
    }
  };

  const onRowCollapse = (e) => {
    const data = e.data;
    setGroupDetails((prevDetails) => {
      const newDetails = { ...prevDetails };
      delete newDetails[data.Group];
      return newDetails;
    });
  };

  const onRowToggle = (e) => {
    const expandedRows = e.data;
    setExpandedRows(expandedRows);
  };

  const disabledCheckboxTemplate = (rowData) => {
    return (
      <input type="checkbox" disabled={rowData.Group !== null} />
    );
  };

  const infoMixes = (rowData) => {

    return rowData.Mixes + "/" + rowData.TotalMixes;
  };

  const infoPallets = (rowData) => {

    return rowData.Pallets + "/" + rowData.TotalPallets;
  };


  const handleUngroupClick = async () => {
    const groupedOrders = selectedOrders.filter(order => order.Group !== null); // Filtrar solo las órdenes agrupadas
  
    // Extraer todos los DocEntry en un array y asegurarse de que se dividen correctamente si están en formato de string
    const docEntries = groupedOrders.map(order => order.DocEntry.split(',')); // Divide si es un string con comas
  
    // Aplanar el array en caso de que el split haya generado arrays anidados
    const flattenedDocEntries = docEntries.flat().map(docEntry => docEntry.trim());
  
    try {
      // Usar Promise.all para esperar a que todas las promesas de deleteGroupChips se resuelvan
      await Promise.all(flattenedDocEntries.map(docEntry => deleteGroupChips(docEntry)));
  
      // Mostrar el toast de éxito solo cuando todas las órdenes hayan sido desagrupadas
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'All selected orders have been ungrouped', life: 3000 });
      await reloadOrders();
      setSelectedOrders([]);
    } catch (error) {
      // En caso de error, mostrar el toast de error
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to ungroup all orders', life: 3000 });
    }
  };
  

  const rowExpansionTemplate = (data) => {
    const details = groupDetails[data.Group] || [];
    return (
      <div>
        <DataTable value={details} scrollable scrollHeight="200px" style={styles.expansionTable}>
          <Column
            field="CustomerPO"
            header="Customer PO"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '30rem' }}
          />
          {/* <Column
            field="Status"
            header="Status"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '15rem' }}
          /> */}
          <Column
            field="ItemCode"
            header="SKU"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
          <Column
            field="ProdName"
            header="Product Description"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '60rem' }}
          />
          <Column
            field="DocNum"
            header="Origin POs"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '15rem' }}
          />
          <Column
            field="PlannedQty"
            header="Planned Quantity"
            body={(rowData) => parseFloat(rowData.PlannedQty).toFixed(0)}
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '15rem' }}
          />
          {/* <Column
            body={infoMixes}
            header="Mixes"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '10rem' }}
          /> */}
          <Column
            body={infoPallets}
            header="Pallets"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '10rem' }}
          />
          {/* <Column
            body={dateTemplate}
            header="Started Date"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
          <Column
            body={dateTemplateFinish}
            header="Finish Date"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          /> */}
          <Column
            body={dateTemplateDelivery}
            header="Delivery Date"
            headerStyle={styles.expansionTableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
        </DataTable>
      </div>
    );
  };

  return (
    <>
      <Card>
        <Toast ref={toast} />
        <div style={styles.header}>
          <h1 style={styles.title}>{type} Production Orders</h1>
          <div style={styles.controls}>
            <Dropdown
              value={statusFilter}
              options={statusOptions}
              onChange={onStatusChange}
              placeholder="Select a Status"
              style={styles.dropdown}
            />
            <InputText
              type="text"
              value={customerPOSearch}
              onChange={onCustomerPOSearchChange}
              placeholder="Search by Customer PO"
              style={styles.searchBox}
            />
            {group === 'Y' &&
            < >
            <Button
              label="Group"
              onClick={handleProduceClick}
              disabled={selectedOrders.length === 0 || selectedOrders.some(order => order.Group !== null)}
              style={styles.groupButton}
            />
            <span>   </span>
            <Button
              label="Ungroup"
              onClick={handleUngroupClick}
              disabled={selectedOrders.length === 0 || selectedOrders.every(order => order.Group === null)} // Deshabilitar si no hay órdenes agrupadas
              style={styles.ungroupButton}
            />
             </>}
          </div>
        </div>
        <DataTable
          value={filteredOrders}
          paginator
          rows={10}
          selection={selectedOrders}
          onSelectionChange={handleSelectionChange}
          selectionMode="multiple"
          dataKey="DocEntry"
          scrollable
          scrollHeight="flex"
          expandedRows={expandedRows}
          onRowToggle={onRowToggle}
          onRowExpand={onRowExpand}
          onRowCollapse={onRowCollapse}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column expander style={{ width: '3em' }}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody} />

          {group === 'Y' && (
            <Column
              selectionMode="multiple"
              onSelectionChange={handleSelectionChange}
              body={disabledCheckboxTemplate}
              headerStyle={styles.tableHeader}
              bodyStyle={styles.tableBody}
            />
          )}

          <Column
            body={linkTemplate}
            header="Customer PO"
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '30rem' }}
          />
          <Column
            field="Status"
            header="Status"
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '15rem' }}
          />
          <Column
            field="ItemCode"
            header="SKU"
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
          <Column
            field="ProdName"
            header="Product Description"
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '60rem' }}
          />
          <Column
            field="DocNum"
            header="Origin POs"
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '15rem' }}
          />
          <Column
            field="PlannedQty"
            header="Planned Quantity"
            body={(rowData) => `${parseFloat(rowData.PlannedQty).toFixed(0)} ${rowData.SalUnitMsr}`}
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody1}
            style={{ width: '15rem' }}
          />
          <Column
            body={infoMixes}
            header="Mixes"
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '10rem' }}
          />
          {/* <Column
            body={infoPallets}
            header="Pallets"
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '10rem' }}
          /> */}
          <Column
            body={dateTemplate}
            header="Started Date"
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
          <Column
            body={dateTemplateFinish}
            header="Finish Date"
            headerStyle={styles.tableHeader}
            bodyStyle={styles.tableBody}
            style={{ width: '20rem' }}
          />
          <Column
            body={dateTemplateDelivery}
            header="Delivery Date"
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
  dropdown: {
    marginRight: '10px',
  },
  table: {
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: 'var(--primary-color-light)',
    color: 'var(--primary-color-text)',
    padding: '0.5rem'
  },
  tableBody: {},
  expansionTable: {
    marginTop: '10px',
    borderRadius: '5px',
    backgroundColor: 'var(--primary-color-light)',
    padding: '10px',
    fontSize: '11px'
  },
  expansionTableHeader: {
    backgroundColor: 'var(--primary-color-light)',
    color: 'var(--primary-color)',
    padding: '0.5rem',
    fontSize: '11px'
  },
  searchBox: {
    // height: '4.5vh',
    marginRight: '1rem'
  },
  groupButton: {
    // height: '4.5vh',
  },
  ungroupButton: {
    backgroundColor: 'var(--primary-color)',
    color: 'var(--primary-color-text)',
  },
  
};


export default ProductionOrders;

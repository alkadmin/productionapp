"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import WarningDialog from '../../components/Warning/Warning';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import Issues from '../../components/Issues/Issues';
import IssueProduction from '../../components/IssueProduction/IssueProduction';
import ReceiptProduction from '../../components/ReceiptProduction/ReceiptProduction';
import BackButton from '../../components/BackButton/BackButton';
import Timer from '../../components/Timer/Timer';
import Mixes from '../../components/Mixes/Mixes';
import Pallets from '../../components/Pallets/Pallets';
import combineDateAndTime from '../../utilities/functions';
import substractTime from '../../utilities/timeBack'
import { ProgressSpinner } from 'primereact/progressspinner';
import formatNumber from '../../utilities/formatNumber';
const ProductionOrder = () => {

  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [orderEntries, setOrderEntries] = useState(null);
  const [allItems, setAllItems] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isIssueDialogVisible, setIsIssueDialogVisible] = useState(false);
  const [isReceiptDialogVisible, setIsReceiptDialogVisible] = useState(false);
  const [isMixesDialogVisible, setIsMixesDialogVisible] = useState(false);
  const [isPalletsDialogVisible, setIsPalletsDialogVisible] = useState(false);
  const [issuesByShift, setIssuesByShift] = useState(false);
  const [isIssuesDialogVisible, setIsIssuesDialogVisible] = useState(false);
  const [controlByPallets, setControlByPallets] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [pauseTime, setPauseTime] = useState(null);
  const [restarTime, setRestarTime] = useState(null);
  const [enable, setEnable] = useState(false);
  const toast = useRef(null);
  const [textWarning, setTextWarning] = useState('Are you sure you want to finalize the production? Once the Production Order is closed, you will no longer be able to add new mixes or receive finished goods. If you agree, click OK; otherwise, click Cancel');
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [doughtRemainign, setDoughtRemainign] = useState(false);
  const [mixesByShift, setMixesByShift] = useState(false);
  const [shift, setShift] = useState(localStorage.getItem("shift"));
  const [line, setLine] = useState(localStorage.getItem("line"));
  const [orderHeader, setOrderHeader] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_API_UR;

  console.log(BASE_URL)

  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    // Si ya hay un timeout en curso, lo limpia
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Programa un nuevo timeout para refrescar la página en 1 minuto
    timeoutRef.current = setTimeout(() => {
      window.location.reload();
      console.log("Refrescando la página debido a inactividad...");
    }, 60000); // 60000 ms = 1 minuto
  };

  useEffect(() => {
    // Inicia el timeout al montar el componente
    resetTimeout();

    // Escucha eventos de clic en el botón
    document.addEventListener('click', resetTimeout);
    document.addEventListener('keypress', resetTimeout); // Para capturar eventos de teclado también

    // Limpia los eventos y el timeout al desmontar
    return () => {
      clearTimeout(timeoutRef.current);
      document.removeEventListener('click', resetTimeout);
      document.removeEventListener('keypress', resetTimeout);
    };
  }, []);

  const handleProduceClick = (child) => {




    if (child.ItemCode2.startsWith('PKG')) {
      router.push(`/production/${child.POChildrenDocEntryPck}`);

    }
    else {
      router.push(`/productionChips/${child.POChildrenDocEntry}`);
    }





    ///REVISAR



  };

  const addDaysToDate = (date, days) => {
    const result = new Date(date);
    const daysToAdd = parseFloat(days);

    // Obtener la hora actual del objeto date
    const currentHour = result.getHours();

    // Si la hora es entre 00:00 y 5:59 AM, restar un día antes de agregar los días
    if (currentHour >= 0 && currentHour < 6) {
      result.setDate(result.getDate() - 1);
    }

    // Agregar los días solicitados
    result.setDate(result.getDate() + daysToAdd);

    return result;
  };


  //ISSUE DIALAGO
  const showIssueDialog = (rowData) => {
    setSelectedRowData(rowData);
    setIsIssueDialogVisible(true);
  };



  const hideIssuesDialog = () => {
    setIsIssuesDialogVisible(false);
  };

  const hideIssueDialog = (isSaved, isConfirmed) => {
    setIsIssueDialogVisible(false);
    setSelectedRowData(null);
    fetchOrder();

    if (isConfirmed && order[0].ProduccionGO) {
      setIsReceiptDialogVisible(true);
    }

    setIsSaved(false);
  };



  ///BATCH DIALOG

  const showBatchDialog = () => {
    setSelectedRowData(order);
    setIsReceiptDialogVisible(true);
  };

  const showMixesDialog = (id) => {
    if (order[0].TypeDetail === 'Mixes') {
      setIsMixesDialogVisible(true);
    }
  };

  const showIssuesDialog = (id) => {

    setIsIssuesDialogVisible(true);

  };

  const showPalletsDialog = (id) => {
    if (order[0].TypeDetail === 'Pallets') {
      setIsPalletsDialogVisible(true);
    }
  };



  const showReceiptDialog = () => {
    setIsReceiptDialogVisible(true);
  };



  const hideReceiptDialog = () => {
    setIsReceiptDialogVisible(false);
    setSelectedRowData(null);
    fetchOrder();
  };

  const hideMixesDialog = () => {
    setIsMixesDialogVisible(false);
  };

  const hidePalletsDialog = () => {
    setIsPalletsDialogVisible(false);
  };


  const validateIssuedQuantities = () => {

    const items = order.filter(item => item.Type === 'Item');


    const isValid = items.every(item => {
      const issuedQty = parseFloat(item.IssuedQty || 0);
      const plannedQty = parseFloat(item.PlannedQtyLine || 0);
      return issuedQty > plannedQty * 0.75;
    });


    console.log(isValid)
    if (!isValid) {
      toast.current.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Some components have not been issued. Please review the components related to seasoning/oil.'
      });
    }

    return isValid;
  };

  const handlePauseProduction = async () => {
    var formatDate;
    if (orderHeader.pauseDate) {
      formatDate = new Date(combineDateAndTime(order[0].PauseDate, order[0].PauseTime));
    } else {
      formatDate = new Date(combineDateAndTime(order[0].StartDate, order[0].StartTime));
    }
    const docEntries = orderHeader.DocEntry.split(',');

    const pauseDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}${minutes}`;

    const startTime = formatDate;
    const elapsedTime = currentTime - startTime;
    const elapsedHours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const elapsedSeconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
    const elapsedFormatted = `${elapsedHours}:${elapsedMinutes < 10 ? '0' : ''}${elapsedMinutes}:${elapsedSeconds < 10 ? '0' : ''}${elapsedSeconds}`;

    const promises = docEntries.map(async (docEntry) => {
      const payload = {
        docEntry: String(docEntry),
        updateData: {
          U_CTS_PDate: pauseDate,
          U_CTS_PTime: formattedTime,
          U_CTS_Paused: 'Y',
          U_CTS_CosumeT: elapsedFormatted,
        },
      };

      try {
        const response = await fetch(`/api/UpdateProductionOrder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: `Production for DocEntry ${docEntry} paused successfully` });
          setPauseTime(elapsedFormatted);
        } else {
          toast.current.show({ severity: 'error', summary: 'Error', detail: result.message || 'An unexpected error occurred' });
        }
      } catch (error) {
        console.error(`Error pausing production for DocEntry ${docEntry}:`, error);
        toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to pause production for DocEntry ${docEntry}` });
      }
    });

    await Promise.all(promises);
    fetchOrder();
    setEnable(true);
  };

  const handleResumeProduction = async () => {
    if (orderHeader.IsPaused === 'Y') {
      const docEntries = orderHeader.DocEntry.split(',');

      const promises = docEntries.map(async (docEntry) => {
        const payload = {
          docEntry: String(docEntry),
          updateData: {
            U_CTS_Paused: 'N',
          },
        };

        try {
          const response = await fetch(`/api/UpdateProductionOrder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (response.ok) {
            toast.current.show({ severity: 'success', summary: 'Success', detail: `Production for DocEntry ${docEntry} resumed successfully` });
          } else {
            toast.current.show({ severity: 'error', summary: 'Error', detail: result.message || 'An unexpected error occurred' });
          }
        } catch (error) {
          console.error(`Error resuming production for DocEntry ${docEntry}:`, error);
          toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to resume production for DocEntry ${docEntry}` });
        }
      });

      await Promise.all(promises);
      setRestarTime(substractTime(order[0].ConsumedTime));
    }

    fetchOrder();
    setEnable(true);
  };

  const handleStartProduction = async () => {
    setLoadingStart(true);


    if (!orderHeader.StartTime) {
      const docEntries = orderHeader.DocEntry.split(',');

      const promises = docEntries.map(async (docEntry) => {
        const startDate = new Date().toLocaleDateString();
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const formattedTime = `${hours}:${minutes}`;

        const payload = {
          DocEntry: docEntry,
          StartDate: startDate,
          U_CTS_STime: formattedTime,
        };

        console.log(payload)
        try {
          const token = localStorage.getItem('Token');
          const response = await fetch(`${BASE_URL}/Production/ProductionOrder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (response.ok) {
            toast.current.show({ severity: 'success', summary: 'Success', detail: `Production for DocEntry ${docEntry} started successfully` });
          } else {
            toast.current.show({ severity: 'error', summary: 'Error', detail: result.message || 'An unexpected error occurred' });
          }
        } catch (error) {
          console.error(`Error starting production for DocEntry ${docEntry}:`, error);
          toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to start production for DocEntry ${docEntry}` });
        }
      });

      await Promise.all(promises);
      setLoadingStart(false);
      setStartTime(new Date());
    }

    fetchOrder();
    setEnable(true);
  };


  const handleEndProductionClick = () => {

    if (validateIssuedQuantities()) {
      setIsWarningVisible(true);
    }
  };

  // const handleEndProduction = async () => {


  //   setLoading(true);
  //   const closeDate = new Date().toLocaleDateString();
  //   const token = localStorage.getItem('Token');
  //   const docEntries = order[2].DocEntry.split(',');

  //   try {
  //     const promises = docEntries.map(async (docEntry) => {
  //       const payload = {
  //         DocEntry: docEntry,
  //         docDueDate: closeDate,
  //         Status: 'Closed',
  //       };

  //       const response = await fetch(`${BASE_URL}/Production/ProductionOrder`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(payload),
  //       });

  //       const result = await response.json();

  //       if (response.ok) {
  //         toast.current.show({ severity: 'success', summary: 'Success', detail: `Production order ${docEntry} closed successfully` });
  //       } else {
  //         toast.current.show({ severity: 'error', summary: 'Error', detail: result.Message || 'An unexpected error occurred' });
  //       }

  //       return result; // Return the result for further processing if needed
  //     });

  //     const results = await Promise.all(promises);
  //     fetchOrder();
  //   } catch (error) {
  //     console.error('Error closing production orders:', error);
  //     toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to close production orders' });
  //   } finally {
  //     setLoading(false);
  //   }

  //   setEndTime(new Date());
  //   setEnable(false);
  //   setIsWarningVisible(false);
  // };

  const handleEndProduction = async () => {
    setLoading(true);
    const closeDate = new Date().toLocaleDateString();
    const token = localStorage.getItem('Token');

    try {
      // Procesar solo orderEntries
      const orderEntryPromises = orderEntries.map(async (entry) => {
        const payload = {
          DocEntry: entry.DocEntry,
          docDueDate: closeDate,
          Status: 'Closed',
        };

        console.log(payload);
        const response = await fetch(`${BASE_URL}/Production/ProductionOrder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.Message || `Failed to close production order ${entry.DocEntry}`);
        }

        return result; // Return the result for further processing if needed
      });

      // Ejecuta todas las promesas y espera hasta que todas se completen
      await Promise.all(orderEntryPromises);

      // Mostrar mensaje de éxito una vez que todas las promesas se han resuelto
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'All production orders closed successfully' });

      fetchOrder(); // Llamar a fetchOrder para actualizar los datos después de cerrar las órdenes
    } catch (error) {
      console.error('Error closing production orders:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to close production orders' });
    } finally {
      setLoading(false);
    }

    setEndTime(new Date());
    setEnable(false);
    setIsWarningVisible(false);
  };



  const fetchControlByPallets = async (originNum) => {
    try {
      const response = await fetch(`/api/ControlByPallets?originNum=${originNum}`);
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setControlByPallets(data[0]);
        console.log(data);
      } else {
        console.error('Error fetching control by pallets:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching control by pallets:', error);
    }
  };


  const fetchControlDought = async (originNum, GroupId) => {
    try {
      const response = await fetch(`/api/ControlByDoughtChips?GroupId='${GroupId}'&&originNum=${originNum}`);
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setDoughtRemainign(data[0]);
        console.log(data);
      } else {
        console.error('Error fetching control by dought:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching control by dought:', error);
    }
  };



  const fetchIssuesByShift = async (docentry, shift, line) => {
    try {
      console.log(shift)
      const response = await fetch(`/api/IssuesByShift?docentry=${docentry}&shift='${shift}'&line='${line}'`);
      const data = await response.json();
      console.log(data)
      if (response.ok) {


        setIssuesByShift(data[0].MixesShift);

      } else {
        console.error('Error fetching control by pallets:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching control by pallets:', error);
    }
  };

  const fetchMixesByShift = async (docentry, shift, line) => {
    try {
      console.log(docentry.split(',')[0])

      const response = await fetch(`/api/MixesByShift?docentry=${docentry.split(',')[0]}&shift='${shift}'&line='${line}'`);
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setMixesByShift(data[0].MixesShift);

      } else {
        console.error('Error fetching control by pallets:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching control by pallets:', error);
    }
  };

  const fetchOrder = async () => {
    const response = await fetch(`/api/OneProductionOrderChips/${id}`);
    const data = await response.json();
    setOrder(data);
    console.log(data)

    const header = data.find(order => order.QtyComponents);
    setOrderHeader(header)
    console.log(header)
    fetchIdsPOs(header?.OriginNum);
    fetchControlDought(data[0]?.OriginNum, data[0]?.GroupParent)


    const allItemsCheck = data.every((child) => child.Type === 'Item');
    setAllItems(allItemsCheck);
  };

  const fetchIdsPOs = async (id) => {
    try {
      // Dividir el id por comas para obtener múltiples valores
      const ids = id.split(',');

      // Mapear cada id a una promesa fetch
      const fetchPromises = ids.map(async (singleId) => {
        const response = await fetch(`/api/AllPOrdersTortillas?id=${singleId.trim()}`);
        return await response.json();
      });

      // Esperar a que todas las promesas se resuelvan
      const results = await Promise.all(fetchPromises);

      // Combinar todas las respuestas en un solo array
      const combinedData = results.flat();

      // Pasar el array combinado a setOrderEntries
      setOrderEntries(combinedData);
      console.log(combinedData)
    } catch (error) {
      console.error('Error fetching POs:', error);
      // Manejo de errores, si es necesario
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);




  useEffect(() => {
    if (order) {
      fetchControlByPallets(order[0]?.OriginNum);
    }
  }, [order]);

  useEffect(() => {
    if (order) {

      //  console.log(shift)
      fetchMixesByShift(order[0]?.DocEntry, shift, line);

      fetchIssuesByShift(order[0]?.DocEntry, shift, line);
    }
  }, [order]);

  if (!order) {
    return <div>Loading...</div>;
  }



  const handleButtonClick = async (order) => {
    if (order[0]?.TypeDetail === 'Pallets') {

      console.log(doughtRemainign)
      // Aquí pones tu condición
      const dif = Number(doughtRemainign.Produced) - Number(doughtRemainign.Issued)
      console.log(dif)
      console.log(doughtRemainign.Min)
      if (Number(dif) >= Number(doughtRemainign.Min)) {

        showIssueDialog(order);
      } else {
        toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'There is not enough dough quantity to continue generating pallets. Please complete mixes.' });

      }
    } else {
      showIssueDialog(order);
    }
  };
  const actionTemplate = (rowData) => {

    return (



      <>
        {rowData.Type === 'PO' && (
          <Button
            label={order[0].CloseDate || order[0].IsPaused === 'Y' ? "Review" : "Produce"}
            className="p-button-info"
            onClick={() => handleProduceClick(rowData)}
            disabled={order[0].CloseDate ? false : (!order[0].StartTime || order[0].CloseDate)}
            rounded
          />
        )}
        {rowData.Type === 'Item' && (
          <Button
            label="Issue"
            className="p-button-warning"
            onClick={() => showIssueDialog(rowData)}
            disabled={!order[0].StartTime || order[0].CloseDate}
            rounded
          />
        )}
      </>
    );
  };

  const options = { month: '2-digit', day: '2-digit', year: 'numeric' };

  return (
    <div>
      <Toast ref={toast} position="top-right" style={{ marginTop: '60px', zIndex: 9999 }} />
      <Card title={<span><BackButton /> Production Order </span>} className="p-card">
        {loadingStart && (
          <div className="p-d-flex p-jc-center p-ai-center" style={{ marginTop: '1rem' }}>
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          </div>
        )}
        <div className="header-prod">
          <div className="p-col-12 p-md-6">
            <div><b>Customer PO:</b> {orderHeader?.CustomerPO}</div>

            <div><b>Product No.:</b> {orderHeader?.ItemCode}</div>
            <div><b>Product Description:</b> {orderHeader?.ProdName}</div>
            {order[0]?.ParentOrKid === 'Kid' && order[0]?.ProduccionGO && <div><b>Planned Quantity:</b>  {formatNumber(parseFloat(order[0]?.PlannedQty))} EA ({Math.ceil(formatNumber(Number(order[0]?.PlannedQty)) / order[0].UndXPallet)} Pallets)</div>}
            {order[0]?.ParentOrKid === 'Parent' && !order[0]?.ProduccionGO && <div><b>Planned Quantity:</b>  {formatNumber(parseFloat(orderHeader.PlannedQty))} EA ({orderHeader.PalletTotal} Pallets)</div>}
            {order[0]?.ParentOrKid == 'Kid' && !order[0]?.ProduccionGO && <div><b>Planned Quantity:</b>  {formatNumber(Number(order[0]?.PlannedQty))} Mixes</div>}
            <div><b>Warehouse:</b> {order[0]?.Warehouse}</div>
            <div><b>Best Buy Date:</b> {formatDate(addDaysToDate(new Date(), order[0]?.BestBeforeDays))}</div>
          </div>
          <div className="p-col-12 p-md-6">
            <div><b>Status:</b> {order[0]?.Status}</div>

            <div><b>Delivery Date:</b> {new Date(order[0]?.CreateDate).toLocaleDateString('en-US', options)}</div>
            {!allItems && <div><b>Start Date:</b> {order[0]?.StartDate ? new Date(order[0]?.StartDate).toLocaleDateString('en-US', options) : ''}</div>}
            {!allItems && <div><b>Finish Date:</b> {order[0]?.DueDate ? new Date(order[0]?.DueDate).toLocaleDateString('en-US', options) : ''}</div>}
            <div><b>No. (PO):</b> {orderHeader?.DocNum}</div>
            {allItems && <div style={{ 'color': '#007ad9', 'padding-top': '1rem', 'fontSize': '24px' }}><b>{order[0]?.TypeDetail === 'Pallets' ? "#Pallets " + line + ' ' + shift + ':' : "#Mixes " + line + ' ' + shift + ':'}</b>  {(order[0]?.TypeDetail === 'Mixes' ? (mixesByShift === null ? 0 : mixesByShift) : order[0]?.Pallets + '/' + Math.ceil(formatNumber(Number(order[0]?.PlannedQty)) / order[0].UndXPallet))}</div>}

            <br />
            {!allItems && (
              <div>
                <Button
                  rounded
                  label={`🏭 Issues ` + line + '-' + shift + ': ' + issuesByShift}

                  className="p-button-warning p-mr-2"
                  onClick={() => {

                    showIssuesDialog(order[0]?.DocEntry);

                  }}
                />
              </div>
            )}


          </div>
          <div className="p-col-12 p-md-6" >
            {!allItems && <Timer
              startTime={order[0]?.StartTime ? combineDateAndTime(order[0].StartDate, order[0].StartTime) : startTime}
              endTime={order[0]?.CloseTime ? combineDateAndTime(order[0].CloseDate, order[0].CloseTime) : endTime}
              pauseTime={pauseTime || order[0]?.ConsumedTime}
              IsPaused={order[0]?.IsPaused}
              restarTime={restarTime}

              consumedTime={order[0]?.ConsumedTime}
            />}
            <div className="production-buttons">
              {!allItems && (
                <>
                  {!order[0]?.StartTime && <Button label="Start" icon="pi pi-play" className="p-button-success p-mr-2" onClick={handleStartProduction} disabled={!!startTime || order[0]?.StartTime} rounded />}
                  <Button label="Close PO" icon="pi-stop-circle" className="p-button-danger" onClick={handleEndProductionClick} disabled={!order[0]?.StartTime || order[0].CloseDate} rounded />
                  {order[0]?.IsPaused === 'N' && order[0]?.StartTime && <Button label="Pause" icon="pi pi-pause" className="p-button font-bold" onClick={handlePauseProduction} disabled={order[0]?.IsPaused === 'Y' || order[0].CloseDate} rounded />}
                  {order[0]?.IsPaused === 'Y' && <Button label="Resume" icon="pi-reply" onClick={handleResumeProduction} disabled={order[0]?.IsPaused === 'N' || order[0].CloseDate} rounded style={{ backgroundColor: '#2196F3', borderColor: '#2196F3', color: '#fff' }} />}
                </>
              )}
            </div>
          </div>
          {allItems && (<div className="p-col-12 p-md-6">



            <div className='production-buttons'>
              {allItems && (
                <div className='production-buttons'>
                  {/* {order[0].ProduccionGO !== 'Y' && <Button label="Product Reception" className="p-button-danger" onClick={showBatchDialog} disabled={order[0].CloseDate}  rounded/>} */}
                  <Button
                    label={order[0]?.TypeDetail === 'Pallets' ? "Add Pallet" : "Add Mix"}
                    className="p-button-success p-mr-2"
                    onClick={() => handleButtonClick(order)}
                    disabled={
                      order[0].CloseDate ||
                      order[0].ParentPaused === 'Y'
                      // ||
                      // (order[0]?.TypeDetail === 'Pallets' && order[0]?.PalletsFlt === 0) ||
                      // (order[0]?.TypeDetail === 'Mixes' )

                    }
                    rounded
                  />


                </div>
              )}
              {allItems && (
                <div>
                  <Button
                    rounded
                    label={order[0]?.TypeDetail + ': ' + (order[0]?.TypeDetail === 'Mixes' ? order[0]?.Mixes + '/' + Math.ceil(order[0].PlannedQty) : order[0]?.Pallets + '/' + Math.ceil(order[0].PlannedQty))}
                    className="p-button-warning p-mr-2"
                    onClick={() => {
                      if (order[0]?.TypeDetail === 'Mixes') {
                        showMixesDialog(order[0]?.DocEntry);
                      } else {
                        showPalletsDialog(order[0]?.DocEntry);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>)}
        </div>
      </Card>
      <Card title="Components" className="p-card p-mt-3">
        <div className="p-datatable-wrapper">
          <DataTable value={order} scrollable scrollHeight="400px">
            {/* <Column field="Type" header="Type" /> */}
            {/* <Column field="ItemCode2" header="Product" /> */}



            <Column
              field="ItemCode2"
              header="Product"
              body={(rowData) => rowData.Type === "PO"&&!rowData.ItemCode2.startsWith("DOH") ? `${rowData.ItemCode2}-(${rowData.CustomerPO})` : rowData.ItemCode2}
            />

            <Column field="ItemName" header="Description" />



            {/* {allItems &&<Column field="Und" header="Und" />} */}
            <Column field="BaseQtyLine" header="Base Quantity" body={(rowData) => formatNumber(parseFloat(rowData.BaseQtyLine))} />
            <Column field="PlannedQtyLine" header="Planned" body={(rowData) => formatNumber(parseFloat(rowData.PlannedQtyLine))} />


            {!allItems && <Column field="QtyChildrenCmpl" header="Produced" body={(rowData) => formatNumber(parseFloat(rowData.QtyChildrenCmpl || 0))} />}
            <Column field="IssuedQty" header="Issued" body={(rowData) => formatNumber(parseFloat(rowData.IssuedQty))} />
            {!allItems && <Column field="POChildrenDocNum" header="Child PO" />}
            {!allItems && <Column body={actionTemplate} header="Actions" />}


          </DataTable>
        </div>
      </Card>
      <IssueProduction
        chips={"true"}
        visible={isIssueDialogVisible}
        onHide={hideIssueDialog}
        data={selectedRowData}
        pallet={order[0]?.ProduccionGO}
        onSave={() => setIsSaved(true)}
        parentEntry={order[0]?.POParentDocEntry}
        ParentOrKid={order[0]?.ParentOrKid}
      />
      <ReceiptProduction

        visible={isReceiptDialogVisible}
        onHide={hideReceiptDialog}
        data={{
          ItemCode: order[0]?.ItemCode,
          plannedQty: order[0]?.PlannedQty,
          baseEntry: order[0]?.DocEntry,
          dueDate: order[0]?.DueDate,
          DocEntryParent: order[0]?.POParentDocEntry,
          LineNumParent: order[0]?.POParentLineNum,
          warehouse: order[0]?.Warehouse,
          ParentItemCode: order[0]?.POParentItemCode,
          TypePO: order[0]?.TypePO,
          ProduccionGO: order[0]?.ProduccionGO,
          ProdName: order[0]?.ProdName,
          UndXPallet: order[0]?.UndXPallet,
          PlantId: order[0]?.PlantId,
          bestBefore: addDaysToDate(new Date(), order[0]?.BestBeforeDays),
          binCode: order[0]?.BinCode,
          binEntry: order[0]?.AbsEntry,
          PalletsFlt: order[0]?.PalletsFlt,
          PO: order[0]?.CustomerPO,
          type: order[0]?.Type,
          POParentItemCode: order[0]?.POParentItemCode

        }}
      />

      <Mixes visible={isMixesDialogVisible} onHide={hideMixesDialog} id={order[0]?.DocEntryPOMixes} chips={'1'} />
      <Issues visible={isIssuesDialogVisible} onHide={hideIssuesDialog} id={order[0]?.DocEntryPOMixes} chips={'1'} />
      <Pallets visible={isPalletsDialogVisible} onHide={hidePalletsDialog} id={order[0]?.POParentDocEntry} />
      <WarningDialog visible={isWarningVisible} onHide={() => setIsWarningVisible(false)}
        loading={loading}
        setLoading={setLoading}
        onConfirm={handleEndProduction}
        text={textWarning} />
    </div>
  );
};

export default ProductionOrder;

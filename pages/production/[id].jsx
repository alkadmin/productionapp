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
import IssueProduction from '../../components/IssueProduction/IssueProduction';
import ReceiptProduction from '../../components/ReceiptProduction/ReceiptProduction';
import BackButton from '../../components/BackButton/BackButton';
import Timer from '../../components/Timer/Timer';
import Mixes from '../../components/Mixes/Mixes';
import Issues from '../../components/Issues/Issues';
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
 
  const [isIssuesDialogVisible, setIsIssuesDialogVisible] = useState(false);
  const [isPalletsDialogVisible, setIsPalletsDialogVisible] = useState(false);
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
  const [doughtRemainign,setDoughtRemainign]= useState(false);
  const [mixesByShift,setMixesByShift]= useState(false);
  const [issuesByShift,setIssuesByShift]= useState(false);
  const [palletByShift,setPalletByShift]=useState(false)
  const [shift, setShift] = useState(localStorage.getItem("shift"));
  const [line, setLine] = useState(localStorage.getItem("line"));
  const BASE_URL = process.env.NEXT_PUBLIC_API_UR;
  const API = process.env.API
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




   

    const validateIssuedQuantities = () => {
   
      const items = order.filter(item => item.Type === 'Item');
  
     
      const isValid = items.every(item => {
          const issuedQty = parseFloat(item.IssuedQty || 0);
          const plannedQty = parseFloat(item.PlannedQtyLine || 0);
          console.log(issuedQty,plannedQty*0.75 )
          return issuedQty > plannedQty*0.75;
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

  const handleEndProductionClick = () => {
   

 

    if (order[0]?.ChipsInd=="CHIPS"){
    if (validateIssuedQuantities()) {
        setIsWarningVisible(true); 
    }
  }
  else{
    setIsWarningVisible(true); 
  }
};

  const handleProduceClick = (child) => {

    // fetchControlByPallets(child.OriginNum);


    // if (child.ItemCode2.startsWith('PKG') ) {
      // const difference = order
      //   .filter((item) => item.ItemCode2.startsWith('DOH'))
      //   .map((item) => parseFloat(item.QtyChildrenCmpl - item.IssuedQty))
      //   .reduce((acc, value) => acc + value, 0);


      // console.log('first')
      // console.log(difference)
      // console.log(controlByPallets.Flag)

      // if ((Number(difference) < Number(controlByPallets.Flag)) && order[0].ParentPaused === 'N') {
      //   console.log(difference);
      //   console.log(controlByPallets.Flag)

      //   toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'There is not enough dough quantity to continue generating pallets. Please complete mixes.' });


      // }
      // else {
      //   router.push(`/production/${child.POChildrenDocEntry}`);
      // }



   
      //  }
       router.push(`/production/${child.POChildrenDocEntry}`);
   

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

  // const hideIssueDialog = (isSaved) => {
  //   setIsIssueDialogVisible(false);
  //   setSelectedRowData(null);
  //   fetchOrder();

  //   if (order[0].ProduccionGO) {
  //     setIsReceiptDialogVisible(true);
  //   }

  //   setIsSaved(false);
  // };


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

  const hideIssuesDialog = () => {
    setIsIssuesDialogVisible(false);
  };

  const hidePalletsDialog = () => {
    setIsPalletsDialogVisible(false);
  };

 

  const handlePauseProduction = async () => {
    var formatDate
    if (order[0].pauseDate) {

      formatDate = new Date(combineDateAndTime(order[0].PauseDate, order[0].PauseTime));
    }
    else {
      formatDate = new Date(combineDateAndTime(order[0].StartDate, order[0].StartTime));
    }
    const docEntry = order[0].DocEntry;

    // Formato de fecha y hora correctos
    const pauseDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}${minutes}`; // Formato HHmm

    // Calcular la diferencia entre el tiempo de inicio y el tiempo de pausa
    const startTime = formatDate;
    const elapsedTime = currentTime - startTime;
    const elapsedHours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const elapsedSeconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
    const elapsedFormatted = `${elapsedHours}:${elapsedMinutes < 10 ? '0' : ''}${elapsedMinutes}:${elapsedSeconds < 10 ? '0' : ''}${elapsedSeconds}`;
    console.log(elapsedFormatted)
    const payload = {
      docEntry: String(docEntry),
      updateData: {
        U_CTS_PDate: pauseDate,
        U_CTS_PTime: formattedTime,
        U_CTS_Paused: 'Y',
        U_CTS_CosumeT: elapsedFormatted
      }
    };

    console.log(payload);
    try {
      const response = await fetch(`/api/UpdateProductionOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Production paused successfully' });
        setPauseTime(elapsedFormatted);

      } else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: result.message || 'An unexpected error occurred' });
      }
    } catch (error) {
      console.error('Error pausing production:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to pause production' });
    }


    fetchOrder();
    setEnable(true);
  };

  const handleResumeProduction = async () => {


    if (order[0].IsPaused === 'Y') {
      const docEntry = order[0].DocEntry;

      //   const resumeDate = new Date().toISOString().split('T')[0];
      //   const currentTime = new Date();
      //   const hours = currentTime.getHours().toString().padStart(2, '0');
      //   const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      //   const formattedTime = `${hours}${minutes}`;

      const payload = {
        docEntry: String(docEntry),
        updateData: {
          U_CTS_Paused: 'N'
        }
      };

      //   console.log(payload);
      try {
        const response = await fetch(`/api/UpdateProductionOrder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Production resumed successfully' });

        } else {
          toast.current.show({ severity: 'error', summary: 'Error', detail: result.message || 'An unexpected error occurred' });
        }
      } catch (error) {
        console.error('Error resuming production:', error);
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to resume production' });
      }

      setRestarTime(substractTime(order[0].ConsumedTime))
    }

    fetchOrder();
    setEnable(true);
  };

  const handleStartProduction = async () => {
    setLoadingStart(true)
    if (!order[0].StartTime) {
      const docEntry = order[0].DocEntry;
      const startDate = new Date().toLocaleDateString();
      const currentTime = new Date();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const formattedTime = `${hours}:${minutes}`;

      const payload = {
        DocEntry: docEntry,
        StartDate: startDate,
        U_CTS_STime: formattedTime,
        U_CTS_Session:localStorage.getItem('sessionCode')

      };

      console.log(payload)
      try {
        const token = localStorage.getItem('Token');
        const response = await fetch(`${BASE_URL}/Production/ProductionOrder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Production started successfully' });
        } else {
          toast.current.show({ severity: 'error', summary: 'Error', detail: result.message || 'An unexpected error occurred' });
        }
      } catch (error) {
        console.error('Error starting production:', error);
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to start production' });
      }
      finally {
        setLoadingStart(false)
      }

      setStartTime(new Date());
    }

    fetchOrder();
    setEnable(true);
  };

  const handleEndProduction = async () => {
    setLoading(true);
    const closeDate = new Date().toLocaleDateString();
    const token = localStorage.getItem('Token');
    console.log(`${BASE_URL}/Production/ProductionOrder`);
  
    try {
      const promises = orderEntries.map(async (entry) => {
        const payload = {
          DocEntry: entry.DocEntry,
          docDueDate: closeDate,
          Status: "Closed",
        };
  
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
          throw new Error(result.Message || `Failed to close production order ${payload.DocEntry}`);
        }
  
        return result;
      });
  
      // Espera a que todas las promesas se resuelvan
      await Promise.all(promises);
  
      // Mostrar un solo mensaje de éxito cuando todas las órdenes se hayan cerrado correctamente
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'All production orders closed successfully' });
  
      fetchOrder(); // Actualiza los datos después de cerrar las órdenes
    } catch (error) {
      console.error('Error closing production orders:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to close production orders' });
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








  const fetchDoughtVariation = async (originNum, docentry) => {
    try {
      // Corregir la construcción de la URL con un separador '&'
      const response = await fetch(`/api/ControlByDoughtChipsVariation?originNum=${originNum}&DocEntry=${docentry}`);
      
      // Procesar la respuesta
      const data = await response.json();
  
      // Verificar si la respuesta fue exitosa
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
  


  const fetchMixesByShift = async (docentry, shift,line) => {
    try {
      console.log(shift)
      const response = await fetch(`/api/MixesByShift?docentry=${docentry}&shift='${shift}'&line='${line}'`);
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



  const fetchIssuesByShift = async (docentry, shift,line) => {
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

  const fetchPalletByShift = async (docentry, shift,line) => {
    try {
      console.log(shift)
      const response = await fetch(`/api/PalletByShift?docentry=${docentry}&shift='${shift}'&line='${line}'`);
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setPalletByShift(data[0].PalletsShift);
      
      } else {
        console.error('Error fetching control by pallets:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching control by pallets:', error);
    }
  };


  const fetchOrder = async () => {
    const response = await fetch(`/api/OneProductionOrder/${id}`);
    const data = await response.json();
    setOrder(data);
    console.log(data)
    console.log(data[0]?.ChipsInd)
    fetchIdsPOs(data[0]?.OriginNum);
    console.log(data[0]?.GroupParent)


    if(data[0]?.POParentItemCode && data[0]?.POParentItemCode.substring(0, 3) === 'VP-'  && !data[0]?.GroupParent )
      {
        fetchControlDoughtVariety(data[0]?.OriginNum, data[0]?.DocEntry)
        console.log("entra en variety")
  
      }

      else
      if(data[0]?.POParentItemCode && data[0]?.POParentItemCode.substring(0, 3) === 'VP-'  && data[0]?.GroupParent)
      {

        console.log("entra en varierty agrupaso")
        fetchControlDoughtVarietyGroup(data[0]?.GroupParent,data[0]?.OriginNum, data[0]?.POParentDocEntry)
      }
    
   ///

   else
   {
    ///
    console.log(data[0]?.GroupParent)
    if(data[0]?.GroupParent)
    {
     
      fetchControlDoughtChips(data[0]?.OriginNum, data[0]?.GroupParent)
    }
    else{
      fetchControlDought(data[0]?.OriginNum)
    }
  }
  
    const allItemsCheck = data.every((child) => child.Type === 'Item');
    setAllItems(allItemsCheck);
  };

  const fetchIdsPOs = async (id) => {
    const response = await fetch(`/api/AllPOrdersTortillas?id=${id}`);
    const data = await response.json();
    setOrderEntries(data);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  const handleButtonClick = async (order) => {
   

    if (order[0]?.TypeDetail === 'Pallets') {

  console.log(doughtRemainign)
   
      const dif=Number(doughtRemainign.Produced)-Number(doughtRemainign.Issued)
     console.log(dif)
     console.log(doughtRemainign.Min)
      if (Number(dif)>=Number(doughtRemainign.Min)) {
      
        showIssueDialog(order);
      } else {
        toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'There is not enough dough quantity to continue generating pallets. Please complete mixes.' });

      }
    } else {
      showIssueDialog(order);
    }
  };


  const fetchControlDought = async (originNum) => {
    try {
    
      const response = await fetch(`/api/ControlByDought?originNum=${originNum}`);
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




  const fetchControlDoughtVariety = async (originNum, DocEntry) => {
    try {
      // Corregir la construcción de la URL con un separador '&'
      const response = await fetch(`/api/ControlByDoughtVariety?originNum=${originNum}&docEntry=${DocEntry}`);
      
      // Procesar la respuesta
      const data = await response.json();
      console.log(data);
  
      // Verificar si la respuesta fue exitosa
      if (response.ok) {
        setDoughtRemainign(data[0]); // Suponiendo que 'setDoughtRemainign' es la función correcta
        console.log(data);
      } else {
        console.error('Error fetching control by dought:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching control by dought:', error);
    }
  };
  


  const fetchControlDoughtVarietyGroup = async (group,originNum, DocEntry) => {
    try {
      // Corregir la construcción de la URL con un separador '&'
      const response = await fetch(`/api/ControlByDoughtChipsVariationGroup?GroupId=${group}&OriginNum=${originNum}&ParentId=${DocEntry}`);

      // Procesar la respuesta
      const data = await response.json();
      console.log(data);
  
      // Verificar si la respuesta fue exitosa
      if (response.ok) {
        setDoughtRemainign(data[0]); // Suponiendo que 'setDoughtRemainign' es la función correcta
        console.log(data);
      } else {
        console.error('Error fetching control by dought:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching control by dought:', error);
    }
  };
  


  const fetchControlDoughtChips = async (originNum,GroupId) => {
    try {
      const response = await fetch(`/api/ControlByDoughtChips?GroupId='${GroupId}'&originNum=${originNum}`);
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




  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);




  useEffect(() => {

  

    if (order) {

      console.log(order)


 


console.log(order[0]?.POParentItemCode)

  if(order[0]?.POParentItemCode && order[0]?.POParentItemCode.substring(0, 3) === 'VP-')
    {
      fetchDoughtVariation(order[0]?.OriginNum, order[0]?.DocEntry)

    }
else

  {
    fetchControlByPallets(order[0]?.OriginNum);

  }


      
     
    }
  }, [order]);




  
  useEffect(() => {
    if (order) {
     
    
    //  console.log(shift)
      fetchMixesByShift(order[0]?.DocEntry,shift,line);
      fetchPalletByShift(order[0]?.POParentDocEntry,shift,line);
      fetchIssuesByShift(order[0]?.DocEntry,shift,line);
    }
  }, [order]);

  if (!order) {
    return <div>Loading...</div>;
  }

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
          <div><b>Customer PO:</b> {order[0]?.CustomerPO}</div>
           
            <div><b>Product No.:</b> {order[0]?.ItemCode}</div>
            <div><b>Product Description:</b> {order[0]?.ProdName}</div>
            {order[0]?.ParentOrKid==='Kid'&&order[0].ProduccionGO && <div><b>Planned Quantity:</b>  {formatNumber(Number(order[0]?.PlannedQty))} EA ({Math.ceil(formatNumber(Number(order[0]?.PlannedQty))/order[0].UndXPallet)} Pallets)</div>}
            {order[0]?.ParentOrKid==='Parent'&&!order[0].ProduccionGO && <div><b>Planned Quantity:</b>  {formatNumber(Number(order[0]?.PlannedQty))} EA ({Math.ceil(formatNumber(Number(order[0]?.PlannedQty))/order[0].UndXPallet)} Pallets)</div>}
            {order[0]?.ParentOrKid=='Kid'&&!order[0].ProduccionGO && <div><b>Planned Quantity:</b>  {formatNumber(Number(order[0]?.PlannedQty))} Mixes</div>}
            <div><b>Warehouse:</b> {order[0]?.Warehouse}</div>
            <div><b>Best Buy Date:</b> {formatDate(addDaysToDate(new Date(), order[0]?.BestBeforeDays))}</div>
          </div>
          <div className="p-col-12 p-md-6">
          <div><b>Status:</b> {order[0]?.Status}</div>
           
            <div><b>Delivery Date:</b> {new Date(order[0]?.DeliveryDate).toLocaleDateString('en-US', options)}</div>
            {!allItems && <div><b>Start Date:</b> {order[0]?.StartDate ? new Date(order[0]?.StartDate).toLocaleDateString('en-US', options) : ''}</div>}
            {!allItems && <div><b>Finish Date:</b> {order[0]?.DueDate ? new Date(order[0]?.DueDate).toLocaleDateString('en-US', options) : ''}</div>}
            <div><b>No. (PO):</b> {order[0]?.DocNum}</div>
            {allItems&&<div style={{'color':'#007ad9' , 'padding-top':'1rem', 'fontSize':'24px'}}><b>{order[0]?.TypeDetail === 'Pallets' ? "#Pallets "+ line +' '+ shift +':': "#Mixes "+line +' '+ shift +':'}</b>  { (order[0]?.TypeDetail === 'Mixes' ?  (mixesByShift === null ?0 :mixesByShift) : palletByShift)}</div>}

<br/>
{/* AllItems && */}
{!allItems && order[0]?.ChipsInd==="CHIPS" &&(
              <div>
                <Button
                  rounded
                  label={`🏭 Issues `+ line +'-'+ shift +': '+issuesByShift}

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
          {allItems &&( <div className="p-col-12 p-md-6">
           
           
            
             <div className='production-buttons'> 
            {allItems && (
              <div className='production-buttons'>
                {/* {order[0].ProduccionGO !== 'Y' && <Button label="Product Reception" className="p-button-danger" onClick={showBatchDialog} disabled={order[0].CloseDate}  rounded/>} */}
                <Button
                  label={order[0]?.TypeDetail === 'Pallets' ? "Add Pallet" : "Add Mix"}
                  className="p-order[0].button-success p-mr-2"
                  onClick={() => handleButtonClick(order)}
                  disabled={
                    order[0]?.CloseDate ||
                    order[0]?.ParentPaused==='Y'
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
                  label={order[0]?.TypeDetail + ': ' + (order[0]?.TypeDetail === 'Mixes' ?  order[0]?.Mixes+'/' +Math.ceil(order[0].PlannedQty) : order[0]?.Pallets +'/' +Math.ceil(formatNumber(Number(order[0]?.PlannedQty))/order[0].UndXPallet))}
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
          <DataTable value={order} paginator rows={10} scrollable scrollHeight="400px">
            {/* <Column field="Type" header="Type" /> */}
            <Column field="ItemCode2" header="Product" />
            <Column field="ItemName" header="Description" />
            {/* {allItems &&<Column field="Und" header="Und" />} */}
            <Column field="BaseQtyLine" header="Base Quantity" body={(rowData) => formatNumber(parseFloat(rowData.BaseQtyLine))} />
            <Column field="PlannedQtyLine" header="Planned" body={(rowData) => formatNumber(parseFloat(rowData.PlannedQtyLine))} />

            {/* <Column field="Available" header="Available" body={(rowData) => parseFloat(rowData.Available).toFixed(3)} /> */}
            {!allItems && <Column field="QtyChildrenCmpl" header="Produced" body={(rowData) => formatNumber(parseFloat(rowData.QtyChildrenCmpl || 0))} />}
            <Column field="IssuedQty" header="Issued" body={(rowData) => formatNumber(parseFloat(rowData.IssuedQty))} />
            {!allItems && <Column field="POChildrenDocNum" header="Child PO" />}
            {!allItems && <Column body={actionTemplate} header="Actions" />}


          </DataTable>
        </div>
      </Card>
      <IssueProduction
        visible={isIssueDialogVisible}
        onHide={hideIssueDialog}
        data={selectedRowData}
        pallet={order[0]?.ProduccionGO}
        onSave={() => setIsSaved(true)}
        parentEntry={order[0]?.POParentDocEntry}
        ParentOrKid={order[0]?.ParentOrKid}
        chips1={order[0]?.ChipsOK }
      />
      <ReceiptProduction

        visible={isReceiptDialogVisible}
        onHide={hideReceiptDialog}
        numPallet={(order[0]?.Pallets+1) +'/' +Math.ceil(formatNumber(Number(order[0]?.PlannedQty))/order[0]?.UndXPallet)}
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
          PO:order[0]?.CustomerPO,
          type: order[0]?.Type,
          GroupParent:order[0]?.GroupParent,
          POParentItemCode:order[0]?.POParentItemCode

        }}
      />

      <Mixes visible={isMixesDialogVisible} onHide={hideMixesDialog} id={order[0]?.DocEntry} />
      <Issues visible={isIssuesDialogVisible} onHide={hideIssuesDialog} id={order[0]?.DocEntry} />
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

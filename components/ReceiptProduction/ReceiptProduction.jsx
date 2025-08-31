"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { logEvent } from '../../utilities/log'; 
////pallet id//
import uniqueCodePallet from '../../utilities/unique';
//bacth logic

import batchId from '../../utilities/batchid'

const ReceiptProduction = ({ data, visible, onHide, numPallet }) => {

    const BASE_URL = process.env.NEXT_PUBLIC_API_UR;
    const API = process.env.API

    const [inputBatch, setiInputBatch] = useState('');
    const [inputBestBefore, setInputBestBefore] = useState('');
    const [formData, setFormData] = useState({

        warehouse: data.warehouse,
        po: data?.codigo || '',
        sku: data?.ItemCode || '',
        bestBefore: data.bestBefore || '',
        casePerPallet: '',
        quantity: Number(data.UndXPallet).toFixed(0),
        of: '',
        palletX: '',
        binLocation: data.binCode,
        binEntry: data.binEntry,
        allocated: '',
        DueDate: data?.dueDate,
        baseEntry: data?.baseEntry,
        DocEntryParent: data?.DocEntryParent,
        LineNumParent: data?.LineNumParent,
        lots: [{ lotNumber: data?.GroupParent ? data?.GroupParent : data?.PO, quantity: '' }],
        ParentItemCode: data?.ParentItemCode,
        ProduccionGO: data.ProduccionGO,
        UndXPallet: Number(data.UndXPallet).toFixed(0),
        PalletDetail: '',
        PalletsFlt: data.PalletsFlt
    });

     console.log(data)
    const [binLocations, setBinLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const [remaining, setRemaining] = useState('')
    const [totalPallets, setTotalPallets] = useState('')
    const [shift, setShift] = useState(localStorage.getItem("shift"))
    const [line, setLine] = useState(localStorage.getItem("line"))



    useEffect(() => {
        setiInputBatch(batchId(data?.PlantId) || '');
    }, [data?.PlantId]);

    // Función para manejar el cambio en el campo de entrada
    const handleChange = (e) => {
        setiInputBatch(e.target.value);
    };




    useEffect(() => {
        setInputBestBefore(
            formData.bestBefore
                ? new Date(formData.bestBefore).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                : ''
        );
    }, [formData.bestBefore]);
    
    // Función para manejar el cambio en el campo de entrada
    const handleChangebb = (e) => {
        setInputBestBefore(e.target.value);
    };

    useEffect(() => {
        // console.log(data)
        if (data) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                binLocation: data.binCode,
                binEntry: data.binEntry,
                bestBefore:data.bestBefore || '',
                warehouse: data.warehouse,

                po: data?.codigo || '',
                sku: data?.ItemCode || '',
                DueDate: data?.dueDate,
                baseEntry: data?.baseEntry,
                DocEntryParent: data?.DocEntryParent,
                LineNumParent: data?.LineNumParent,
                lots: [{ lotNumber: data?.GroupParent ? data?.GroupParent : data?.PO, quantity: '' }],
                ParentItemCode: data?.ParentItemCode,
                ProduccionGO: data.ProduccionGO,
                UndXPallet: Number(data.UndXPallet).toFixed(0),
                PalletsFlt: data.PalletsFlt,
                quantity: Number(data.UndXPallet).toFixed(0),
            }));
        }
    }, [data]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };



    const handleLotChange = (index, e) => {
        const { name, value } = e.target;
        const lots = [...formData?.lots];
        lots[index][name] = value;
        setFormData({
            ...formData,
            lots
        });
    };

    const handleBinLocationFocus = async () => {
        if (formData.warehouse) {
            try {
                const response = await fetch(`/api/BinLocationByWarehouse?warehouse='${formData.warehouse}'`);
                const data = await response.json();
                const formattedBins = data.map(bin => ({
                    label: `${bin.BinCode}`, // Concatenate BinCode and Quantity
                    value: bin.AbsEntry
                }));
                setBinLocations(formattedBins);
            } catch (error) {
                console.error('Error fetching bin locations:', error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch bin locations' });
            }
        }
    };

    const handleBinLocationChange = (e) => {
        console.log(e.value)
        setFormData({
            ...formData,
            binLocation: e.value
        });
    };

    const handleWarningConfirm = () => {
        setIsWarningVisible(false);
        handleSubmit();
    };

    const fetchDoughReception = async (id, wh, entry, full) => {
        try {
          // Verificar los valores iniciales
          console.log('ID:', id);
          console.log('Entry:', entry);
          console.log('Full:', full);
          console.log( formData.ParentItemCode )
      console.log(formData.DocEntryParent)
          let response;
          let data;
      
          // Validar si 'data[0]?.POParentItemCode' está disponible
          if (formData.ParentItemCode.substring(0, 3) === 'VP-') {
            console.log("holaaaaa")
            // Lógica cuando POParentItemCode comienza con 'VP-'
            
           // const url = `/api/DoughInfoByPOVariety?id=${id}&full=${full}&idParent=${data[0].DocEntryParent}`;



            const url = `/api/DoughInfoByPOVariety?id=${id}&full=${full}&idParent=${formData.DocEntryParent}`;

           
            console.log('Fetching URL:', url);
            response = await fetch(url);
          } else {
            // Lógica para el caso contrario
            const url = `/api/DoughInfoByPO?id=${id}&full=${full}`;
            console.log('Fetching URL:', url);
      
            response = await fetch(url);
          }
      
          // Verificar si la respuesta fue exitosa
          if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
          }
      
          // Intentar convertir la respuesta en JSON
          data = await response.json();
          console.log('Fetched Data:', data);
      
          // Procesar los datos obtenidos
          const groupedData = data.reduce((acc, item) => {
            if (!acc[item.ItemCode]) {
              acc[item.ItemCode] = {
                baseEntry: entry,
                baseLine: item.BaseLinNum,
                baseType: 202,
                itemCode: item.ItemCode,
                quantity: parseFloat(item.Quantity),
                WareHouse: wh,
                documentLinesBatchNumbers: []
              };
            }
            acc[item.ItemCode].documentLinesBatchNumbers.push({
              batchNumber: item.BatchNum,
              notes: `NOTA LOTE ${item.BatchNum}`,
              quantity: parseFloat(item["QuantityBatch"]),
              baseLineNumber: 0
            });
            return acc;
          }, {});
      
          const documentLines = Object.values(groupedData).map(item => ({
            ...item,
            quantity: item.documentLinesBatchNumbers.reduce((acc, batch) => acc + batch.quantity, 0),
            documentLinesBatchNumbers: item.documentLinesBatchNumbers
          }));
          console.log(["mostrar lineas"])
console.log(documentLines)

      
          const doughReceptionPayload = {
            U_CTS_Session: localStorage.getItem("sessionCode"),
            U_CTS_TURNO: shift,
            U_CTS_PLine: line,
            docDate: new Date().toLocaleDateString(),
            docDueDate: new Date().toLocaleDateString(),
            documentType: "IssueForProduction",
            comments: `Source: Portal Production Web-Issue based on ReceiptFromProduction ${id}`,
            documentLines: documentLines
          };
      
          return doughReceptionPayload;
        } catch (error) {
          console.error('Error fetching dough reception data:', error);
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch dough reception data'
          });
        }
      };
      

    const createReceiptPayload = () => {
        console.log(data.PalletsFlt)
        console.log(data.unitsPerPallet)
        const documentLines = formData.lots.map((lot, index) => ({
            baseEntry: data.baseEntry,
            baseType: 202,
            itemCode: data.ItemCode,
            quantity: formData.quantity,
            WareHouse: data.warehouse,
            DocumentLinesBinAllocations: [
                {
                    AllowNegativeQuantity: "Y",
                    BaseLineNumber: index,
                    BinAbsEntry: formData.binEntry,
                    Quantity: formData.quantity,
                }
            ],
            documentLinesBatchNumbers: [
                {
                    batchNumber: lot.lotNumber + "_P",
                    AddmisionDate: (new Date()).toLocaleDateString(),
                    ExpirationDate: (inputBestBefore),
                    notes: `NOTA LOTE ${lot.lotNumber}`,
                    quantity: formData.quantity,
                }
            ]
        }));

        return {
            U_CTS_Session: localStorage.getItem("sessionCode"),
            U_CTS_TURNO: shift,
            U_CTS_PLine: line,
            docDate: new Date().toLocaleDateString(),
            docDueDate: new Date().toLocaleDateString(),
            comments: "Source: Portal Production Web",
            documentType: "ReceiptFromProduction",
            documentLines
        };
    };

    const createIssuePayload = (receiptDocEntry) => {
        const documentLinesIssue = formData.lots.map((lot, index) => ({
            baseEntry: formData.DocEntryParent,
            baseLine: data.LineNumParent,
            baseType: 202,
            itemCode: data.ItemCode,
            quantity: formData.quantity,
            WareHouse: data.warehouse,
            documentLinesBatchNumbers: [
                {
                    batchNumber: lot.lotNumber + "_P",
                    notes: `NOTA LOTE ${lot.lotNumber}`,
                    quantity: formData.quantity,
                    baseLineNumber: index
                }
            ]
        }));

        return {
            U_CTS_Session: localStorage.getItem("sessionCode"),
            U_CTS_TURNO: shift,
            U_CTS_PLine: line,
            docDate: new Date().toLocaleDateString(),
            docDueDate: new Date().toLocaleDateString(),
            documentType: "IssueForProduction",
            comments: `Source: Portal Production Web-Issue based on ReceiptFromProduction`,
            documentLines: documentLinesIssue
        };
    };



    const createReceiptFinishGood = () => {
        const documentLines = formData.lots.map((lot, index) => ({
            baseEntry: formData.DocEntryParent,
            baseType: 202,
            itemCode: formData.ParentItemCode,

            quantity: formData.quantity,
            WareHouse: data.warehouse,
            DocumentLinesBinAllocations: [
                {
                    AllowNegativeQuantity: "Y",
                    BaseLineNumber: index,
                    BinAbsEntry: formData.binEntry,
                    Quantity: formData.quantity,
                }
            ],
            documentLinesBatchNumbers: [
                {
                    batchNumber: inputBatch,
                    AddmisionDate: (new Date()).toLocaleDateString(),
                    ExpirationDate: inputBestBefore,
                    notes: `NOTA LOTE ${lot.lotNumber}`,
                    quantity: formData.quantity,
                }
            ]
        }));

        return {
            U_CTS_Session: localStorage.getItem("sessionCode"),
            U_CTS_TURNO: shift,
            U_CTS_PLine: line,
            docDate: new Date().toLocaleDateString(),
            docDueDate: new Date().toLocaleDateString(),
            comments: `Source: Portal Production Web based on ReceiptFromProduction`,
            documentType: "ReceiptFromProduction",
            documentLines
        };
    };



    const handleSubmit = async () => {
        setLoading(true);
    
        const pallets = generatePallets(data.UndXPallet, data);
        console.log('Pallets:', pallets);
    
        try {
            const token = localStorage.getItem('Token');
    
            // Log the generation of pallets
            logEvent({
                action: 'Generate Pallets',
                payload: pallets
            }, 'info');
    
            // Get the payload for Dough Reception
            const doughReceptionPayload = await fetchDoughReception(
                data.baseEntry,
                data.warehouse,
                data.DocEntryParent,
                formData.quantity
            );
    
            console.log("sjon payload masa")
            console.log(doughReceptionPayload)
            // Log the Dough Reception payload
            logEvent({
                action: 'Fetch Dough Reception Payload',
                payload: doughReceptionPayload
            }, 'info');
    
            // Create and send the Receipt
            const receiptPayload = createReceiptPayload();
            console.log('Receipt Payload:', receiptPayload);
    
            // Log the Receipt payload
            logEvent({
                action: 'Create Receipt Payload',
                payload: receiptPayload
            }, 'info');
    
            const receiptResult = await postDocument(
                `${BASE_URL}/Production/PostReceiptFromProduction`,
                receiptPayload,
                token,
                'Receipt'
            );
    
            // Log the Receipt response
            logEvent({
                action: 'Post Receipt',
                payload: receiptPayload,
                response: receiptResult
            }, 'info');
    
            // Verify if Receipt was created successfully
            if (!receiptResult || !receiptResult.DocEntry) {
                throw new Error('Error creating the Receipt.');
            }
    
            // If ProduccionGO is 'Y', proceed with Issue and other documents
            if (data.ProduccionGO === 'Y') {
                console.log('Inside Issue in parents');
    
                // Create and send the Issue
                const issuePayload = createIssuePayload(receiptResult.DocEntry);
                console.log('Issue Payload:', issuePayload);
    
                // Log the Issue payload
                logEvent({
                    action: 'Create Issue Payload',
                    payload: issuePayload
                }, 'info');
    
                const issueResult = await postDocument(
                    `${BASE_URL}/Production/PostIssue4Production`,
                    issuePayload,
                    token,
                    'Issue'
                );
    
                // Log the Issue response
                logEvent({
                    action: 'Post Issue',
                    payload: issuePayload,
                    response: issueResult
                }, 'info');
    
                // Verify if Issue was created successfully
                if (!issueResult || !issueResult.DocEntry) {
                    throw new Error('Error creating the Issue.');
                }
    
                // Create and send the Dough Reception Issue
                console.log('Dough Reception Payload:', doughReceptionPayload);
    
                // Log the Dough Reception Issue payload
                logEvent({
                    action: 'Create Dough Reception Issue Payload',
                    payload: doughReceptionPayload
                }, 'info');
    



                const issueResultDought = await postDocument(
                    `${BASE_URL}/Production/PostIssue4Production`,
                    doughReceptionPayload,
                    token,
                    'Dough Reception Issue'
                );
    
                // Log the Dough Reception Issue response
                logEvent({
                    action: 'Post Dough Reception Issue',
                    payload: doughReceptionPayload,
                    response: issueResultDought
                }, 'info');
    
                // Verify if Dough Reception Issue was created successfully
                if (!issueResultDought || !issueResultDought.DocEntry) {
                    throw new Error('Error creating the Dough Reception Issue.');
                }
    
                // Create and send the Finished Good Receipt
                const finishGoodPayload = createReceiptFinishGood();
                console.log('Finished Good Payload:', finishGoodPayload);
    
                // Log the Finished Good Receipt payload
                logEvent({
                    action: 'Create Finished Good Receipt Payload',
                    payload: finishGoodPayload
                }, 'info');
    
                const finishGoodResult = await postDocument(
                    `${BASE_URL}/Production/PostReceiptFromProduction`,
                    finishGoodPayload,
                    token,
                    'Receipt Finished Good'
                );
    
                // Log the Finished Good Receipt response
                logEvent({
                    action: 'Post Finished Good Receipt',
                    payload: finishGoodPayload,
                    response: finishGoodResult
                }, 'info');
    
                // Verify if Finished Good Receipt was created successfully
                if (!finishGoodResult || !finishGoodResult.DocEntry) {
                    throw new Error('Error creating the Finished Good Receipt.');
                }
    
                // Send the Pallets
                console.log('Sending Pallets:', pallets);
    
                // Log the sending of Pallets
                logEvent({
                    action: 'Post Pallets',
                    payload: pallets
                }, 'info');
    
                const palletsResult = await postDocument(
                    `${BASE_URL}/Production/PostArtSNPallets`,
                    pallets,
                    token,
                    'Pallet'
                );
    
                // Log the Pallets response
                logEvent({
                    action: 'Post Pallets',
                    payload: pallets,
                    response: palletsResult
                }, 'info');
    
                // Verify if Pallets were created successfully
                if (!palletsResult) {
                    throw new Error('Error sending the Pallets.');
                }
            }
    
            // Show success message and reset the form
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'All documents were created successfully.' });
            onHide();
            resetFormData();
    
        } catch (error) {
            console.error('Error:', error);
    
            // Log the error
            logEvent({
                action: 'Handle Submit Error',
                error: error.message || error
            }, 'error');
    
            toast?.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };
    
    // const handleSubmit = async () => {
    //     setLoading(true);

    //     const pallets = generatePallets(data.UndXPallet, data);
    //     console.log(pallets);

    //     try {
    //         const token = localStorage.getItem('Token');

    //         const doughReceptionPayload = await fetchDoughReception(data.baseEntry, data.warehouse, data.DocEntryParent, formData.quantity);

    //         const receiptPayload = createReceiptPayload();
    //         console.log('1-->')
    //         console.log(receiptPayload)
    //         const receiptResult = await postDocument(`${BASE_URL}/Production/PostReceiptFromProduction`, receiptPayload, token, 'Receipt');

    //         if (receiptResult && data.ProduccionGO === 'Y') {
    //             console.log('adentro de issue en padres');
    //             const issuePayload = createIssuePayload(receiptResult.DocEntry);
    //             console.log('2-->')
    //             console.log(issuePayload)
    //             console.log('3-->')
    //             console.log(doughReceptionPayload)
    //             const issueResult = await postDocument(`${BASE_URL}/Production/PostIssue4Production`, issuePayload, token, 'Issue');
    //             const issueResultDought = await postDocument(`${BASE_URL}/Production/PostIssue4Production`, doughReceptionPayload, token, 'Dough Reception Issue');

    //             if (issueResult && issueResultDought && data.ProduccionGO === 'Y') {
    //                 const finishGoodPayload = createReceiptFinishGood();
    //                 console.log('4-->')
    //                 console.log(finishGoodPayload)


    //                 await postDocument(`${BASE_URL}/Production/PostReceiptFromProduction`, finishGoodPayload, token, 'Receipt Finish Good');
    //             }

    //             // Enviar cada pallet uno a uno al final
    //             console.log(pallets)
    //             await postDocument(`${BASE_URL}/Production/PostArtSNPallets`, pallets, token, 'Pallet');

    //             toast.current.show({ severity: 'success', summary: 'Success', detail: 'All documents created successfully' });
    //             onHide();
    //             setFormData({
    //                 warehouse: data.warehouse,
    //                 po: data?.codigo || '',
    //                 sku: data?.ItemCode || '',
    //                 bestBefore: '',
    //                 casePerPallet: '',
    //                 quantity: '',
    //                 of: '',
    //                 palletX: '',
    //                 binLocation: '',
    //                 allocated: '',
    //                 DueDate: data?.dueDate,
    //                 baseEntry: data?.baseEntry,
    //                 DocEntryParent: data?.DocEntryParent,
    //                 LineNumParent: data?.LineNumParent,
    //                 lots: [{ lotNumber: '', quantity: '' }],
    //                 ParentItemCode: data?.ParentItemCode
    //             });
    //         }

    //         else if (receiptResult && data.ProduccionGO !== 'Y') {

    //             if (!receiptResult) {
    //                 toast.current.show({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurblack' });
    //             }
    //             else {
    //                 toast.current.show({ severity: 'success', summary: 'Success', detail: 'All documents created successfully' });
    //                 onHide();
    //                 setFormData({
    //                     warehouse: data.warehouse,
    //                     po: data?.codigo || '',
    //                     sku: data?.ItemCode || '',
    //                     bestBefore: '',
    //                     casePerPallet: '',
    //                     quantity: '',
    //                     of: '',
    //                     palletX: '',
    //                     binLocation: '',
    //                     allocated: '',
    //                     DueDate: data?.dueDate,
    //                     baseEntry: data?.baseEntry,
    //                     DocEntryParent: data?.DocEntryParent,
    //                     LineNumParent: data?.LineNumParent,
    //                     lots: [{ lotNumber: '', quantity: '' }],
    //                     ParentItemCode: data?.ParentItemCode
    //                 });
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         toast?.current?.show({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurblack' });
    //     } finally {
    //         setLoading(false);
    //     }
    // };





// Función para resetear los datos del formulario
const resetFormData = () => {
    setFormData({
        warehouse: data.warehouse,
        po: data?.codigo || '',
        sku: data?.ItemCode || '',
        bestBefore: '',
        casePerPallet: '',
        quantity: '',
        of: '',
        palletX: '',
        binLocation: '',
        allocated: '',
        DueDate: data?.dueDate,
        baseEntry: data?.baseEntry,
        DocEntryParent: data?.DocEntryParent,
        LineNumParent: data?.LineNumParent,
        lots: [{ lotNumber: '', quantity: '' }],
        ParentItemCode: data?.ParentItemCode
    });
};

    const postDocument = async (url, payload, token, docType) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                console.log(result)
                toast.current.show({ severity: 'error', summary: `${docType} Error`, detail: result.Message });
                return null;
            }

            return result;
        } catch (error) {
            console.error(`Error creating ${docType}:`, error);
            toast.current.show({ severity: 'error', summary: `${docType} Error`, detail: 'An unexpected error occurblack' });
            return null;
        }
    };



    // Function to calculate pallets and pallet details
    const calculatePallets = (quantity, unitsPerPallet) => {
        const totalPallets = Math.ceil(quantity / unitsPerPallet);
        const fullPallets = Math.floor(quantity / unitsPerPallet);
        const remainingUnits = quantity % unitsPerPallet;

        let palletDetail = `${fullPallets || 0} Pallets of ${Number(unitsPerPallet).toFixed(0)}`;
        if (remainingUnits > 0) {
            palletDetail += ` & 1 Pallets of ${remainingUnits}`;
            setRemaining(remainingUnits)
            setTotalPallets(fullPallets)
            //quito el +1
        }

        return {
            totalPallets,
            palletDetail
        };
    };

    // Handle changes to the # Pallet field
    const handlePalletChange = (e) => {
        const { name, value } = e.target;
        const quantity = parseFloat(value);

        setFormData({
            ...formData,
            [name]: value,
            quantity: quantity,

        });
        // console.log(quantity)
        // console.log(data.UndXPallet)
        const { totalPallets, palletDetail } = calculatePallets(quantity, data.UndXPallet);

        setFormData({
            ...formData,
            [name]: value,
            casePerPallet: totalPallets,
            PalletDetail: palletDetail
        });
    };



    ////armado de json para objeto pallets

    const generatePallets = (unitsPerPallet, data) => {

        const pallets = {
            IdPallet: uniqueCodePallet(20),
            Sku: data.ParentItemCode,
            Batch: inputBatch,
            BestBefore:inputBestBefore,
            CasePallet: parseInt(unitsPerPallet, 10),
            Quantity: formData.quantity.toString(),
            BinLocation: (formData.binEntry).toString(),
            DocEntryPO: formData.DocEntryParent,
            Status: null,
            DocNumPO: line + "-" + shift
        };




        return pallets;
    };


    const footer = (
        <div >
            {/* <Button label="Cancel" icon="pi pi-times" className="p-button-danger p-mr-2" onClick={onHide} /> */}
            <Button label="Save & Print" icon="pi pi-check"
                className="p-button-success"
                style={{ marginLeft: '0.5em' }}
                onClick={handleSubmit}
                disabled={loading} />
        </div>
    );
    return (
        <>
            <Toast ref={toast} position="top-right" style={{ marginTop: '60px', zIndex: 9999 }} />
            <Dialog header="Product Reception" visible={visible} onHide={onHide} footer={footer} closable={false} style={{ width: '80vh' }}>
                <Card>
                    <div className="p-fluid">
                        {loading && (
                            <div className="p-mb-3">
                                <ProgressSpinner style={{ width: '50px', height: '50px', display: 'block', margin: '0 auto' }} />
                            </div>
                        )}
                        <div className='final-product' style={styles.productInfo}>
                            <div className="p-grid p-align-center" style={{ 'display': 'flex' }}>
                                <div className="p-col-4 p-md-2" style={styles.labelColumn}>
                                    <label htmlFor="po" style={styles.label}>PO: </label>
                                    <label htmlFor="sku" style={styles.label}>SKU: </label>
                                    <label htmlFor="lot" style={styles.label}>LOT: </label>
                                    <label htmlFor="bestBefore" style={styles.label}>BEST BEFORE: </label>
                                    <label htmlFor="palletX" style={styles.label}>No PALLETS: </label>
                                    <label htmlFor="casePerPallet" style={styles.label}>CASES PER PALLET: </label>
                                </div>
                                <div className="p-col-8 p-md-10" style={styles.valueColumn}>
                                    <InputText disabled style={styles.text} value={data?.PO || ''} />
                                    <InputText disabled style={styles.text} value={data?.POParentItemCode || ''} />
                                    {/* <InputText  style={styles.text} value={batchId(data?.PlantId) || ''}/> */}

                                    <InputText
                                        style={styles.text}
                                        value={inputBatch}
                                        onChange={handleChange}
                                    />
                                    {/* <InputText style={styles.text} value={formData.bestBefore ? new Date(formData.bestBefore).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''} /> */}

                                    
                                    <InputText
                                        style={styles.text}
                                        value={inputBestBefore}
                                        onChange={handleChangebb}
                                    />


                                    <InputText disabled style={styles.text} value={numPallet} />
                                    <InputText id="quantity" name="quantity" value={formData.quantity} onChange={handlePalletChange} style={styles.input} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Dialog>
        </>
    );
};

// Estilos en línea
const styles = {
    productInfo: {
        fontSize: '15px',
        lineHeight: '1.5',
        paddingLeft: '3rem'
    },
    labelColumn: {
        //textAlign: 'right',
        paddingRight: '1rem',
    },
    valueColumn: {
        textAlign: 'left',
    },
    label: {
        color: 'black',
        fontWeight: 'bold',
        marginBottom: '2.5rem',
        display: 'block',
    },
    text: {
        color: '#333',
        fontSize: '15px',
        marginBottom: '1.5rem',
        display: 'block',
    },
    input: {
        width: '100%',
        marginBottom: '1.5rem',
    },
    footerButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '1rem',
    },
};

export default ReceiptProduction;
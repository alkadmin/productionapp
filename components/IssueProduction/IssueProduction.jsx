"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { addOrderToSession, clearOrdersFromSession, orderExistsInSession } from '../../utilities/storageOrders';
import batchId from '../../utilities/batchid';
import { RadioButton } from 'primereact/radiobutton';
import { Card } from 'primereact/card';
import formatNumber from '../../utilities/formatNumber';
import { logEvent } from '../../utilities/log'; 
const IssueProduction = ({ visible, onHide, data, pallet, onSave, parentEntry, chips, chips1, ParentOrKid, Variety }) => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_UR;
    const [formData, setFormData] = useState({ wetTime: '', dryTime: '', rows: [] });



    

    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const [shift, setShift] = useState(localStorage.getItem("shift"));
    const [line, setLine] = useState(localStorage.getItem("line"));
    const [docEntries, setDocEntries] = useState(null);
    const [proportion, setPropotion] = useState(null);
    const [mixType, setMixType] = useState('Full');

    const [mixTypeControl, setMixTypeControl] = useState(0);
    console.log(data)
    const addDaysToDate = (date, days) => {
        const result = new Date(date);
        const daysToAdd = parseFloat(days);
        result.setDate(result.getDate() + daysToAdd);
        return result;
    };

    // useEffect(() => {
    //     if (!visible) {
    //         setFormData({ wetTime: '', dryTime: '', rows: [] });
    //     }
    // }, [visible]);

    function baseQty(number, factor) {
       

//         const savemixtype= localStorage.getItem(`mixtypestorage+${data[0]?.ItemCode}`);

//          console.log(savemixtype)


//            const valutype=(savemixtype === 'Full' ? 1 : (savemixtype === 'Half' ? 0.5 : (savemixtype === 'Double' ? 2 : 0)));

// console.log("guardado"+valutype)

//            if (!data[0]?.ProduccionGO){

//         if (valutype==0){
//             console.log("vacio")
//             return number * factor;
//         }
//         if (valutype==factor)
        
//         { 
//             console.log(number)
//             console.log("no deb")  
//             return number;
         
//         }
//         // else

//         // { return number * factor;

//         // }
        
//         if(valutype==0.5&&factor==1)
//         {
//             console.log("normal")
//             return number * 2;
          
//         }

//         else
//         if(valutype==0.5&&factor==2)
//         {
//             console.log("normal")
//             return number * 4;
          
//         }

//         else
        
//         if(valutype==1&&factor==0.5)
//         {
//             console.log("normal")
//             return number * 0.5;
          
//         }

//         else
//         if(valutype==1&&factor==2)
//         {
//             console.log("normal")
//             return number * 2;
          
//         }
//         else
        
//         if(valutype==2&&factor==0.5)
//         {
//             console.log("normal")
//             return number/4;
          
//         }

//         else
//         if(valutype==2&&factor==1)
//         {
//             console.log("normal")
//             return number * 0.5;
          
//         }

//          else

//         { return number * factor;

//      }
//     }
//     else{
        return number * factor;
  //  }
    }



    // useEffect(() => {
    //     localStorage.setItem('mixType', mixType);
    // }, [mixType]);
    
     //useEffect(() => {
    //     if (visible && data && data.length > 0) {
    //         // const lotStorageKey = pallet ? `savedLotsPackaging_${data[0]?.ItemCode}` : `savedLotsDough_${data[0]?.ItemCode}`;
    //         // const savedSelections = JSON.parse(localStorage.getItem(lotStorageKey)) || [];
            // const timesStorageKey = pallet ? 'savedTimes' : `savedTimes_${data[0]?.ItemCode}`;
             // const savedTimes = JSON.parse(localStorage.getItem(timesStorageKey)) || { wetTime: '', dryTime: '' };

    //         const updatedRows = formData.rows.map((item) => {
    //             const savedItem = savedSelections.find(saved => saved.product === item.product);
    //             if (savedItem) {
    //                 return { ...item, lotNumbers: savedItem.lotNumbers };
    //             }
    //             return item;
    //         });

    //         setFormData({ ...formData, rows: updatedRows});
    //     }
   //  }, [visible, data]);


//variety




/////variety


    useEffect(() => {
        if (formData.wetTime || formData.dryTime) {
            if (data && data.length > 0 && !pallet) {
                const timesStorageKey = `savedTimes_${data[0]?.ItemCode}`;
                localStorage.setItem(timesStorageKey, JSON.stringify({ wetTime: formData.wetTime, dryTime: formData.dryTime }));
            }
        }
    }, [formData.wetTime, formData.dryTime, data]);

    // useEffect(() => {
    //     if (visible && data) {
    //         const itemCode = ParentOrKid === 'Parent' ? data?.ItemCode2 : (Array.isArray(data) ? data[0]?.ItemCode : data?.ItemCode);
    //         const lotStorageKey = ParentOrKid === 'Parent'
    //             ? `savedLotsFinish_${itemCode}`
    //             : pallet
    //                 ? `savedLotsPackaging_${itemCode}`
    //                 : `savedLotsDough_${itemCode}`;

    //         const savedSelections = JSON.parse(localStorage.getItem(lotStorageKey)) || [];

    //         const timesStorageKey = `savedTimes_${itemCode}`;
    //         console.log(timesStorageKey)
    //         const savedTimes = JSON.parse(localStorage.getItem(timesStorageKey)) || { wetTime: '', dryTime: '' };

    //         console.log(savedTimes);

    //         const initializeFormData = () => {
    //             console.log(savedTimes.wetTime);
    //             console.log(data)

    //             if (data) {
    //                 if (ParentOrKid === 'Parent') {
    //                     const formattedData = [data].map((item) => {
    //                         const savedItem = savedSelections.find(saved => saved.product === item.ItemCode2);

    //                         return {
    //                             type: item.type,
    //                             wetTime: '',
    //                             dryTime: '',
    //                             LineNum: item.LineNum,
    //                             Und: item.Und,
    //                             baseEntry: item.DocEntry,
    //                             product: item.ItemCode2,
    //                             description: item.ItemName,
    //                             real: formatNumber(Number(item.QtyComponents)),
    //                             base: !pallet ? formatNumber(Number(item.QtyComponents)) : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                             wareHouse: item.wareHouse,
    //                             // lotNumbers: savedItem ? savedItem.lotNumbers : [
    //                             //     {
    //                             //         lotNumber: '',  // Puede quedarse vacío si no hay selección previa
    //                             //         quantity: formatNumber(Number(item.PlannedQtyLine)),
    //                             //     },
    //                             // ]
    //                             lotNumbers: savedItem ? savedItem.lotNumbers.map(lot => ({
    //                                 lotNumber: lot.lotNumber,
    //                                 quantity: formatNumber(Number(item.QtyComponents)) // Asigna la cantidad recomendada
    //                             })) : [
    //                                 {
    //                                     lotNumber: '',  // Puede quedarse vacío si no hay selección previa
    //                                     quantity: formatNumber(Number(item.QtyComponents)),
    //                                 },
    //                             ],
    //                             lotOptions: savedItem
    //                                 ? savedItem.lotNumbers.map(lot => ({
    //                                     label: `LOT:${lot.lotNumber}  | QTY:${lot.quantity}`,
    //                                     value: lot.lotNumber,
    //                                 }))
    //                                 : [],
    //                             batch: item.Batch,
    //                         };
    //                     });

    //                     console.log(formattedData);
    //                     setFormData({ ...formData, rows: formattedData });

    //                 } else if (ParentOrKid === 'Kid') {
    //                     console.log(savedTimes);

    //                     const formattedData = (Array.isArray(data) ? data : [data]).map((item) => {
    //                         const savedItem = savedSelections.find(saved => saved.product === item.ItemCode2);
    //                         console.log(savedItem)
    //                         const savedQuantity = savedItem
    //                             ? savedItem.lotNumbers.reduce((total, lot) => total + Number(lot.quantity), 0)
    //                             : 0;
    //                         console.log(savedQuantity)
    //                         console.log(item.Batch)
    //                         item.batch
    //                         const adjustedSavedQuantity = savedQuantity * (mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 1);
    //                         return {
    //                             type: item.type,
    //                             wetTime: savedTimes ? savedTimes.wetTime : '',
    //                             dryTime: savedTimes ? savedTimes.dryTime : '',
    //                             LineNum: item.LineNum,
    //                             Und: item.Und,
    //                             baseEntry: item.DocEntry,
    //                             product: item.ItemCode2,
    //                             description: item.ItemName,
    //                             // real: !item.ProduccionGO
    //                             //     ? formatNumber(Number(baseQty(item.BaseQtyLine, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0)))
    //                             //     : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                             real: !item.ProduccionGO
    //                                 ? item.Batch === 'N' && savedItem
    //                                     ? formatNumber(adjustedSavedQuantity)
    //                                     : formatNumber(Number(baseQty(item.BaseQtyLine, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0)))
    //                                 : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                             base: !pallet ? formatNumber(Number(item.BaseQtyLine)) : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                             wareHouse: item.wareHouse,
    //                             // lotNumbers: savedItem ? savedItem.lotNumbers : [
    //                             //     {
    //                             //         lotNumber: '',  // Inicializa con vacío si no hay selección previa
    //                             //         quantity: !item.ProduccionGO
    //                             //             ? formatNumber(Number(baseQty(item.BaseQtyLine, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0)))
    //                             //             : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                             //     },
    //                             // ],
    //                             lotNumbers: savedItem ? savedItem.lotNumbers.map(lot => ({
    //                                 lotNumber: lot.lotNumber,
    //                                 quantity: !item.ProduccionGO
    //                                     ? formatNumber(Number(baseQty(item.BaseQtyLine, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0)))
    //                                     : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                                 //formatNumber(Number(baseQty(item.BaseQtyLine, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0))) // Cantidad recomendada
    //                             })) : [
    //                                 {
    //                                     lotNumber: '',  // Inicializa con vacío si no hay selección previa
    //                                     quantity: !item.ProduccionGO
    //                                         ? formatNumber(Number(baseQty(item.BaseQtyLine, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0)))
    //                                         : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                                 },
    //                             ],
    //                             lotOptions: savedItem
    //                                 ? savedItem.lotNumbers.map(lot => ({
    //                                     label: `LOT:${lot.lotNumber}  | QTY:${lot.quantity}`,
    //                                     value: lot.lotNumber,
    //                                 }))
    //                                 : [],  // No cargamos opciones adicionales al inicio
    //                             batch: item.Batch,
    //                         };
    //                     });

    //                     console.log(formattedData);
    //                     setFormData({ ...formData, rows: formattedData, dryTime: savedTimes.dryTime, wetTime: savedTimes.wetTime });
    //                 }
    //             }
    //         };

    //         initializeFormData();
    //     }
    // }, [data, mixType, ParentOrKid, visible]);


/////inicia el nuevo

    ///
    // useEffect(() => {
    //     if (visible && data) {
    //         const itemCode = ParentOrKid === 'Parent' ? data?.ItemCode2 : (Array.isArray(data) ? data[0]?.ItemCode : data?.ItemCode);
    //         const lotStorageKey = ParentOrKid === 'Parent'
    //             ? `savedLotsFinish_${itemCode}`
    //             : pallet
    //                 ? `savedLotsPackaging_${itemCode}`
    //                 : `savedLotsDough_${itemCode}`;
    
    //         const savedSelections = JSON.parse(localStorage.getItem(lotStorageKey)) || [];
    //         const timesStorageKey = `savedTimes_${itemCode}`;
    //         const savedTimes = JSON.parse(localStorage.getItem(timesStorageKey)) || { wetTime: '', dryTime: '' };
    
    //         const initializeFormData = () => {
    //             if (data) {
    //                 const formattedData = (Array.isArray(data) ? data : [data]).map((item) => {
    //                     const savedItem = savedSelections.find(saved => saved.product === item.ItemCode2);
    
    //                     return {
    //                         type: item.type,
    //                         wetTime: savedTimes.wetTime || '',
    //                         dryTime: savedTimes.dryTime || '',
    //                         LineNum: item.LineNum,
    //                         Und: item.Und,
    //                         baseEntry: item.DocEntry,
    //                         product: item.ItemCode2,
    //                         description: item.ItemName,
    //                         real: !item.ProduccionGO
    //                             ? item.Batch === 'N'
    //                                 ? formatNumber(Number(baseQty(item.BaseQtyLine, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0)))
    //                                 : savedItem
    //                                     ? formatNumber(savedItem.lotNumbers.reduce((total, lot) => total + Number(lot.quantity), 0))
    //                                     : formatNumber(Number(baseQty(item.BaseQtyLine, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0)))
    //                             : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                         base: !pallet ? formatNumber(Number(item.BaseQtyLine)) : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                         wareHouse: item.wareHouse,
    //                         lotNumbers: item.Batch === 'Y' && savedItem 
    //                             ? savedItem.lotNumbers.map(lot => ({
    //                                 lotNumber: lot.lotNumber,
    //                                 quantity: formatNumber(Number(lot.quantity) * (mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 1))
    //                             })) 
    //                             : [],
    //                         lotOptions: item.Batch === 'Y' && savedItem
    //                             ? savedItem.lotNumbers.map(lot => ({
    //                                 label: `LOT:${lot.lotNumber}  | QTY:${lot.quantity}`,
    //                                 value: lot.lotNumber,
    //                             }))
    //                             : [],
    //                         batch: item.Batch,
    //                     };
    //                 });
    
    //                 setFormData({ ...formData, rows: formattedData, dryTime: savedTimes.dryTime, wetTime: savedTimes.wetTime });
    //             }
    //         };
    
    //         initializeFormData();
    //     }
    // }, [data, mixType, ParentOrKid, visible]);
    
    //// fin nuevo


    useEffect(() => {
        if (visible && data) {
            const itemCode = ParentOrKid === 'Parent' 
                ? data?.ItemCode2 
                : (Array.isArray(data) ? data[0]?.ItemCode : data?.ItemCode);
    
            const valutype = mixType === 'Full' ? 1 : (mixType === 'Half' ? 0.5 : (mixType === 'Double' ? 2 : 0));
            setMixTypeControl(valutype);
    
            const timesStorageKey = `savedTimes_${itemCode}`;
            console.log(timesStorageKey);
            const savedTimes = JSON.parse(localStorage.getItem(timesStorageKey)) || { wetTime: '', dryTime: '' };
            console.log(savedTimes);
    
            const initializeFormData = () => {
                if (data) {
                    console.log(data)
                    const formattedData =
                        ParentOrKid === 'Parent'
                            ? [data].map((item) => ({
                                  type: item.type,
                                  wetTime: savedTimes.wetTime || '',
                                  dryTime: savedTimes.dryTime || '',
                                  LineNum: item.LineNum,
                                  Und: item.Und,
                                  baseEntry: item.DocEntry,
                                  product: item.ItemCode2,
                                  description: item.ItemName,
                                  BatchAuto: item.BatchAuto ,
                                  real: formatNumber(Number(item.QtyComponents)),
                                  base: !pallet
                                      ? formatNumber(Number(item.QtyComponents))
                                      : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
                                  wareHouse: item.wareHouse,
                                  lotNumbers: [
                                      {
                                          lotNumber: '',
                                          quantity: formatNumber(Number(item.QtyComponents)),
                                      },
                                  ],
                                  lotOptions: [],
                                  batch: item.Batch,
                              }))
                            : (Array.isArray(data) ? data : [data]).map((item) => {
                                  const realQuantity = !item.ProduccionGO
                                      ? formatNumber(Number(baseQty(item.BaseQtyLine, valutype)))
                                      : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet)));
    
                                  return {
                                      type: item.type,
                                      wetTime: savedTimes.wetTime || '',
                                      dryTime: savedTimes.dryTime || '',
                                      LineNum: item.LineNum,
                                      Und: item.Und,
                                      baseEntry: item.DocEntry,
                                      product: item.ItemCode2,
                                      description: item.ItemName,
                                      real: item.Batch === 'N' ? realQuantity : realQuantity,
                                      base: !pallet
                                          ? formatNumber(Number(item.BaseQtyLine))
                                          : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
                                      wareHouse: item.wareHouse,
                                      lotNumbers:
                                          item.Batch === 'Y'
                                              ? [
                                                    {
                                                        lotNumber: '',
                                                        quantity: realQuantity,
                                                    },
                                                ]
                                              : [],
                                      lotOptions: [],
                                      batch: item.Batch,
                                  };
                              });
    
                    // Usa la función de actualización para evitar problemas con el estado.
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        rows: formattedData,
                        wetTime: savedTimes.wetTime || prevFormData.wetTime,
                        dryTime: savedTimes.dryTime || prevFormData.dryTime,
                    }));
                }
            };
    
            initializeFormData();
        }
    }, [data, mixType, ParentOrKid, visible]);
    



    //recomendacion lotes
    // useEffect(() => {
    //     if (visible && data) {
    //         const itemCode = ParentOrKid === 'Parent' 
    //             ? data?.ItemCode2 
    //             : (Array.isArray(data) ? data[0]?.ItemCode : data?.ItemCode);
    
    //         const lotStorageKey = ParentOrKid === 'Parent'
    //             ? `savedLotsFinish_${itemCode}`
    //             : pallet
    //                 ? `savedLotsPackaging_${itemCode}`
    //                 : `savedLotsDough_${itemCode}`;
    
    //         const savedSelections = JSON.parse(localStorage.getItem(lotStorageKey)) || [];
    //         const timesStorageKey = `savedTimes_${itemCode}`;
    //         const savedTimes = JSON.parse(localStorage.getItem(timesStorageKey)) || { wetTime: '', dryTime: '' };
    //         const savemixtype = localStorage.getItem("mixtypestorage");
    //         const valutype = savemixtype === 'Full' ? 1 : (savemixtype === 'Half' ? 0.5 : (savemixtype === 'Double' ? 2 : 0));
    
    //         setMixTypeControl(valutype);
    
    //         const initializeFormData = () => {
    //             if (data) {
    //                 if (ParentOrKid === 'Parent') {
    //                     // Lógica para Parent
    //                     const formattedData = [data].map((item) => {
    //                         const savedItem = savedSelections.find(saved => saved.product === item.ItemCode2);
    
    //                         return {
    //                             type: item.type,
    //                             wetTime: '',
    //                             dryTime: '',
    //                             LineNum: item.LineNum,
    //                             Und: item.Und,
    //                             baseEntry: item.DocEntry,
    //                             product: item.ItemCode2,
    //                             description: item.ItemName,
    //                             real: formatNumber(Number(item.QtyComponents)),
    //                             base: !pallet ? formatNumber(Number(item.QtyComponents)) : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                             wareHouse: item.wareHouse,
    //                             lotNumbers: savedItem ? savedItem.lotNumbers.map(lot => ({
    //                                 lotNumber: lot.lotNumber,
    //                                 quantity: formatNumber(Number(item.QtyComponents))
    //                             })) : [
    //                                 {
    //                                     lotNumber: '',
    //                                     quantity: formatNumber(Number(item.QtyComponents)),
    //                                 },
    //                             ],
    //                             lotOptions: savedItem
    //                                 ? savedItem.lotNumbers.map(lot => ({
    //                                     label: `LOT:${lot.lotNumber}  | QTY:${lot.quantity}`,
    //                                     value: lot.lotNumber,
    //                                 }))
    //                                 : [],
    //                             batch: item.Batch,
    //                         };
    //                     });
    
    //                     setFormData({ ...formData, rows: formattedData });
    //                 } else if (ParentOrKid === 'Kid') {
    //                     // Lógica original para Kid
    //                     const formattedData = (Array.isArray(data) ? data : [data]).map((item) => {
    //                         const savedItem = savedSelections.find(saved => saved.product === item.ItemCode2);
    //                         const realQuantity = !item.ProduccionGO
    //                             ? formatNumber(Number(baseQty(item.BaseQtyLine, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0)))
    //                             : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet)));
    
    //                         return {
    //                             type: item.type,
    //                             wetTime: savedTimes ? savedTimes.wetTime : '',
    //                             dryTime: savedTimes ? savedTimes.dryTime : '',
    //                             LineNum: item.LineNum,
    //                             Und: item.Und,
    //                             baseEntry: item.DocEntry,
    //                             product: item.ItemCode2,
    //                             description: item.ItemName,
    //                             real: item.Batch === 'N'
    //                                 ? savedItem
    //                                     ? formatNumber(Number(baseQty(savedItem?.quantity, mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0)))
    //                                     : realQuantity
    //                                 : savedItem
    //                                     ? formatNumber(savedItem.lotNumbers.reduce((total, lot) => total + baseQty(Number(lot.quantity), (mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 1)), 0))
    //                                     : realQuantity,
    //                             base: !pallet ? formatNumber(Number(item.BaseQtyLine)) : formatNumber(Number(baseQty(item.BaseQtyLine, item.UndXPallet))),
    //                             wareHouse: item.wareHouse,
    //                             lotNumbers: item.Batch === 'Y'
    //                                 ? (savedItem
    //                                     ? savedItem.lotNumbers.map(lot => ({
    //                                         lotNumber: lot.lotNumber,
    //                                         quantity: formatNumber(Number(baseQty(lot.quantity, (mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 1))))
    //                                     }))
    //                                     : [{
    //                                         lotNumber: '',
    //                                         quantity: realQuantity
    //                                     }])
    //                                 : [],
    //                             lotOptions: item.Batch === 'Y' && savedItem
    //                                 ? savedItem.lotNumbers.map(lot => ({
    //                                     label: `LOT:${lot.lotNumber}  | QTY:${lot.quantity}`,
    //                                     value: lot.lotNumber,
    //                                 }))
    //                                 : [],
    //                             batch: item.Batch,
    //                         };
    //                     });
    
    //                     setFormData({ ...formData, rows: formattedData, dryTime: savedTimes.dryTime, wetTime: savedTimes.wetTime });
    //                 }
    //             }
    //         };
    
    //         initializeFormData();
    //     }
    // }, [data, mixType, ParentOrKid, visible]);
    
    //end recomendacion lotes
    const fetchLots = async (item, warehouse, rowIndex) => {
        try {
            const response = await fetch(`/api/LotsByItem?item='${item}'&warehouse='${warehouse}'`);
            const data = await response.json();
            const formattedLots = data.map((lot) => ({
                label: `LOT:${lot.BatchNum}  | QTY:${Number(lot.Quantity).toFixed(3)}`,
                value: lot.BatchNum,
                quantity: lot.Quantity,
            }));
            setFormData((prevFormData) => {
                const updatedFormData = { ...prevFormData };
                updatedFormData.rows[rowIndex].lotOptions = formattedLots;
                return updatedFormData;
            });
        } catch (error) {
            console.error('Error fetching lots:', error);
        }
    };

    // const onInputChange = (e, rowIndex, field) => {
    //     if (rowIndex !== null && rowIndex !== undefined) {
    //         const updatedRows = formData.rows.map((item, index) => {
    //             if (index === rowIndex) {
    //                 return { ...item, [field]: e.target.value };
    //             }
    //             return item;
    //         });
    //         setFormData({ ...formData, rows: updatedRows });
    //     } else {
    //         setFormData({ ...formData, [field]: e.target.value });
    //     }
    // };

    const onInputChange = (e, rowIndex, field) => {
        if (rowIndex !== null && rowIndex !== undefined) {
            const updatedRows = formData.rows.map((item, index) => {
                if (index === rowIndex) {
                    let updatedItem = { ...item, [field]: e.target.value };

                    // Si el campo "real" se cambia y el item no tiene batch, actualizar lotNumbers
                    if (item.batch === 'N') {
                        updatedItem = {
                            ...updatedItem,
                            lotNumbers: updatedItem.lotNumbers.map(lot => ({
                                ...lot,
                                quantity: e.target.value, // actualizar la cantidad del lote
                            }))
                        };
                    }

                    return updatedItem;
                }
                return item;
            });
            setFormData({ ...formData, rows: updatedRows });
        } else {
            setFormData({ ...formData, [field]: e.target.value });
        }
    };


    // const onLotChange = (e, rowIndex, lotIndex, field) => {
    //     const updatedRows = formData.rows.map((item, index) => {
    //         if (index === rowIndex) {
    //             const updatedLots = item.lotNumbers.map((lot, lIndex) => {
    //                 if (lIndex === lotIndex) {

    //                     return { ...lot, [field]: e.target.value || lot.quantity };
    //                 }
    //                 return lot;
    //             });
    //             return { ...item, lotNumbers: updatedLots };
    //         }
    //         return item;
    //     });

    //     setFormData({ ...formData, rows: updatedRows });
    // };
    const onLotChange = (e, rowIndex, lotIndex, field) => {
        const updatedRows = formData.rows.map((item, index) => {
            if (index === rowIndex) {
                const updatedLots = item.lotNumbers.map((lot, lIndex) => {
                    if (lIndex === lotIndex) {
                        return { ...lot, [field]: e.target.value };  // Aquí se usa e.target.value directamente
                    }
                    return lot;
                });
                return { ...item, lotNumbers: updatedLots };
            }
            return item;
        });

        setFormData({ ...formData, rows: updatedRows });
    };



    const addLot = (rowIndex) => {
        const updatedRows = formData.rows.map((item, index) => {
            if (index === rowIndex) {
                if (item.lotNumbers.length < 3) {
                    return { ...item, lotNumbers: [...item.lotNumbers, { lotNumber: '', quantity: '' }] };
                }
            }
            return item;
        });
        setFormData({ ...formData, rows: updatedRows });
    };

    const removeLot = (rowIndex, lotIndex) => {
        const updatedRows = formData.rows.map((item, index) => {
            if (index === rowIndex) {
                const updatedLots = item.lotNumbers.filter((_, lIndex) => lIndex !== lotIndex);
                return { ...item, lotNumbers: updatedLots };
            }
            return item;
        });
        setFormData({ ...formData, rows: updatedRows });
    };

    const validateQuantities = () => {
        let valid = true;
        for (let item of formData.rows) {
            const totalLotQuantity = item.lotNumbers.reduce((acc, lot) => {
                return acc + (lot.quantity ? parseFloat(lot.quantity) : 0);
            }, 0);

            if (item.batch === 'Y' && item.lotNumbers.some((lot) => parseFloat(lot.quantity) === 0 ||!lot.quantity)) {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Warning',
                    detail: 'Lot quantities cannot be zero.',
                });
                valid = false;
            }

            if (parseFloat(item.real) ==0 || !item.real)  {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Warning',
                    detail: 'The quantities cannot be zero.',
                });
                valid = false;
            }

            if (parseFloat(item.real) > totalLotQuantity &&totalLotQuantity!=0 && item.batch === 'Y') {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Warning',
                    detail: 'The quantity cannot exceed the total available in the selected lots.',
                });
                valid = false;
            }

            if (item.batch === 'Y' && item.lotNumbers.some((lot) => !lot.lotNumber)) {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Warning',
                    detail: 'All batch items must have a selected lot.',
                });
                valid = false;
            }
        }
        return valid;
    };

    const createReceiptPayload = (docEntry, itemCode, quantity) => {
        console.log(quantity)
        const documentLines = [
            {
              
                baseEntry: docEntry,
                baseType: 202,
                itemCode: itemCode,
                quantity: quantity,
                WareHouse: data[0]?.Warehouse || data.Warehouse,
                DocumentLinesBinAllocations: [
                    {
                        AllowNegativeQuantity: 'Y',
                        BaseLineNumber: 0,
                        BinAbsEntry: data[0]?.AbsEntry || data.AbsEntry,
                        quantity: quantity,
                    },
                ],
                documentLinesBatchNumbers: [
                    {
                        batchNumber:

                            data[0]?.GroupParent ? data[0]?.GroupParent + "_D" : data[0]?.CustomerPO + "_D",
                        AddmisionDate: new Date().toLocaleDateString(),
                        ExpirationDate: addDaysToDate(new Date(), data[0]?.BestBeforeDays).toLocaleDateString(),
                        notes: `NOTA LOTE ${batchId(data[0]?.PlantId)}`,
                        quantity: quantity,
                    },
                ],
            },
        ];

        return {
            U_CTS_Session: localStorage.getItem("sessionCode"),
            U_CTS_POG: '',
            U_CTS_TURNO: shift,
            U_CTS_PLine: line,
            docDate: new Date().toLocaleDateString(),
            docDueDate: new Date().toLocaleDateString(),
            comments: 'Source: Portal Production Web',
            documentType: 'ReceiptFromProduction',
            documentLines,
        };
    };

    // const handleSave = async () => {

    //     console.log('en save')
    //     console.log(pallet)
    //     if (!validateQuantities()) return;
    //     if ((!formData.wetTime || !formData.dryTime) && !data[0]?.ProduccionGO && ParentOrKid === 'Kid') {
    //         toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Wet Mix Time and Dry Mix Time are required.' });
    //         return;
    //     }

    //     setLoading(true);

    //     const filteredData = formData.rows.filter((item) => item.real && parseFloat(item.real) > 0);

    //     console.log("loteeeeeeeeeeeeeeeeeeeee")
    //     console.log(formData.rows)
    //     // Guardar los lotes seleccionados en localStorage


    //     const itemCode = ParentOrKid === 'Parent' ? data?.ItemCode2 : data[0]?.ItemCode;
    //     const lotStorageKey = ParentOrKid === 'Parent'
    //         ? `savedLotsFinish_${itemCode}`
    //         : pallet
    //             ? `savedLotsPackaging_${itemCode}`
    //             : `savedLotsDough_${itemCode}`;

    //     const selectedLots = formData.rows.map(row => ({
    //         product: row.product,
    //         quantity: row.real,
    //         lotNumbers: row.lotNumbers.map(lot => ({ lotNumber: lot.lotNumber, quantity: lot.quantity }))
    //     }));

    //     // Aquí se establece la información en localStorage
    //     localStorage.setItem(lotStorageKey, JSON.stringify(selectedLots));
    //     localStorage.setItem(`mixtypestorage+${itemCode}`,mixType )

    //     if (chips) {
    //         // Logic for handling chips

    //         let docEntries;
    //         let proportions
    //         if (data.length) {
    //             console.log(data)
    //             console.log(data[0]?.DocEntry)
    //             docEntries = data[0]?.DocEntry.split(',').map(entry => entry.trim());

    //             proportions = data[0]?.Proportion.split(',').map(pro => (Number(pro.trim()) / data[0].PlannedQty).toFixed(2));

    //         }
    //         else {
    //             console.log(data)
    //             console.log(data[0]?.DocEntry)
    //             docEntries = data?.DocEntry.split(',').map(entry => entry.trim());

    //             proportions = data?.Proportion.split(',').map(pro => (Number(pro.trim()) / data.PlannedQty).toFixed(2));

    //         }

    //         // const totalDocEntries = docEntries.length;

    //         const requests = docEntries.map((docEntry, index) => {
    //             const payload = {
    //                 U_CTS_TIMEW: formData.wetTime,
    //                 U_CTS_TIMED: formData.dryTime,
    //                 U_CTS_TURNO: shift,
    //                 U_CTS_PLine: line,
    //                 docDate: new Date().toLocaleDateString(),
    //                 docDueDate: new Date().toLocaleDateString(),
    //                 comments: 'Source: Portal Production Web, Mix:' + ((mixType === 'Full' ? 1 : (mixType === 'Half' ? 0.5 : (mixType === 'Double' ? 2 : 0)))),
    //                 documentType: 'IssueForProduction',
    //                 documentLines: filteredData.map((item) => ({
    //                     // notes: ((mixType === 'Full' ? 1 : (mixType === 'Half' ? 0.5 : (mixType === 'Double' ? 2 : 0)))),
    //                     baseEntry: docEntry,
    //                     baseLine: item.LineNum,
    //                     baseType: 202,
    //                     itemCode: item.product,
    //                     quantity: formatNumber(parseFloat(item.real) * proportions[index]),
    //                     WareHouse: item.wareHouse,
    //                     ...(item.batch === 'Y' && {
    //                         documentLinesBatchNumbers: item.lotNumbers.map((lot) => ({
    //                             batchNumber: lot.lotNumber,
    //                             notes: `NOTA LOTE ${lot.lotNumber}`,
    //                             quantity: formatNumber(parseFloat(lot.quantity || 0) * proportions[index]),
    //                             baseLineNumber: ParentOrKid === 'Parent' ? 0 : item.LineNum,
    //                         })),
    //                     }),
    //                 })),
    //             };

    //             console.log(payload)
    //             const token = localStorage.getItem('Token');

    //             return fetch(`${BASE_URL}/Production/PostIssue4Production`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify(payload),
    //             })
    //                 .then(response => response.json())
    //                 .then(result => {

    //                     if (result.Result === 'SUCCESS') {
    //                         toast.current.show({ severity: 'success', summary: 'Success', detail: result.Message });
    //                         addOrderToSession(parentEntry);

    //                         console.log(data[0]?.ProduccionGO)
    //                         console.log(ParentOrKid)
    //                         if (!data[0]?.ProduccionGO && ParentOrKid == 'Kid') {

    //                             console.log("aqio")
    //                             const receiptPayload = createReceiptPayload(docEntry, payload.documentLines[0].itemCode, (formatNumber(Number(mixType === 'Full' ? 1 : (mixType === 'Half' ? 0.5 : (mixType === 'Double' ? 2 : 0)))) * proportions[index]));
    //                             console.log(receiptPayload)
    //                             console.log(result.Result)
    //                             return fetch(`${BASE_URL}/Production/PostReceiptFromProduction`, {
    //                                 method: 'POST',
    //                                 headers: {
    //                                     'Content-Type': 'application/json',
    //                                     Authorization: `Bearer ${token}`,
    //                                 },
    //                                 body: JSON.stringify(receiptPayload),
    //                             }).then(receiptResponse => receiptResponse.json());


    //                         }
    //                     } else {
    //                         toast.current.show({ severity: 'error', summary: 'Error', detail: result.Message });
    //                     }
    //                 })
    //                 .catch(error => {
    //                     console.error('Error:', error);
    //                     toast.current.show({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred' });
    //                 });
    //         });

    //         await Promise.all(requests);
    //         onHide(false);
    //         onSave(true);
    //     } else {
    //         // Existing logic
    //         const payload = {
    //             U_CTS_TIMEW: formData.wetTime,
    //             U_CTS_TIMED: formData.dryTime,
    //             U_CTS_TURNO: shift,
    //             U_CTS_PLine: line,
    //             docDate: new Date().toLocaleDateString(),
    //             docDueDate: new Date().toLocaleDateString(),
    //             comments: 'Source: Portal Production Web, Mix:' + ((mixType === 'Full' ? 1 : (mixType === 'Half' ? 0.5 : (mixType === 'Double' ? 2 : 0)))),
    //             documentType: 'IssueForProduction',
    //             documentLines: filteredData.map((item, index) => ({
    //                 // notes: ((mixType === 'Full' ? 1 : (mixType === 'Half' ? 0.5 : (mixType === 'Double' ? 2 : 0)))),
    //                 baseEntry: item.baseEntry,
    //                 baseLine: item.LineNum,
    //                 baseType: 202,
    //                 itemCode: item.product,
    //                 quantity: parseFloat(item.real),
    //                 WareHouse: item.wareHouse,
    //                 ...(item.batch === 'Y' && {
    //                     documentLinesBatchNumbers: item.lotNumbers.map((lot, lIndex) => ({
    //                         batchNumber: lot.lotNumber,
    //                         notes: `NOTA LOTE ${lot.lotNumber}`,
    //                         quantity: parseFloat(lot.quantity || 0),
    //                         baseLineNumber: index,
    //                     })),
    //                 }),
    //             })),
    //         };

    //         try {
    //             const token = localStorage.getItem('Token');

    //             const response = await fetch(`${BASE_URL}/Production/PostIssue4Production`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify(payload),
    //             });

    //             const result = await response.json();

    //             if (response.ok) {
    //                 toast.current.show({ severity: 'success', summary: 'Success', detail: result.Message });
    //                 addOrderToSession(parentEntry);
    //                 console.log(data[0]?.Type)
    //                 if (!data[0]?.ProduccionGO && data[0]?.ParentOrKid === 'Kid') {
    //                     const receiptPayload = createReceiptPayload(payload.documentLines[0].baseEntry, payload.documentLines[0].itemCode, formatNumber(Number(mixType === 'Full' ? 1 : (mixType === 'Half' ? 0.5 : (mixType === 'Double' ? 2 : 0)))))

    //                     const receiptResult = await fetch(`${BASE_URL}/Production/PostReceiptFromProduction`, {
    //                         method: 'POST',
    //                         headers: {
    //                             'Content-Type': 'application/json',
    //                             Authorization: `Bearer ${token}`,
    //                         },
    //                         body: JSON.stringify(receiptPayload),
    //                     });
    //                     const receiptResponse = await receiptResult.json();

    //                     if (receiptResult.ok) {
    //                         toast.current.show({ severity: 'success', summary: 'Success', detail: receiptResponse.Message });
    //                     } else {
    //                         toast.current.show({ severity: 'error', summary: 'Error', detail: receiptResponse.Message });
    //                     }
    //                 }
    //                 onHide(false);
    //                 onSave(true);
    //             } else {
    //                 toast.current.show({ severity: 'error', summary: 'Error', detail: result.Message });
    //             }
    //         } catch (error) {
    //             console.error('Error:', error);
    //             toast.current.show({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred' });
    //         }
    //     }

    //     setLoading(false);
    // };
    const handleSave = async () => {
        console.log('In Save');
        console.log(pallet);
    
        // Validate quantities before proceeding
        if (!validateQuantities()) return;
    
        // Check for required Wet Mix Time and Dry Mix Time based on conditions
        if ((!formData.wetTime || !formData.dryTime) && !data[0]?.ProduccionGO && ParentOrKid === 'Kid') {
            toast.current.show({ 
                severity: 'warn', 
                summary: 'Warning', 
                detail: 'Wet Mix Time and Dry Mix Time are required.' 
            });
            return;
        }
    
        setLoading(true);
    
        // Filter rows with valid quantities
        const filteredData = formData.rows.filter((item) => item.real && parseFloat(item.real) > 0);
    
        console.log("Selected Lots:");
        console.log(formData.rows);
    
        // Determine the storage key based on Parent or Kid
        const itemCode = ParentOrKid === 'Parent' ? data?.ItemCode2 : data[0]?.ItemCode;
        const lotStorageKey = ParentOrKid === 'Parent'
            ? `savedLotsFinish_${itemCode}`
            : pallet
                ? `savedLotsPackaging_${itemCode}`
                : `savedLotsDough_${itemCode}`;
    
        // Prepare selected lots data
        const selectedLots = formData.rows.map(row => ({
            product: row.product,
            quantity: row.real,
            lotNumbers: row.lotNumbers.map(lot => ({ 
                lotNumber: lot.lotNumber, 
                quantity: lot.quantity 
            }))
        }));
    
        // Store selected lots in localStorage
        localStorage.setItem(lotStorageKey, JSON.stringify(selectedLots));
        localStorage.setItem(`mixtypestorage+${itemCode}`, mixType );
    

        console.log("va entrar a chips")
        if (chips) {
            // Logic for handling chips
            console.log("en chips")
            let docEntries;
            let proportions;
    
            if (data.length) {
                console.log(data);
                console.log(data[0]?.DocEntry);
                docEntries = data[0]?.DocEntry.split(',').map(entry => entry.trim());
                proportions = data[0]?.Proportion.split(',').map(pro => (Number(pro.trim()) / data[0].PlannedQty).toFixed(2));
            } else {
                console.log(data);
                console.log(data[0]?.DocEntry);
                docEntries = data?.DocEntry.split(',').map(entry => entry.trim());
                proportions = data?.Proportion.split(',').map(pro => (Number(pro.trim()) / data.PlannedQty).toFixed(2));
            }
    
            console.log("en docentries")
            console.log(docEntries)
            // Create an array of fetch requests for each document entry
            const requests = docEntries.map((docEntry, index) => {
                const payload = {
                    U_CTS_Session: localStorage.getItem("sessionCode"),
                    U_CTS_TIMEW: formData.wetTime,
                    U_CTS_TIMED: formData.dryTime,
                    U_CTS_TURNO: shift,
                    U_CTS_PLine: line,
                    docDate: new Date().toLocaleDateString(),
                    docDueDate: new Date().toLocaleDateString(),
                    comments: `Source: Portal Production Web, Mix:${mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0}`,
                    documentType: 'IssueForProduction',
                    documentLines: filteredData.map((item) => ({
                        baseEntry: docEntry,
                        baseLine: item.LineNum,
                        baseType: 202,
                        itemCode: item.product,
                        quantity: formatNumber(parseFloat(item.real) * proportions[index]),
                        WareHouse: item.wareHouse,
                        ...(item.batch === 'Y' && {
                            documentLinesBatchNumbers: item.lotNumbers.map((lot) => ({
                                batchNumber: lot.lotNumber,
                                notes: `LOT NOTE ${lot.lotNumber}`,
                                quantity: formatNumber(parseFloat(lot.quantity || 0) * proportions[index]),
                                baseLineNumber: ParentOrKid === 'Parent' ? 0 : item.LineNum,
                            })),
                        }),
                    })),
                };
    
                console.log(payload);
                const token = localStorage.getItem('Token');
    
                // Return the fetch promise without showing success toast here
                return fetch(`${BASE_URL}/Production/PostIssue4Production`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.Result === 'SUCCESS') {
                            addOrderToSession(parentEntry);
    
                            console.log(data[0]?.ProduccionGO);
                            console.log(ParentOrKid);
    
                            if (!data[0]?.ProduccionGO && ParentOrKid === 'Kid') {
                                console.log("Creating Receipt for Kid");
    
                                const receiptPayload = createReceiptPayload(
                                    docEntry, 
                                    payload.documentLines[0].itemCode, 
                                    formatNumber(
                                        Number(
                                            mixType === 'Full' ? 1 : 
                                            mixType === 'Half' ? 0.5 : 
                                            mixType === 'Double' ? 2 : 0
                                        )
                                    ) * proportions[index]
                                );
    
                                console.log(receiptPayload);
                                console.log(result.Result);
    
                                // Send the Receipt and handle its response
                                return fetch(`${BASE_URL}/Production/PostReceiptFromProduction`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify(receiptPayload),
                                }).then(receiptResponse => receiptResponse.json())
                                  .then(receiptResult => {
                                      if (receiptResult.Result === 'SUCCESS') {
                                          // Optionally, you can log receipt success
                                          logEvent({
                                              action: 'Post Receipt Success',
                                              payload: receiptPayload,
                                              response: receiptResult
                                          }, 'info');
                                      } else {
                                          toast.current.show({ 
                                              severity: 'error', 
                                              summary: 'Error', 
                                              detail: receiptResult.Message 
                                          });
                                          // Log the error response from the server
                                          logEvent({
                                              action: 'Post Receipt Error',
                                              payload: receiptPayload,
                                              response: receiptResult
                                          }, 'error');
                                      }
                                  });
                            }
    
                            // Optionally, log the successful issue
                            logEvent({
                                action: 'Post Issue Success',
                                payload: payload,
                                response: result
                            }, 'info');
                        } else {
                            // Show error toast for this particular document
                            toast.current.show({ 
                                severity: 'error', 
                                summary: 'Error', 
                                detail: result.Message 
                            });
                            // Log the error response from the server
                            logEvent({
                                action: 'Post Issue Response Error',
                                payload: payload,
                                response: result
                            }, 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        toast.current.show({ 
                            severity: 'error', 
                            summary: 'Error', 
                            detail: 'An unexpected error occurred' 
                        });
                        // Log the caught error
                        logEvent({
                            action: 'Post Issue Fetch Error',
                            error: error.message || error
                        }, 'error');
                    });
            });
    
            // Wait for all requests to complete
            await Promise.all(requests);
    
            // After all requests are successful, show a single success toast
            toast.current.show({ 
                severity: 'success', 
                summary: 'Success', 
                detail: 'All documents were created successfully.' 
            });
    
            onHide(false);
            onSave(true);
        } else {
            console.log("en otra cosa que no este agrupada")
            // Existing logic for when chips are not present
            const payload = {
                U_CTS_Session: localStorage.getItem("sessionCode"),
                U_CTS_TIMEW: formData.wetTime,
                U_CTS_TIMED: formData.dryTime,
                U_CTS_TURNO: shift,
                U_CTS_PLine: line,
                docDate: new Date().toLocaleDateString(),
                docDueDate: new Date().toLocaleDateString(),
                comments: `Source: Portal Production Web, Mix:${mixType === 'Full' ? 1 : mixType === 'Half' ? 0.5 : mixType === 'Double' ? 2 : 0}`,
                documentType: 'IssueForProduction',
                documentLines: filteredData.map((item, index) => ({
                    baseEntry: item.baseEntry,
                    baseLine: item.LineNum,
                    baseType: 202,
                    itemCode: item.product,
                    quantity: parseFloat(item.real),
                    WareHouse: item.wareHouse,
                    ...(item.batch === 'Y' && {
                        documentLinesBatchNumbers: item.lotNumbers.map((lot, lIndex) => ({
                            batchNumber: lot.lotNumber,
                            notes: `LOT NOTE ${lot.lotNumber}`,
                            quantity: parseFloat(lot.quantity || 0),
                            baseLineNumber: index,
                        })),
                    }),
                })),
            };
    
            try {
                const token = localStorage.getItem('Token');
    
                // Log the Issue payload
                logEvent({
                    action: 'Create Issue Payload',
                    payload: payload
                }, 'info');
    
                const response = await fetch(`${BASE_URL}/Production/PostIssue4Production`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    // Show success toast only once
                    toast.current.show({ 
                        severity: 'success', 
                        summary: 'Success', 
                        detail: result.Message 
                    });
                    addOrderToSession(parentEntry);
                    console.log(data[0]?.Type);
                    
                    if (!data[0]?.ProduccionGO && data[0]?.ParentOrKid === 'Kid') {
                        const receiptPayload = createReceiptPayload(
                            payload.documentLines[0].baseEntry, 
                            payload.documentLines[0].itemCode, 
                            formatNumber(
                                Number(
                                    mixType === 'Full' ? 1 : 
                                    mixType === 'Half' ? 0.5 : 
                                    mixType === 'Double' ? 2 : 0
                                )
                            )
                        );
    
                        const receiptResult = await fetch(`${BASE_URL}/Production/PostReceiptFromProduction`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(receiptPayload),
                        });
                        const receiptResponse = await receiptResult.json();
    
                        if (receiptResult.ok) {
                            toast.current.show({ 
                                severity: 'success', 
                                summary: 'Success', 
                                detail: receiptResponse.Message 
                            });
                            // Log the successful receipt
                            logEvent({
                                action: 'Post Finished Good Receipt',
                                payload: receiptPayload,
                                response: receiptResponse
                            }, 'info');
                        } else {
                            toast.current.show({ 
                                severity: 'error', 
                                summary: 'Error', 
                                detail: receiptResponse.Message 
                            });
                            // Log the failed receipt response
                            logEvent({
                                action: 'Post Finished Good Receipt Error',
                                payload: receiptPayload,
                                response: receiptResponse
                            }, 'error');
                        }
                    }
                    onHide(false);
                    onSave(true);
                } else {
                    // Show error toast for the issue
                    toast.current.show({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: result.Message 
                    });
                    // Log the error response from the server
                    logEvent({
                        action: 'Post Issue Response Error',
                        payload: payload,
                        response: result
                    }, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.current.show({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'An unexpected error occurred' 
                });
                // Log the caught error
                logEvent({
                    action: 'Post Issue Fetch Error',
                    error: error.message || error
                }, 'error');
            }
        }
    
        setLoading(false);
    };
    
    
    const handleAddPallet = async () => {
        if (!validateQuantities()) return;

        const lotStorageKey = pallet ? `savedLotsPackaging_${data[0].ItemCode}` : `savedLotsDough_${data[0].ItemCode}`;
        const selectedLots = formData.rows.map(row => ({
            product: row.product,
            lotNumbers: row.lotNumbers.map(lot => ({ lotNumber: lot.lotNumber, quantity: lot.quantity }))
        }));
        localStorage.setItem(lotStorageKey, JSON.stringify(selectedLots));

        setLoading(true);

        const filteredData = formData.rows.filter((item) => item.real && parseFloat(item.real) > 0);

        const payload = {
            U_CTS_Session: localStorage.getItem("sessionCode"),
            U_CTS_TIMEW: formData.wetTime,
            U_CTS_TIMED: formData.dryTime,
            U_CTS_TURNO: shift,
            U_CTS_PLine: line,
            docDate: new Date().toLocaleDateString(),
            docDueDate: new Date().toLocaleDateString(),
            comments: 'Source: Portal Production Web',
            documentType: 'IssueForProduction',
            documentLines: filteredData.map((item, index) => ({
                ///   notes: ((mixType === 'Full' ? 1 : (mixType === 'Half' ? 0.5 : (mixType === 'Double' ? 2 : 0)))),
                baseEntry: item.baseEntry,
                baseLine: item.LineNum,
                baseType: 202,
                itemCode: item.product,
                quantity: parseFloat(item.real),
                WareHouse: item.wareHouse,
                ...(item.batch === 'Y' && {
                    documentLinesBatchNumbers: item.lotNumbers.map((lot, lIndex) => ({
                        batchNumber: lot.lotNumber,
                        notes: `NOTA LOTE ${lot.lotNumber}`,
                        quantity: parseFloat(lot.quantity || 0),
                        baseLineNumber: index,
                    })),
                }),
            })),
        };

        try {
            const token = localStorage.getItem('Token');

            const response = await fetch(`${BASE_URL}/Production/PostIssue4Production`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                console.log("aqui")
                toast.current.show({ severity: 'success', summary: 'Success', detail: result.Message });
                addOrderToSession(parentEntry);

                if (!data[0].ProduccionGO) {
                    const receiptPayload = createReceiptPayload(payload.documentLines[0].baseEntry, payload.documentLines[0].itemCode, formatNumber(Number(mixType === 'Full' ? 1 : (mixType === 'Half' ? 0.5 : (mixType === 'Double' ? 2 : 0)))));

                    const receiptResult = await fetch(`${BASE_URL}/Production/PostReceiptFromProduction`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(receiptPayload),
                    });
                    const receiptResponse = await receiptResult.json();

                    if (receiptResult.ok) {
                        toast.current.show({ severity: 'success', summary: 'Success', detail: receiptResponse.Message });
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Error', detail: receiptResponse.Message });
                    }
                } else {
                    onHide(true, true);
                }
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: result.Message });
            }
        } catch (error) {
            console.error('Error:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };


    // const lotTemplate = (rowData, rowIndex) => {
    //     const showRemoveButton = rowData.lotNumbers.length > 1;
    //     return rowData?.lotNumbers?.map((lot, lotIndex) => (
    //         <div key={`${rowIndex}-${lotIndex}`} className="lote-detail">
    //             <div className="p-col-4" style={{ width: '150px', fontSize: '12px' }}>
    //                 <Dropdown
    //                     value={lot.lotNumber}
    //                     options={rowData.lotOptions}
    //                     onChange={(e) => onLotChange(e, rowIndex, lotIndex, 'lotNumber')}
    //                     onFocus={() => fetchLots(rowData.product, rowData.wareHouse, rowIndex)}
    //                     placeholder="Select Lot"
    //                     style={{ width: '150px', fontSize: '12px' }}
    //                 />
    //             </div>
    //             <div className="p-col-4">
    //                 <div className="p-col-2">
    //                     {showRemoveButton && (
    //                         <Button
    //                             icon="pi pi-times"
    //                             className="p-button-text p-button-danger"
    //                             onClick={() => removeLot(rowIndex, lotIndex)}
    //                             style={{ color: 'red' }}
    //                         />
    //                     )}
    //                     <InputText
    //                         value={lot.quantity}
    //                         onChange={(e) => onLotChange(e, rowIndex, lotIndex, 'quantity')}
    //                         placeholder="Lot Quantity"
    //                         type="number"
    //                         step="0.01"
    //                         style={{ width: '150px', fontSize: '12px' }}
    //                     />



    //                 </div>
    //             </div>
    //         </div>
    //     ));
    // };

    // const lotTemplate = (rowData, rowIndex) => {
    //     const showRemoveButton = rowData.lotNumbers.length > 1;
    //     return rowData?.lotNumbers?.map((lot, lotIndex) => (
    //         <div key={`${rowIndex}-${lotIndex}`} className="lote-detail" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
    //             <div style={{ flex: '1', minWidth: '50px' , maxWidth:'200px' }}>
    //                 <Dropdown
    //                     value={lot.lotNumber}
    //                     options={rowData.lotOptions}
    //                     onChange={(e) => onLotChange(e, rowIndex, lotIndex, 'lotNumber')}
    //                     onFocus={() => fetchLots(rowData.product, rowData.wareHouse, rowIndex)}
    //                     placeholder="Select Lot"
    //                     style={{ width: '100%', fontSize: '12px' }}
    //                 />
    //             </div>
    //             <div style={{ flex: '1', minWidth: '50px', maxWidth:'200px' }}>
    //                 <InputText
    //                     value={lot.quantity}
    //                     onChange={(e) => onLotChange(e, rowIndex, lotIndex, 'quantity')}
    //                     placeholder="Lot Quantity"
    //                     type="number"
    //                     step="0.01"
    //                     style={{ width: '100%', fontSize: '12px' }}
    //                 />
    //             </div>
    //             {showRemoveButton && (
    //                 <div style={{ flex: '0 0 auto', minWidth: '30px' }}>
    //                     <Button
    //                         icon="pi pi-times"
    //                         className="p-button-text p-button-danger"
    //                         onClick={() => removeLot(rowIndex, lotIndex)}
    //                         style={{ color: 'red', fontSize: '12px' }}
    //                     />
    //                 </div>
    //             )}
    //         </div>
    //     ));
    // };

    const lotTemplate = (rowData, rowIndex) => {
        const showRemoveButton = rowData.lotNumbers.length > 1;
        return (
            <div key={rowIndex} className="lote-detail" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>

                <div style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
                    {rowData?.lotNumbers?.map((lot, lotIndex) => (
                        <div key={`${rowIndex}-${lotIndex}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
                            <div style={{ flex: '1', width: '150px', minWidth: '150px', maxWidth: '150px' }}>
                                <Dropdown
                                    value={lot.lotNumber}
                                    options={rowData.lotOptions}
                                    onChange={(e) => onLotChange(e, rowIndex, lotIndex, 'lotNumber')}
                                    onFocus={() => fetchLots(rowData.product, rowData.wareHouse, rowIndex)}
                                    placeholder="Select Lot"
                                    style={{ width: '100%', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                />
                            </div>
                            <div style={{ flex: '1', minWidth: '50px', maxWidth: '200px' }}>
                                <InputText
                                    value={lot.quantity}
                                    onChange={(e) => onLotChange(e, rowIndex, lotIndex, 'quantity')}
                                    placeholder="Lot Quantity"
                                    type="number"
                                    step="0.01"
                                    style={{ width: '100%', fontSize: '12px' }}
                                />
                            </div>
                            {showRemoveButton && (
                                <div style={{ flex: '0 0 auto', minWidth: '30px' }}>
                                    <Button
                                        icon="pi pi-times"
                                        className="p-button-text p-button-danger"
                                        onClick={() => removeLot(rowIndex, lotIndex)}
                                        style={{ color: 'red', fontSize: '12px' }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ flex: '0 0 auto', minWidth: '30px' }}>
                    <Button
                        icon="pi pi-plus"
                        className="p-button-secondary"
                        onClick={() => addLot(rowIndex)}
                        style={{ fontSize: '12px' }}
                    />
                </div>
            </div>
        );
    };



    console.log(formData)
    const times = (
        <div className="card flex justify-content-center">
            <div className="flex flex-wrap gap-3">
                <div className="flex align-items-center">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label>Dry Mix Time:</label>
                        <InputText value={formData.dryTime} onChange={(e) => onInputChange(e, null, 'dryTime')} type="number" step="0.01" placeholder="time" style={{ width: '7rem', fontSize: '12px' }} required />
                        <span className="p-inputgroup-addon">{"min"}</span>
                    </div>
                </div>
                <div className="flex align-items-center">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label>Wet Mix Time:</label>
                        <InputText value={formData.wetTime} onChange={(e) => onInputChange(e, null, 'wetTime')} type="number" step="0.01" placeholder="time" style={{ width: '7rem', fontSize: '12px' }} required />
                        <span className="p-inputgroup-addon">{"min"}</span>
                    </div>
                </div>


            </div>
        </div>

    );

    const footer = (
        <div className="p-d-flex p-jc-end">

            <Button label="Cancel" icon="pi pi-times" className="p-button-danger p-mr-2" onClick={() => onHide(false, false)} />
            {!pallet && <Button label="Save" icon="pi pi-check"
                className="p-button-success"
                onClick={handleSave}
                disabled={loading} />}
            {pallet === 'Y' && (
                <Button
                    label="Pallet"
                    icon="pi pi-check"
                    className="p-button-success"
                    onClick={handleAddPallet}
                    disabled={loading}
                />
            )}
        </div>
    );


    const mix = (<div className="card flex justify-content-center" style={{ padding: '1rem' }}>
        <div className="flex flex-wrap gap-3">
            <div className="flex align-items-center">
                <RadioButton inputId="Full" name="mix" value="Full" onChange={(e) => setMixType(e.value)} checked={mixType === 'Full'} />
                <label htmlFor="Full" className="ml-2">Full</label>
            </div>
            <div className="flex align-items-center">
                <RadioButton inputId="Half" name="mix" value="Half" onChange={(e) => setMixType(e.value)} checked={mixType === 'Half'} />
                <label htmlFor="Half" className="ml-2">Half</label>
            </div>
            {(chips || chips1 === 'CHIPS') && <div className="flex align-items-center">
                <RadioButton inputId="Double" name="mix" value="Double" onChange={(e) => setMixType(e.value)} checked={mixType === 'Double'} />
                <label htmlFor="Double" className="ml-2">Double</label>
            </div>}

        </div>
    </div>);

    return (
        <>
            <Toast ref={toast} position="top-right" style={{ marginTop: '60px', zIndex: 9999 }} />
            <Dialog header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Issue Components</span>
                    {loading && <ProgressSpinner style={{ width: '40px', height: '40px' }} />}
                </div>
            } maximizable visible={visible} onHide={() => onHide(false)} footer={footer} className="good-issue-dialog" style={{ width: '80vw' }} >

                {!pallet && ParentOrKid == 'Kid' && <div>{mix}</div>}
                <Card>
                    <DataTable value={formData.rows} >
                        <Column field="product" header="Product" />
                        <Column field="description" header="Description" />
                        <Column field="base" header="Base" />
                        <Column
                            field="real"
                            header="Real"
                            body={(rowData, rowIndex) => (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <InputText
                                        value={rowData.real}
                                        onChange={(e) => onInputChange(e, rowIndex.rowIndex, 'real')}
                                        type="number"
                                        step="0.01"
                                        placeholder="Quantity"
                                        style={{ width: '7rem', fontSize: '12px' }}
                                    />
                                    <span className="p-inputgroup-addon">{formData.rows[0]?.Und || ''}</span>
                                </div>
                            )}
                        />
                        <Column field="lotNumbers" header="Lot Numbers" body={(rowData, rowIndex) => (rowData.batch === 'Y' ? lotTemplate(rowData, rowIndex.rowIndex) : '')} />
                        {/* <Column body={(rowData, rowIndex) => (rowData.batch === 'Y' ? <Button label="" icon="pi pi-plus" className="p-button-secondary" onClick={() => addLot(rowIndex.rowIndex)} /> : '')} /> */}
                    </DataTable>
                    {!pallet && ParentOrKid == 'Kid' && <div>{times}</div>}
                </Card>
            </Dialog>
        </>
    );
};

export default IssueProduction;

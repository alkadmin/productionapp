"use client";

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
const styles = {

    textSKU: {
        alignItems: "center",
    },
    labelValue: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "var(--primary-color-light)",
        padding: "8px 15px",
        borderRadius: "5px",
        fontSize: "14px",
        fontWeight: "500",
        border: "1px solid var(--surface-border)",
        minHeight: "40px"
    },
    inputContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "var(--primary-color-text)",
        padding: "8px 15px",
        borderRadius: "5px",
        fontSize: "14px",
        fontWeight: "500",
        border: "1px solid var(--surface-border)",
        minHeight: "40px"
    },
    label: {
        fontWeight: "bold",
        fontSize: "14px",
        marginRight: "10px"
    },
    input: {
        width: "60%",
        padding: "5px",
        borderRadius: "5px",
        border: "1px solid var(--surface-border)"
    }
};

const PalletEdit = ({ rowData, visible, onHide,refreshData  }) => {

    const BASE_URL = process.env.NEXT_PUBLIC_API_UR;
    const [formData, setFormData] = useState({
        ID: '',
        PO: '',
        SKU: '',
        ProducDesc: '',
        QTY_PER_PALLET: '',
        LOT: '',
        BEST_BEFORE: '',
        BIN_LOCATION: '',
        LineShift: '',
        DocEntry: '',
        DOCENTRYPARENT: '',
        DATE: '',
        CustomerPO: '',
        TIME: '',
        No_Pallet: '',
        AbsEntry:'',
        WhsCode:''
    });

    const toast = useRef(null);

  const [loading, setLoading] = useState(false);
    console.log(rowData)
    useEffect(() => {
        if (rowData) {
            setFormData({
                ID: rowData.ID || '',
                PO: rowData.PO || '',
                SKU: rowData.SKU || '',
                ProducDesc: rowData.ProducDesc || '',
                QTY_PER_PALLET: rowData["QTY PER PALLET"] || '',
                LOT:  rowData?.NEWBATCH? rowData?.NEWBATCH:rowData.LOT,

               
                BEST_BEFORE: rowData["BEST BEFORE"] || '',
                BIN_LOCATION: rowData["BIN LOCATION"] || '',
                LineShift: rowData.LineShift || '',
                DocEntry: rowData.DocEntry || '',
                DOCENTRYPARENT: rowData.DOCENTRYPARENT || '',
                DATE: rowData.DATE || '',
                CustomerPO: rowData.CustomerPO || '',
                TIME: rowData.TIME || '',
                No_Pallet: rowData["No.Pallet"] || '',
                AbsEntry:rowData.AbsEntry,
                WhsCode:rowData.WhsCode
            });
        }
    }, [rowData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };



    ///interaccion sap
    const handleIssueOrReceipt = async (prevQty, newQty, formData) => {
        const token = localStorage.getItem("Token");
        const qtyDifference = Math.abs(newQty - prevQty);
        if (qtyDifference === 0) return { success: true };
        
        const isReceipt = newQty > prevQty;
        const apiEndpoint = isReceipt ? `${BASE_URL}/Production/PostReceiptFromProduction` : `${BASE_URL}/Inventory/PostGoodIssue`;
    
        const documentPayload = generateIssueOrReceiptPayload(isReceipt, qtyDifference, formData);
        
        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(documentPayload)
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                return { success: false, message: result.Message };
            }
    
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };
    
    
    // const generateIssueOrReceiptPayload = (isReceipt, qtyDifference, formData) => {
    //     const documentLines = [
            
    //             {
    //                 baseEntry: formData.DOCENTRYPARENT, // Entry del documento base
    //                 baseType: 202, // Tipo de documento de producción
    //                 itemCode: formData.SKU,
    //                 quantity: qtyDifference,
    //                 WareHouse: formData.BIN_LOCATION,
    //                 documentLinesBatchNumbers: [
    //                     {
    //                         batchNumber: formData.LOT,
    //                         notes: `Updated ${isReceipt ? "Receipt" : "Issue"} for pallet`,
    //                         quantity: qtyDifference,
    //                     },
    //                 ],

    //                 ...(isReceipt && {
    //                     DocumentLinesBinAllocations: [
    //                         {
    //                             AllowNegativeQuantity: "Y",
    //                             BaseLineNumber: 0,
    //                             BinAbsEntry: formData.AbsEntry,
    //                             Quantity: qtyDifference,
    //                         },
    //                     ],
    //                 }),
    //             },
    //         ];
    //         return {
    //             U_CTS_TURNO: localStorage.getItem("shift"),
    //             U_CTS_PLine: localStorage.getItem("line"),
    //             docDate: new Date().toLocaleDateString(),
    //             docDueDate: new Date().toLocaleDateString(),
    //             documentType: isReceipt ? "ReceiptFromProduction" : "IssueForProduction",
    //             comments: `Source: Portal Production Web to Pallet Update`,
    //             documentLines,
           

    //     };
    // };
    
    //
    
    
    
    
    const generateIssueOrReceiptPayload = (isReceipt, qtyDifference, formData) => {
        const documentLines = [
            {
                itemCode: formData.SKU,
                quantity: qtyDifference,
                wareHouse: formData.WhsCode,
                documentLinesBatchNumbers: [
                    {
                        batchNumber: rowData.LOT,
                        addmisionDate: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
                        expirationDate: formData.BEST_BEFORE, 
                        notes: `Updated ${isReceipt ? "Receipt" : "Issue"} for pallet ${formData.ID}-${formData.No_Pallet}`,
                        quantity: qtyDifference,
                        baseLineNumber: 0
                    },
                ],
    
                ...(isReceipt && {
                    baseEntry: formData.DOCENTRYPARENT, // **Solo en Receipt**
                    baseType: 202, 
                    DocumentLinesBinAllocations: [
                        {
                            AllowNegativeQuantity: "Y",
                            BaseLineNumber: 0,
                            BinAbsEntry: formData.AbsEntry,
                            Quantity: qtyDifference,
                        },
                    ],
                }),
    
                ...(!isReceipt && {
                    documentLinesBinAllocations: [
                        {
                            binAbsEntry: formData.AbsEntry,
                            allowNegativeQuantity: "N",
                            baseLineNumber: 0,
                            quantity: qtyDifference,
                        },
                    ],
                }),
            },
        ];
    
        return {
            docDate: new Date().toISOString().split("T")[0], 
            docDueDate: new Date().toISOString().split("T")[0], 
            comments: `Source: Portal Production Web to Pallet Update ${formData.ID}-${formData.No_Pallet}`,
            U_CTS_TURNO: localStorage.getItem("shift"),
            U_CTS_PLine: localStorage.getItem("line"),
    
            ...(isReceipt && {
                documentType: "ReceiptFromProduction",
                documentLines,
            }),
    
            ...(!isReceipt && {
                U_CTS_Reasons: "Update Pallet",
                documentLines,
            }),
        };
    };
    
    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            const prevQty = rowData["QTY PER PALLET"]; 
            const newQty = parseInt(formData.QTY_PER_PALLET, 10) || 0;
    
            if (prevQty !== newQty) {
                const issueOrReceiptResult = await handleIssueOrReceipt(prevQty, newQty, formData);
                
                if (!issueOrReceiptResult.success) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: issueOrReceiptResult.message, life: 4000 });
                    return;
                }
            }
    
            const updateData = {
                No_Pallet: formData.No_Pallet,
                ID_PALLET: formData.ID,
                PO: formData.PO,
                SKU: formData.SKU,
                LOT: formData.LOT,
                BEST_BEFORE: formData.BEST_BEFORE,
                CASE_PALLET: newQty,
                QTY: parseInt(formData.No_Pallet, 10) || 0,
                PO_DOCENTRY: formData.DocEntry
            };
    

            console.log(updateData)
            const response = await fetch(`/api/UpdatePallet`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData)
            });
    
            const result = await response.json();
            if (response.ok) {
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Pallet updated successfully', life: 3000 });
                onHide();
                refreshData();
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: `Error updating pallet: ${result.message}`, life: 4000 });
            }
        } catch (error) {
            console.error("Error updating pallet:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Unexpected error while updating the pallet', life: 4000 });
        } finally {
            setLoading(false);
        }
    };
    
    
    
    return (
        <>
        <Toast ref={toast} position="top-right" />
    
        <Dialog header={   <span>Edit Pallet: {formData.SKU}  {formData.ProducDesc}</span>}  visible={visible} onHide={onHide} style={{ width: '60vw', maxWidth: '600px' }}>
          
        {loading && (
                                    <div className="p-d-flex p-jc-center p-ai-center" style={{ marginTop: '1rem' }}>
                                        <ProgressSpinner style={{ width: '25px', height: '25px' }} />
                                    </div>
                                )}
            <div className="p-fluid">
              
                {/* 🔹 Información del Pallet (No editable) */}
                <div className="p-grid p-formgrid" style={{ gap: "10px", padding: "10px" }}>

                    {/* <div className="p-col-6" >
                        <span>{formData.SKU}  {formData.ProducDesc}</span>
                     
                    </div> */}
                    <div className="p-col-6" style={styles.labelValue}>


                        <strong>ID:</strong> <span>{formData.ID}</span>
                        <strong>No.Pallet:</strong> <span>{formData.No_Pallet}</span>
                        <strong>Line-Shift:</strong> <span>{formData.LineShift}</span>
                        



                    </div>
                    {/* <div className="p-col-6" style={styles.labelValue}>
                        <strong>PO:</strong> <span>{formData.PO}</span>
                    </div> */}
                    <div className="p-col-6" style={styles.labelValue}>
                        <strong>Customer PO:</strong> <span>{formData.CustomerPO}</span>
                        <strong>PO:</strong> <span>{formData.PO}</span>
                    </div>

                    {/* <div className="p-col-6" style={styles.labelValue}>
                        <strong>Bin Location:</strong> <span>{formData.BIN_LOCATION}</span>
                    </div> */}
                </div>

                {/* 🔹 Campos Editables (Organizados en dos columnas) */}
                <div className="p-grid p-formgrid" style={{ gap: "10px", padding: "10px" }}>
                    <div className="p-col-6" style={styles.inputContainer}>
                        <label style={styles.label}>Quantity Per Pallet:</label>
                        <InputText name="QTY_PER_PALLET" value={formData.QTY_PER_PALLET} onChange={handleInputChange} style={styles.input} />
                    </div>

                    <div className="p-col-6" style={styles.inputContainer}>
                        <label style={styles.label}>Lot:</label>
                        <InputText name="LOT" value={formData.LOT} onChange={handleInputChange} style={styles.input} />
                    </div>

                    <div className="p-col-6" style={styles.inputContainer}>
                        <label style={styles.label}>Best Before:</label>
                        <InputText name="BEST_BEFORE" value={formData.BEST_BEFORE} onChange={handleInputChange} style={styles.input} />
                    </div>



                    <div className="p-col-6" style={styles.inputContainer}>
                        <label style={styles.label}>No. Pallet:</label>
                        <InputText name="No_Pallet" value={formData.No_Pallet} onChange={handleInputChange} style={styles.input} />
                    </div>
                </div>

                {/* 🔹 Botón de Guardar */}
                <div className="p-d-flex p-jc-end p-mt-3">
                    <Button label="Save Changes" icon="pi pi-save" className="p-button-success" disabled={loading}  onClick={() => handleSaveEdit(formData)} />
                </div>
            </div>
        </Dialog>
        </>
    );
};

export default PalletEdit;

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import EditProduction from '../EditProduction/EditProduction'

const Pallets = ({ id, visible, onHide }) => {
    const [palletData, setPalletData] = useState([]);
    const toast = useRef(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditDialogVisible, setEditDialogVisible] = useState(false);

    const API = process.env.API


    const handleEdit = (rowData) => {
        setSelectedRow(rowData);
        setEditDialogVisible(true);
    };

    useEffect(() => {
        if (id && visible) {
            fetchPalletData(id);
        }
    }, [id, visible]);


    const refreshData = () => {
        fetchPalletData(id);
    };

    const fetchPalletData = async (id) => {
        try {
            const response = await fetch(`/api/ProductionPallets?id=${id}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPalletData(data);
            console.log(data)
        } catch (error) {
            console.error('Error fetching pallet data:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error fetching pallet data' });
        }
    };

    const handleView = async (rowData) => {
        try {
            console.log(rowData.ID)
            // Hacer la llamada a la API para imprimir
            const response = await fetch(`/api/ReprintLabel?PalletID=${rowData.ID}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Label printed successfully' });
        } catch (error) {
            console.error('Error printing label:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to print label' });
        }
    };





    const handleDelete = (rowData) => {
        console.log('Delete:', rowData);
        // Implementar lógica para eliminar
    };

    const actionTemplate = (rowData) => {
        const isLastRow = palletData.indexOf(rowData) === palletData.length - 1;
        return (
            <div>
                <Button icon="pi pi-print" className="p-button-rounded p-button-info p-mr-2" onClick={() => handleView(rowData)} />
            </div>
        );
    };

    const edit = (rowData) => {
        const isLastRow = palletData.indexOf(rowData) === palletData.length - 1;
        return (
            <div>
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-warning p-mr-2"
                    onClick={() => handleEdit(rowData)}
                />
            </div>
        );
    };


    const footer = (
        <div className="p-d-flex p-jc-end">
            <Button label="Close" icon="pi pi-times" className="p-button-danger" onClick={onHide} />
        </div>
    );

    return (
        <>
            <EditProduction
                rowData={selectedRow}
                visible={isEditDialogVisible}
                onHide={() => setEditDialogVisible(false)}
                refreshData={refreshData}
            />
            <Toast ref={toast} />
            <Dialog maximizable header="Production Pallets" visible={visible} style={{ width: '90vw' }} footer={footer} onHide={onHide}>
                <DataTable value={palletData} scrollable style={{ 'fontSize': '10px' }} >
                    <Column
                        field="DATE"
                        header="Date"
                        body={(rowData) => {
                            const dateParts = rowData.DATE.split('-'); // Asumiendo que rowData.DATE está en formato 'YYYY-MM-DD'
                            const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`; // 'MM/DD/YYYY'

                            // Asegurarnos de que la hora esté en formato HH:mm con dos dígitos
                            let time = rowData.TIME;
                            let timeParts = time.split(':');

                            // Asegurarnos de que ambas partes de la hora tienen dos dígitos
                            let hours = timeParts[0].padStart(2, '0');
                            let minutes = timeParts[1].padStart(2, '0');
                            let formattedTime = `${hours}:${minutes}`;

                            return `${formattedDate} ${formattedTime}`;
                        }}
                    />


                    <Column field="LineShift" header="Line Shift" />
                    <Column field="CustomerPO" header="Customer PO" />
                    <Column field="SKU" header="SKU" />
                    <Column field="ProducDesc" header="Prod. Description" />
                    <Column field="No.Pallet" header="No. of Pallet" />
                    <Column field="ID" header="No. of Pallet" />

                    <Column field="QTY PER PALLET" header="Cases per pallet" />
                    {/* <Column field="LOT" header="LOT" /> */}

                    <Column
                        field="LOT"
                        header="LOT"
                        body={(rowData) => rowData.NEWBATCH ? rowData.NEWBATCH : rowData.LOT}
                    />

                    <Column
                        field="BEST BEFORE"
                        header="BestBuy"
                        body={(rowData) => {
                            const bestBefore = rowData['BEST BEFORE'];

                            // Validar si 'BEST BEFORE' existe y es una cadena
                            if (typeof bestBefore === 'string' && bestBefore.includes('-')) {
                                const dateParts = bestBefore.split('-'); // Divide solo si contiene '-'
                                if (dateParts.length === 3) {
                                    const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`; // 'MM/DD/YYYY'
                                    return formattedDate;
                                }
                            }

                            // Valor por defecto si no existe o no es válido
                            return "N/A";
                        }}
                    />


                    <Column field="BIN LOCATION" header="Bin Location" />
                    <Column body={actionTemplate} header="Print" />
                    <Column body={edit} header="Edit" />
                </DataTable>
            </Dialog>



        </>
    );
};

export default Pallets;

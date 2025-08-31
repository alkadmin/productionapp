"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import EditProduction from '../EditProduction/EditProduction'
import { useTranslation } from '../../utilities/i18n';

const Pallets = ({ id, visible, onHide }) => {
    const [palletData, setPalletData] = useState([]);
    const toast = useRef(null);
    const { t } = useTranslation();
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
            toast.current.show({ severity: 'error', summary: t('error'), detail: t('pallets.errorFetching') });
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
            toast.current.show({ severity: 'success', summary: t('success'), detail: t('pallets.labelPrinted') });
        } catch (error) {
            console.error('Error printing label:', error);
            toast.current.show({ severity: 'error', summary: t('error'), detail: t('pallets.failedPrintLabel') });
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
            <Button label={t('pallets.close')} icon="pi pi-times" className="p-button-danger" onClick={onHide} />
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
            <Dialog maximizable header={t('pallets.title')} visible={visible} style={{ width: '90vw' }} footer={footer} onHide={onHide}>
                <DataTable value={palletData} scrollable style={{ 'fontSize': '10px' }} >
                    <Column
                        field="DATE"
                        header={t('pallets.date')}
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


                    <Column field="LineShift" header={t('pallets.lineShift')} />
                    <Column field="CustomerPO" header={t('pallets.customerPO')} />
                    <Column field="SKU" header={t('pallets.sku')} />
                    <Column field="ProducDesc" header={t('pallets.productDescription')} />
                    <Column field="No.Pallet" header={t('pallets.noOfPallet')} />
                    <Column field="ID" header={t('pallets.noOfPallet')} />

                    <Column field="QTY PER PALLET" header={t('pallets.casesPerPallet')} />
                    {/* <Column field="LOT" header="LOT" /> */}

                    <Column
                        field="LOT"
                        header={t('pallets.lot')}
                        body={(rowData) => rowData.NEWBATCH ? rowData.NEWBATCH : rowData.LOT}
                    />

                    <Column
                        field="BEST BEFORE"
                        header={t('pallets.bestBefore')}
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
                            return t('pallets.na');
                        }}
                    />


                    <Column field="BIN LOCATION" header={t('pallets.binLocation')} />
                    <Column body={actionTemplate} header={t('pallets.print')} />
                    <Column body={edit} header={t('pallets.edit')} />
                </DataTable>
            </Dialog>



        </>
    );
};

export default Pallets;

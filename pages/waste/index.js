import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { useTranslation } from '../../utilities/i18n';

const GoodsIssue = () => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_UR;
    const [loading, setLoading] = useState(false);
    const [selectedUOM, setSelectedUOM] = useState(''); // Estado para la UOM seleccionada
    const { t } = useTranslation();

    const [reason, setReason] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [binLocation, setBinLocation] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null); // Single batch
    const [details, setDetails] = useState([]);
    const [items, setItems] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [binLocations, setBinLocations] = useState([]);
    const [reasons, setReasons] = useState([]);
    const [batches, setBatches] = useState([]);
    const toast = useRef(null);
    const [uom, setUom] = useState([]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsResponse, warehousesResponse, reasonsResponse] = await Promise.all([
                    axios.get('/api/GetItems'),
                    axios.get('/api/GetWarehouses'),
                    axios.get('/api/GetReasons'),
                ]);
                setItems(
                    itemsResponse.data.map((item) => ({
                        label: item.ItemName,
                        value: item.ItemCode,
                        uom: item.UOM || "", // Unidad de medida
                    }))
                );
                //setItems(itemsResponse.data.map((item) => ({ label: item.ItemName, value: item.ItemCode })));
                setWarehouses(warehousesResponse.data.map((wh) => ({ label: wh.WhsName, value: wh.WhsCode })));
                setReasons(reasonsResponse.data.map((reason) => ({ label: `${reason.Code}`, value: reason.Code })));
            } catch {
                showError(t('waste.errorFetchingData'));
            }
        };

        fetchData();
    }, []);


    const fetchBinLocations = async (warehouse) => {
        if (!warehouse) {
            setBinLocations([]); // Vacía las opciones si no hay almacén
            return;
        }
        try {
            const response = await axios.get(`/api/GetBinLocations`, { params: { warehouse } });
            setBinLocations(response.data.map((bin) => ({ label: bin.BinCode, value: bin.AbsEntry })));
        } catch {
            showError(t('waste.errorFetchingBinLocations'));
            setBinLocations([]); // Evita que las opciones anteriores persistan en caso de error
        }
    };

    const showWarning = (message) => {
        toast.current.show({ severity: 'warn', summary: t('warning'), detail: message, life: 3000 });
    };
    const handleSubmit = async () => {


        if (!reason) { // Validar si Reason está vacío
            showWarning(t('waste.reasonRequired'));
            return; // Detener la ejecución si no hay Reason
        }

        const payload = {
            docDate: new Date().toISOString().split('T')[0],
            docDueDate: new Date().toISOString().split('T')[0],
            comments: remarks || "",
            U_CTS_Reasons: reason || "",
            documentLines: details.map((detail, index) => ({
                itemCode: detail.article,
                quantity: parseFloat(detail.quantity),
                wareHouse: detail.warehouse,
                documentLinesBinAllocations: [
                    {
                        binAbsEntry: detail.binLocation,
                        allowNegativeQuantity: "N",
                        baseLineNumber: 0, // Índice como número de línea base
                        quantity: parseFloat(detail.quantity), // Cantidad del lote asignado
                    },
                ],
                documentLinesBatchNumbers: [
                    {
                        batchNumber: detail.batch,
                        addmisionDate: new Date().toISOString().split('T')[0],
                        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                            .toISOString()
                            .split('T')[0],
                        notes: "Batch for waste testing",
                        quantity: parseFloat(detail.quantity),
                        baseLineNumber: index, // Índice como número de línea base
                    },
                ],
            })),
        };

        console.log("Payload generado:", JSON.stringify(payload, null, 2));

        try {
            setLoading(true);
            const token = localStorage.getItem("Token");
            await axios.post(`${BASE_URL}/Inventory/PostGoodIssue`, payload, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            showSuccess(t('waste.goodIssueCreated'));
            setDetails([]); // Limpia la tabla
            resetFormGeneral();
        }

        catch (error) {
            if (error.response && error.response.data) {
                const message = error.response.data.Message;
                console.error('Mensaje del error:', message);
                showError(message)
            } else {
                console.error('Error desconocido:', error);
            }
        }

        finally {
            setLoading(false);
        }
    };

    const handleDeleteDetail = (index) => {
        // Filtra los detalles para excluir la línea seleccionada
        const updatedDetails = details.filter((_, i) => i !== index);
        setDetails(updatedDetails); // Actualiza el estado con los detalles restantes
        showSuccess(t('waste.itemDeleted'));
    };


    useEffect(() => {
        if (selectedWarehouse) {
            fetchBinLocations(selectedWarehouse); // Actualiza las opciones de bin locations
        } else {
            setBinLocations([]); // Si no hay almacén, limpia el dropdown
        }
    }, [selectedWarehouse]);

    const fetchBatches = async (item, warehouse) => {
        if (item && warehouse) {
            try {
                const response = await axios.get(`/api/LotsByItem`, {
                    params: { item: `'${item}'`, warehouse: `'${warehouse}'` },
                });
                setBatches(
                    response.data.map((batch) => ({
                        label: `${batch.BatchNum} - Qty: ${parseFloat(batch.Quantity).toFixed(2)}`,
                        value: batch.BatchNum,
                    }))
                );
            } catch {
                showError(t('waste.errorFetchingBatches'));
            }
        }
    };

    useEffect(() => {
        if (selectedArticle && selectedWarehouse) fetchBatches(selectedArticle, selectedWarehouse);
    }, [selectedArticle, selectedWarehouse]);

    const handleAddDetail = () => {
        if (!selectedArticle || !quantity || !selectedWarehouse || !binLocation || !selectedBatch) {
            showError(t('waste.requiredFields'));
            return;
        }

        setDetails([
            ...details,
            {
                article: selectedArticle,
                quantity: parseFloat(quantity).toFixed(4),
                warehouse: selectedWarehouse,

                binLocation, // Guarda solo el código para el payload
                binLocationName: binLocations.find((bin) => bin.value === binLocation)?.label || '', // Nombre del bin location
                batch: selectedBatch,
                uom: selectedUOM,
            },
        ]);

        resetForm();
        showSuccess(t('waste.itemAdded'));
    };

    const resetForm = () => {
        setSelectedArticle(null);
        setQuantity('');
        setSelectedWarehouse(null);
        setBinLocation(null);
        setSelectedBatch(null);
    };


    const resetFormGeneral = () => {
        setSelectedArticle(null);
        setQuantity('');
        setSelectedWarehouse(null);
        setBinLocation(null);
        setSelectedBatch(null);
        setReason(null);
        setRemarks('');

    };

    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: t('error'), detail: message, life: 3000 });
    };

    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: t('success'), detail: message, life: 3000 });
    };

    return (
        <div
            style={{
                maxWidth: '1200px',
                margin: '20px auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                background: '#ffffff',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Toast ref={toast} />
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{t('waste.title')}</h2>

            {/* Reason & Remarks */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label>{t('waste.reason')}:</label>
                    <Dropdown
                        value={reason}
                        placeholder={t('waste.selectReason')}
                        options={reasons}
                        onChange={(e) => setReason(e.value)}
                        filter
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label>{t('waste.remarks')}:</label>
                    <InputText
                        value={remarks}
                        placeholder={t('waste.remarksPlaceholder')}
                        onChange={(e) => setRemarks(e.target.value)}
                        style={{ width: '100%', fontSize: '12px' }}
                    />
                </div>
            </div>

            {/* Item Selection */}
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
                <h3 style={{ marginBottom: '20px' }}>{t('waste.itemSelection')}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                    <Dropdown
                        value={selectedArticle}
                        options={items}
                        onChange={(e) => {
                            setSelectedArticle(e.value);
                            const selectedItem = items.find((item) => item.value === e.value);
                            setSelectedUOM(selectedItem ? selectedItem.uom : ""); // Guarda la UOM seleccionada
                        }}
                        placeholder={t('waste.selectItem')}
                        filter
                        style={{ flex: '2 1 200px', minWidth: '150px', maxWidth: '250px' }} 
                    />
                    <Dropdown
                        value={selectedWarehouse}
                        options={warehouses}
                        onChange={(e) => setSelectedWarehouse(e.value)}
                        placeholder={t('waste.warehouse')}
                        style={{ flex: '2 1 200px', minWidth: '150px', maxWidth: '250px' }} 
                    />
                    {/* <Dropdown
                        value={binLocation}
                        options={binLocations}
                       // onChange={(e) => setBinLocation(e.value)}
                       onChange={(e) => {
                        const selectedBin = binLocations.find((bin) => bin.value === e.value);
                        setBinLocation({ value: e.value, label: selectedBin ? selectedBin.label : '' });
                    }}
                        placeholder={t('waste.binLocation')}
                        style={{ flex: 1 }}
                    /> */}
                    <Dropdown
                        value={binLocation} // Mantén solo el valor (código) aquí
                        options={binLocations}
                        onChange={(e) => {
                            setBinLocation(e.value); // Guarda el código en el estado principal
                            const selectedBin = binLocations.find((bin) => bin.value === e.value);
                            setDetails((prevDetails) =>
                                prevDetails.map((detail) =>
                                    detail.binLocation === e.value ? { ...detail, binLocationName: selectedBin.label } : detail
                                )
                            );
                        }}
                        placeholder={t('waste.binLocation')}
                        style={{ flex: '2 1 200px', minWidth: '150px', maxWidth: '250px' }}
                    />


                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <InputText
                            value={quantity}
                            placeholder={t('waste.quantity')}
                            onChange={(e) => setQuantity(e.target.value)}
                            type="number"
                            style={{ flex: 3, fontSize: '12px' }}
                        />
                        <div style={{
                            flex: 1,
                            textAlign: 'center',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '5px',
                            marginLeft: '10px',
                            padding: '8px 5px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        }}>
                            {selectedUOM || t('waste.uom')}
                        </div>
                    </div>
                    <Dropdown
                        value={selectedBatch}
                        options={batches}
                        onChange={(e) => setSelectedBatch(e.value)}
                        placeholder={t('waste.selectBatch')}
                        style={{ flex: '2 1 200px', minWidth: '150px', maxWidth: '250px' }} 
                    />
                    <Button label={t('waste.add')} icon="pi pi-plus" onClick={handleAddDetail} className="p-button-primary" />
                </div>
            </div>

            {/* Details Table */}
            <DataTable value={details} style={{ marginTop: '20px' }}>
                <Column field="article" header={t('waste.item')} />
                <Column field="warehouse" header={t('waste.warehouse')} />
                <Column field="binLocationName" header={t('waste.binLocation')} />
                <Column field="quantity" header={t('waste.quantity')} />
                <Column field="uom" header={t('waste.uom')} />
                <Column field="batch" header={t('waste.batch')} />
                <Column
                    header={t('waste.actions')}
                    body={(rowData, options) => (
                        <Button
                            icon="pi pi-trash"
                            className="p-button-rounded p-button-danger p-button-sm"
                            onClick={() => handleDeleteDetail(options.rowIndex)} // Pasamos el índice de la fila
                            tooltip={t('waste.delete')}
                        />
                    )}
                    style={{ textAlign: 'center', width: '80px' }}
                />
            </DataTable>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <Button label={t('waste.create')} icon="pi pi-check" onClick={handleSubmit} loading={loading} className="p-button-success" />
            </div>
        </div>
    );
};

export default GoodsIssue;

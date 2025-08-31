import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import formatNumber from '../../utilities/formatNumber';
import { useTranslation } from '../../utilities/i18n';

const Mixes = ({ id, visible, onHide, chips }) => {
    const [mixData, setMixData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [batchData, setBatchData] = useState({});
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const toast = useRef(null);
    const { t } = useTranslation();

    console.log(id)
    useEffect(() => {
        if (id && visible) {
            setLoading(true); // Mostrar spinner
            fetchMixData(id);
        }
    }, [id, visible]);

    const fetchMixData = async (id) => {
        try {

          
            const response = await fetch(chips ? `/api/ProductionIssuesChips?id='${id}'` : `/api/ProductionIssues?id=${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            console.log(data)
            if (data.length > 0) {
                const transformedData = data.map((item, index) => {
                    const { DocEntry, CreateDate, DocTime, ...rest } = item;

                    // Formatear la fecha
                    const formattedDate = new Date(CreateDate).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                    });

                    // Formatear la hora
                    const hours = Math.floor(DocTime / 100).toString().padStart(2, '0');
                    const minutes = (DocTime % 100).toString().padStart(2, '0');
                    const formattedTime = `${hours}:${minutes}`;

                    const formattedRest = Object.fromEntries(
                        Object.entries(rest).map(([key, value]) => [
                            key,
                            !isNaN(value) ? formatNumber(parseFloat(value)) : value
                        ])
                    );

                    return { "#": index + 1, CreateDateTime: `${formattedDate} ${formattedTime}`, ...formattedRest, DocEntry };
                });

                const cols = Object.keys(transformedData[0]).map(key => ({
                    field: key,
                    header: key.replace(/([A-Z])/g, ' $1').trim()
                })).filter(col => col.field !== 'DocEntry');

                // Asegurarse de que CreateDateTime esté en la segunda posición
                const createDateTimeCol = cols.find(col => col.field === 'CreateDateTime');
                createDateTimeCol.header = t('issues.dateTime');
                const otherCols = cols.filter(col => col.field !== 'CreateDateTime');
                const orderedCols = [otherCols[0], createDateTimeCol, ...otherCols.slice(1)];

                setColumns(orderedCols);
                setMixData(transformedData);
            } else {
                setMixData([]); // Si no hay datos, establecer mixData como un array vacío
            }
        } catch (error) {
            console.error('Error fetching mix data:', error);
            toast.current.show({ severity: 'error', summary: t('error'), detail: t('issues.errorFetchingData') });
        } finally {
            setLoading(false); // Ocultar spinner
        }
    };

    // const fetchBatchData = async (docEntry) => {
    //     try {
    //         const response = await fetch(`/api/ProductionMixesBatches?id=${docEntry}`);
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         const data = await response.json();
    //         setBatchData(prevState => ({ ...prevState, [docEntry]: data }));
    //     } catch (error) {
    //         console.error(`Error fetching batch data for DocEntry ${docEntry}:`, error);
    //         toast.current.show({ severity: 'error', summary: 'Error', detail: `Error fetching batch data for DocEntry ${docEntry}` });
    //     }
    // };

    const fetchBatchData = async (docEntry) => {
        const rawDocEntry = String(docEntry || '').trim(); // Asegura que siempre sea string
        const entries = rawDocEntry.includes(',') 
            ? rawDocEntry.split(',').map(e => e.trim()) 
            : [rawDocEntry];
    
        console.log(entries);
    
        for (const entry of entries) {
            console.log(entry);
    
            // Verificar si ya fue cargado
            if (!batchData[entry]) {
                try {
                    const response = await fetch(`/api/ProductionMixesBatches?id=${entry}`);
                    if (!response.ok) {
                        throw new Error(`Network response was not ok for DocEntry ${entry}`);
                    }
                    const data = await response.json();
    
                    console.log(data);
                    setBatchData(prevState => ({
                        ...prevState,
                        [entry]: data
                    }));
                } catch (error) {
                    console.error(`Error fetching batch data for DocEntry ${entry}:`, error);
                    toast.current.show({
                        severity: 'error',
                        summary: t('error'),
                        detail: `${t('issues.errorFetchingBatch')} ${entry}`
                    });
                }
            }
        }
    };
    
    
    const onRowExpand = async (e) => {
        const data = e.data;
        const docEntry = data.DocEntry;
        if (docEntry && !batchData[docEntry]) {
            await fetchBatchData(docEntry);

            console.log(batchData)
        }
    };

    const onRowCollapse = (e) => {
        const data = e.data;
        setBatchData(prevState => {
            const newBatchData = { ...prevState };
            delete newBatchData[data.DocEntry];
            return newBatchData;
        });
    };

    const onRowToggle = (e) => {
        setExpandedRows(e.data);
    };

    // const rowExpansionTemplate = (data) => {
    //     const details = batchData[data.DocEntry] || [];
    //     return (
    //         <div>
    //             {details.length > 0 ? (
    //                 details.map((batch, index) => (
    //                     <div key={index} className="p-d-flex p-ai-center p-jc-between">
    //                         {Object.entries(batch).map(([key, value]) => (
    //                             <div key={key} style={{ textAlign: 'center', flex: 1 }}>
    //                                 <strong>{key}:</strong> {value}
    //                             </div>
    //                         ))}
    //                     </div>
    //                 ))
    //             ) : (
    //                 <p>Loading batch data...</p>
    //             )}
    //         </div>
    //     );
    // };


    const rowExpansionTemplate = (data) => {
        // Convertir siempre DocEntry a string para evitar errores
        const rawDocEntry = String(data.DocEntry || '').trim();
    
        // Si incluye coma, se parte en array; si no, se crea array con un solo elemento
        const docEntries = rawDocEntry.includes(',')
            ? rawDocEntry.split(',').map(e => e.trim())
            : [rawDocEntry];
    
        // Buscar datos por cada DocEntry
        const details = docEntries.flatMap(entry => batchData[entry] || []);
    
        return (
            <div>
                {details.length > 0 ? (
                    details.map((batch, index) => (
                        <div
                            key={index}
                            className="p-d-flex p-ai-center p-jc-between"
                            style={{ borderBottom: '1px solid var(--surface-border)', padding: '4px 0' }}
                        >
                            {Object.entries(batch).map(([key, value]) => (
                                <div key={key} style={{ textAlign: 'center', flex: 1 }}>
                                    <strong>{key}:</strong> {value}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>{t('issues.loadingBatchData')}</p>
                )}
            </div>
        );
    };
    
    
    const footer = (
        <div className="p-d-flex p-jc-end">
            <Button label={t('issues.close')} icon="pi pi-times" className="p-button-danger" onClick={() => { setExpandedRows([]); onHide(); }} />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog header={t('issues.title')} maximizable visible={visible} style={{ width: '85vw' }} footer={footer} onHide={() => { setExpandedRows([]); onHide(); }}>
                {loading ? (
                    <div className="p-d-flex p-jc-center p-ai-center" style={{ height: '100px' }}>
                        <ProgressSpinner />
                    </div>
                ) : (
                    <>
                        {mixData.length > 0 ? (
                            <DataTable style={{ fontSize: '10px' }}
                                value={mixData} expandedRows={expandedRows} onRowToggle={onRowToggle} onRowExpand={onRowExpand} onRowCollapse={onRowCollapse} rowExpansionTemplate={rowExpansionTemplate} scrollable >
                                <Column expander style={{ width: '3em' }} />
                                {columns.map(col => (
                                    <Column key={col.field} field={col.field} header={col.header} />
                                ))}
                            </DataTable>
                        ) : (
                            <p>{t('issues.noData')}</p>
                        )}
                    </>
                )}
            </Dialog>
        </>
    );
};

export default Mixes;

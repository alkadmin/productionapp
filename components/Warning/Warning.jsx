"use client";

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useTranslation } from '../../utilities/i18n';
const WarningDialog = ({ visible, onHide, onConfirm, text, loading, setLoading }) => {
    const { t } = useTranslation();
    const footer = (
        <div>
            <Button label={t('warningDialog.cancel')} icon="pi pi-times" className="p-button-danger" onClick={onHide} />
            <Button label={t('warningDialog.ok')} icon="pi pi-check" className="p-button-success" onClick={onConfirm} />
        </div>
    );

    return (
        <Dialog header={t('warningDialog.title')} visible={visible} style={{ width: '30vw' }} footer={footer} onHide={onHide}>
            
            <div className="p-grid p-dir-col">
            {loading && (
                    <div className="p-d-flex p-jc-center p-ai-center" style={{ marginTop: '1rem' }}>
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                    </div>
                )}
                <Message severity="warn" text={text} />
            </div>
        </Dialog>
    );
};

export default WarningDialog;

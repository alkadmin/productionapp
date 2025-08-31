// ✅ components/ProductionInfoModal.js (actualizado)
"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";

import { useRef } from 'react';
import { useTranslation } from '../../utilities/i18n';
const ProductionInfoModal = ({ visible, onHide, onSave, line1, shift1,toastRef }) => {
    const [supervisor, setSupervisor] = useState(null);
    const [mixerOperator, setMixerOperator] = useState(null);
    const [headcount, setHeadcount] = useState("");
    const [line, setLine] = useState(line1);
    const [shift, setShift] = useState(shift1);
    const [prodDate, setProdDate] = useState(new Date());
    const [userOptions, setUserOptions] = useState([]);
    const toast = useRef(null);
    const { t } = useTranslation();
    useEffect(() => {
        setLine(localStorage.getItem('line'));
        setShift(localStorage.getItem('shift'));

        fetch("/api/GetUsersInfo")
            .then(res => res.json())
            .then(data => {
                const options = data.map(user => ({ label: user.Name, value: user.Code }));
                setUserOptions(options);
            });
    }, []);

    const handleSave = async () => {
        const now = new Date();
        const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
        const startTimeFormatted = centralTime.toTimeString().slice(0, 5).replace(':', '');

        const payload = {
          User: localStorage.getItem("username"),
            Line: line,
            Shift: shift,
            Supervisor: supervisor,
            Mixer: mixerOperator,
            HeadCount: headcount,
            StartDate: prodDate.toISOString().slice(0, 10),
            StartTime: parseInt(startTimeFormatted),
         
        };

        console.log(payload);

        try {
            const resp = await fetch(`/api/ProductionSession`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
          
            const data = await resp.json();
          
            console.log("Nuevo código generado:", data.code);
            if (!resp.ok) {
              toastRef.current.show({
                severity: 'error',
                summary: t('productionInfo.error'),
                detail: data.message || t('productionInfo.unknownError'),
                life: 3000
              });
              return;
            }

            toastRef.current.show({
              severity: 'success',
              summary: t('productionInfo.success'),
              detail: t('productionInfo.sessionStartSuccess'),
              life: 3000
            });
          
            localStorage.setItem("sessionCode",data.code)
            localStorage.setItem("productionInfo", JSON.stringify({ ...payload, startTime: centralTime }));
            onSave(payload);
            onHide();
          
          } catch (error) {
            toastRef.current.show({
              severity: 'error',
              summary: t('productionInfo.internalError'),
              detail: error.message,
              life: 3000
            });
            console.error("❌ Request failed:", error);
          }
          
    };

    return (
        <>
       
        <Dialog header={t('productionInfo.title')} visible={visible} style={{ width: '30vw' }} onHide={onHide} modal>
            <div className="p-fluid">
                <label>{t('productionInfo.supervisor')}:</label>
                <Dropdown value={supervisor} options={userOptions} onChange={(e) => setSupervisor(e.value)} placeholder={t('productionInfo.selectSupervisor')} />

                <label>{t('productionInfo.mixerOperator')}:</label>
                <Dropdown value={mixerOperator} options={userOptions} onChange={(e) => setMixerOperator(e.value)} placeholder={t('productionInfo.selectMixer')} />

                <label>{t('productionInfo.headcount')}:</label>
                <InputText value={headcount} onChange={(e) => setHeadcount(e.target.value)} />

                <label>{t('productionInfo.line')}:</label>
                <InputText value={line} disabled />

                <label>{t('productionInfo.shift')}:</label>
                <InputText value={shift} disabled />

                <label>{t('productionInfo.prodDate')}:</label>
                <Calendar value={prodDate} onChange={(e) => setProdDate(e.value)} showIcon />
            </div>
            <br />
            <div className="p-d-flex p-jc-end p-mt-3">
                <Button label={t('productionInfo.cancel')} icon="pi pi-times" onClick={onHide} className="p-button-secondary p-mr-2" />
                <Button label={t('productionInfo.save')} icon="pi pi-check" onClick={handleSave} autoFocus />
            </div>
        </Dialog>
        </>
    );
};

export default ProductionInfoModal;

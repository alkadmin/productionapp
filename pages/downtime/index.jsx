"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { format } from 'date-fns';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';

const DownTime = () => {
  const [data, setData] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [downtimeActive, setDowntimeActive] = useState(false);
  const [downtimeStart, setDowntimeStart] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [type, setType] = useState(null);
  const [cause, setCause] = useState(null);
  const [comments, setComments] = useState("");
  const [actions, setActions] = useState("");
  const [causes, setCauses] = useState([]);
  const [types, setTypes] = useState([]);
  const toast = useRef(null);

  // 🟨 Cargar tipos y causas dinámicamente
  useEffect(() => {
    fetch('/api/GetDownTimeTypes')
      .then(res => res.json())
      .then(data => {
        const list = data.map(item => ({ label: item.Name, value: item.Type }));
        setTypes(list);
      });

    fetch('/api/GetDownTimeReason?type=All')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(item => ({
          label: item.Name,
          value: item.Name
        }));
        setCauses(mapped);
      });
  }, []);

  // 🟨 Contador dinámico
  useEffect(() => {
    let timer;
    if (downtimeActive && downtimeStart) {
      timer = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - downtimeStart) / 1000);
        const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');
        setElapsedTime(`${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [downtimeActive, downtimeStart]);

  // 🟨 Abrir confirmación
  const handleDTAction = () => {
    if (downtimeActive) {
      setShowEndConfirm(true);
    } else {
      setShowConfirm(true);
    }
  };

  useEffect(() => {
    const line = localStorage.getItem('line');
    const shift = localStorage.getItem('shift');
    fetch(`/api/GetDownTimeLogs?line=${line}&shift=${shift}`)
      .then(res => res.json())
      .then(setData);
  }, [downtimeActive]);


  // ✅ CREAR el downtime y luego INICIAR el contador
  const confirmDowntime = async () => {
    setShowConfirm(false);

    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const formattedDate = centralTime.toISOString().slice(0, 10);
    const formattedTime = parseInt(centralTime.toTimeString().slice(0, 5).replace(':', ''));

    const response = await fetch('/api/DownTime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Line: localStorage.getItem('line'),
        Shift: localStorage.getItem('shift'),
        User: localStorage.getItem('username'),
        DateIn: formattedDate,
        TimeIn: formattedTime,
        Session: localStorage.getItem('sessionCode')
      })
    });

    const result = await response.json();
    if (result.code) {
      localStorage.setItem('downtimeCode', result.code);
      localStorage.setItem('downtimeActive', true)
      console.log(result)
      // Ahora SÍ consultamos la info y empezamos el contador
      const infoRes = await fetch(`/api/GetDownTimeInfo?code=${result.code}`);
      const info = await infoRes.json();

      console.log(info)
      const [datePart] = info.DATEIN.split(' ');
      const [year, month, day] = datePart.split('-');
      const hour = Math.floor(info.TIMEIN / 100);
      const minute = info.TIMEIN % 100;
      const composedDate = new Date(year, month - 1, day, hour, minute);

      setDowntimeStart(composedDate);
      setDowntimeActive(true);
      toast.current?.show({ severity: 'success', summary: 'Started', detail: 'Downtime started' });
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not start downtime' });
    }
  };

  // ✅ Terminar downtime → abrir modal de reporte
  const confirmEndDowntime = () => {
    setShowEndConfirm(false);
    setDowntimeActive(false);
    setShowReportModal(true);
  };

  useEffect(() => {
    const dtCode = localStorage.getItem('downtimeCode');
    if (dtCode) {
      fetch(`/api/GetDownTimeInfo?code=${dtCode}`)
        .then(res => res.json())
        .then(info => {
          if (!info.DATEFIN || !info.TIMEFIN) {
            const [datePart] = info.DATEIN.split(' ');
            const [year, month, day] = datePart.split('-');
            const hour = Math.floor(info.TIMEIN / 100);
            const minute = info.TIMEIN % 100;
            const composedDate = new Date(year, month - 1, day, hour, minute);
            setDowntimeStart(composedDate);
            setDowntimeActive(true);
          }
        });
    }
  }, []);
  useEffect(() => {
    if (downtimeActive) {
      document.body.classList.add("dt-active-body");
    } else {
      document.body.classList.remove("dt-active-body");
    }
  }, [downtimeActive]);


  // ✅ Guardar el formulario de reporte
  const saveDowntimeReport = async () => {
    const end = new Date();
    const centralTime = new Date(end.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const formattedDate = centralTime.toISOString().slice(0, 10);
    const formattedTime = parseInt(centralTime.toTimeString().slice(0, 5).replace(':', ''));

    const response = await fetch('/api/DownTime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Code: localStorage.getItem('downtimeCode'),
        DateFin: formattedDate,
        TimeFin: formattedTime,
        Reason: cause,
        Type: type,
        Comments: comments,
        CorrActions: actions
      })
    });

    const result = await response.json();
    if (result.message?.includes('updated')) {
      toast.current?.show({ severity: 'success', summary: 'Completed', detail: 'Downtime updated' });
      setShowReportModal(false);
      localStorage.setItem('downtimeActive', false)
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update downtime' });
    }
  };
  console.log(data)


  useEffect(() => {
    const container = document.querySelector('.layout-wrapper');
    if (!container) return;

    if (downtimeActive) {
      container.classList.add('downtime-active');
    } else {
      container.classList.remove('downtime-active');
    }
  }, [downtimeActive]);

  return (
    <>
      <Toast ref={toast} />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Down Time</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="p-button p-component p-button-danger">Time Lost: {elapsedTime}</div>
            <Button
              label={downtimeActive ? "End Down Time" : "Add New DT"}
              className={downtimeActive ? "p-button-warning" : "p-button-success"}
              onClick={handleDTAction}
            />
          </div>
        </div>

        <DataTable
          value={data}
          stripedRows
          paginator
          rows={10}
          selectionMode="single"
          onRowClick={async (e) => {
            const row = e.data;
console.log(row)
            console.log("first")
            // Solo si ya finalizó
            if (row.endTime) {
              try {
                const response = await fetch(`/api/GetDownTimeInfo?code=${row.Code}`);
                const info = await response.json();
console.log(info)
                setType(info.TYPE || null);
                setCause(info.NAME || null);
                setComments(info.COMMENTS || "");
                setActions(info.CORRACTIONS || "");
                setShowReportModal(true);

              } catch (error) {
                toast.current?.show({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Could not load downtime info'
                });
              }
            }
          }}
        >
          <Column field="Code" header="Code" />
          <Column field="date" header="Date" body={(row) => format(new Date(row.date), 'yyyy-MM-dd')} />
          <Column field="line" header="Line" />
          <Column field="shift" header="Shift" />
          <Column field="startTime" header="Start Time" />
          <Column field="endTime" header="End Time" />
        </DataTable>

      </Card>

      {/* Confirmar inicio */}
      <Dialog header="Alert" visible={showConfirm} modal onHide={() => setShowConfirm(false)}>
        <h3>Confirm Down Time</h3>
        <div className="mt-4 flex justify-content-center gap-2">
          <Button label="Cancel" className="p-button-danger" onClick={() => setShowConfirm(false)} />
          <Button label="OK" className="p-button-success" onClick={confirmDowntime} />
        </div>
      </Dialog>

      {/* Confirmar fin */}
      <Dialog header="Alert" visible={showEndConfirm} modal onHide={() => setShowEndConfirm(false)}>
        <h3>Confirm End Down Time</h3>
        <div className="mt-4 flex justify-content-center gap-2">
          <Button label="Cancel" className="p-button-danger" onClick={() => setShowEndConfirm(false)} />
          <Button label="OK" className="p-button-success" onClick={confirmEndDowntime} />
        </div>
      </Dialog>

      {/* Modal de reporte */}
      <Dialog header="Report Down Time" visible={showReportModal} modal onHide={() => setShowReportModal(false)} style={{ width: '50vw' }}>
        <div className="p-fluid">
          <div className="field">
            <label>Type of Down time:</label>
            <Dropdown value={type} options={types} onChange={(e) => setType(e.value)} placeholder="Select a type" />
          </div>
          <div className="field">
            <label>Cause:</label>
            <Dropdown value={cause} options={causes} onChange={(e) => setCause(e.value)} placeholder="Select a cause" />
          </div>
          <div className="field">
            <label>Additional comments:</label>
            <InputTextarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} />
          </div>
          <div className="field">
            <label>Corrective actions:</label>
            <InputTextarea value={actions} onChange={(e) => setActions(e.target.value)} rows={3} />
          </div>
          <div className="flex justify-content-end gap-2 mt-4">
            <Button label="Cancel" className="p-button-danger" onClick={() => setShowReportModal(false)} />
            <Button label="Save" className="p-button-success" onClick={saveDowntimeReport} />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DownTime;

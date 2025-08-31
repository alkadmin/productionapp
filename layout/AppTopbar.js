"use client";

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LayoutContext } from './context/layoutcontext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import ProductionInfoModal from '../components/ProductionInfoModal/ProductionInfoModal';
import { Toast } from 'primereact/toast';

const AppTopbar = forwardRef((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar, language, setLanguage } = useContext(LayoutContext);
    const router = useRouter();
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const [userData, setUserData] = useState();
    const [line, setLine] = useState(null);
    const [shift, setShift] = useState(null);
    const [username, setUserName] = useState(null);
    const [headcount, setHeadcount] = useState(null);
    const [timer, setTimer] = useState('00:00:00');
    const [modalVisible, setModalVisible] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [infoButton, setInfoButton] = useState("Start Production");
    const toast = useRef(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const [downtimeActive, setDowntimeActive] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const dt = JSON.parse(localStorage.getItem('downtimeActive'));
            setDowntimeActive(!!dt);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        console.log(startTime)
        if (startTime) {
            const interval = setInterval(() => {
                const diff = new Date() - new Date(startTime);
                const hrs = String(Math.floor(diff / 3600000)).padStart(2, '0');
                const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
                const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
                setTimer(`${hrs}:${mins}:${secs}`);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [startTime]);

    const handleStartProduction = async () => {
        if (infoButton === 'End Production') {
            const now = new Date();
            const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
            const formattedDate = centralTime.toISOString().slice(0, 10);
            const formattedTime = parseInt(centralTime.toTimeString().slice(0, 5).replace(':', ''));
    
            try {
                const res = await fetch('/api/ProductionSession', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        Code: localStorage.getItem('sessionCode'),
                        EndDate: formattedDate,
                        EndTime: formattedTime,
                        PauseTime: 0,
                        PauseDate: formattedDate
                    })
                });
    
                const data = await res.json();
    
                if (!res.ok) {
                    console.error("❌ API Error Response:", data);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: data.message || 'Failed to end production'
                    });
                    return;
                }
    
                console.log("✅ Production end response:", data);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Production ended successfully'
                });


                try {
                    const sendRes = await fetch('/api/send-production-report', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sessionId: localStorage.getItem('sessionCode')
                        })
                    });
                
                    const sendData = await sendRes.json();
                    console.log("📧 PDF enviado:", sendData);
                }
                catch{
                    
                }
                setInfoButton("Start Production");
                setStartTime(null);
            } catch (error) {
                console.error("❌ Network/Error exception:", error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Request failed'
                });
            }
        } else {
            setModalVisible(true);
        }
    };
    

    const handleSaveProductionInfo = (info) => {
        setHeadcount(info.HeadCount);
        setStartTime(new Date(info.startTime));
        setInfoButton("End Production")
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLine(localStorage.getItem('line'));
            setShift(localStorage.getItem('shift'));
            setUserName(localStorage.getItem('username'));

            const sessionCode = localStorage.getItem('sessionCode');
            console.log(sessionCode)
            if (sessionCode) {
                fetch(`/api/GetProductionSession?code=${sessionCode}`)
                    .then(res => res.json())
                    .then(data => {
                        console.log(data)
                        setHeadcount(data.HeadCount);
                        const baseTime = data.PauseTime > 0 ? data.PauseTime : data.StartTime;
                        const [fullDate] = data.StartDate.split(' ');
                        const [year, month, day] = fullDate.split('-').map(Number);
                        const hours = Math.floor(baseTime / 100);
                        const minutes = baseTime % 100;
                        const composedDate = new Date(year, month - 1, day, hours, minutes);
                        setStartTime(composedDate);

                        setStartDate(data.StartDate)
                        setInfoButton("End Production");
                    });
            }
        }
    }, [modalVisible]);

    const languageOptions = [
        { label: 'EN', value: 'EN' },
        { label: 'ES', value: 'ES' }
    ];

    const onLanguageChange = (e) => {
        setLanguage(e.value);
        router.push(router.asPath, undefined, { locale: e.value.toLowerCase() });
    };

    return (
        <div className="layout-topbar" >
            <Toast ref={toast} position="top-right" style={{ marginTop: '60px', zIndex: 9999 }} />

            <Link href="/tortillas" className="layout-topbar-logo">
                <div className='logo-img'></div>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}></div>

            <div className="layout-topbar-end">
                {downtimeActive && (
                    <span className="header-item" style={{ color: 'red', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
                    </span>
                )}

                <Button
                    label={infoButton}
                    className={infoButton === "End Production" ? "p-button-danger" : "p-button-success"}
                    onClick={handleStartProduction}
                />
                {startDate && <>
                    <span className="header-item">Prod. Date: {new Date(startDate).toLocaleDateString()}</span>
                    <span className="header-item">Running Time: {timer}</span>
                    <span className="header-item">Headcount: {headcount}</span>
                </>}
                <span className="header-item">{"Line: " + line}</span>
                <span className="header-item">{"Shift: " + shift}</span>
                <span className="header-item">{username}</span>
                <Dropdown value={language} options={languageOptions} onChange={onLanguageChange} className="language-selector" />
                <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button>
            </div>

            <ProductionInfoModal
                visible={modalVisible}
                onHide={() => setModalVisible(false)}
                onSave={handleSaveProductionInfo}
                line1={line}
                shift1={shift}
                toastRef={toast}
            />
        </div>
    );
});

export default AppTopbar;

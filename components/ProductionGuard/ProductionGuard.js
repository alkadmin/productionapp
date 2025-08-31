"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const ProductionGuard = () => {
    const [blocked, setBlocked] = useState(true);
    const pathname = usePathname();

    // Lista de rutas donde se debe aplicar el bloqueo
    const protectedRoutes = ['/', '/tortillas', '/chips', '/variety-pack'];

    useEffect(() => {
        const checkProduction = () => {
            const info = JSON.parse(localStorage.getItem('productionInfo'));
            if (info && info.startTime) {
                setBlocked(false);
            }
        };

        checkProduction();
        const interval = setInterval(checkProduction, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!protectedRoutes.includes(pathname) || !blocked) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '80px',
                left: 0,
                width: '100vw',
                height: 'calc(100vh - 60px)',
                backgroundColor: 'var(--primary-color-hover)',
                color: 'var(--primary-color-text)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                fontSize: '1.5rem',
                pointerEvents: 'auto',
            }}
        >
            <p>Please start production before using the app.</p>
        </div>
    );
};

export default ProductionGuard;

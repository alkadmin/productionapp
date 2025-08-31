import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { LayoutProvider } from '../layout/context/layoutcontext';
import Layout from '../layout/layout';
import { Toast } from 'primereact/toast';
import ProductionGuard from '../components/ProductionGuard/ProductionGuard'; // ✅ Importa aquí
import { I18nProvider } from '../utilities/i18n';

import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export default function MyApp({ Component, pageProps }) {
    const [showChild, setShowChild] = useState(false);
    const [toastShown, setToastShown] = useState(false);
    const router = useRouter();
    const toast = useRef(null);

    useEffect(() => {
        setShowChild(true);

        const username = localStorage.getItem("username");
        const token = localStorage.getItem("Token");
        const tokenExpiration = localStorage.getItem('tokenExpiration');
        const currentTime = Date.now();
        const tolerance = 30 * 60 * 1000;

        if (showChild && !toastShown) {
            if (!username || !token) {
                localStorage.clear();
                router.push('/auth/login');
            } else if (tokenExpiration && currentTime >= (tokenExpiration - tolerance)) {
                localStorage.clear();
                if (toast.current) {
                    toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Your session has expired or is about to expire. Please log in again.', life: 5000 });
                    setToastShown(true);
                }
                router.push('/auth/login');
            }
        }
    }, [router, showChild, toastShown]);

    if (Component.getLayout) {
        if (!showChild) {
            return null;
        }
        return (
            <I18nProvider>
                <LayoutProvider>
                    <Toast ref={toast} position="top-right" />
                    <ProductionGuard /> {/* ✅ Se renderiza aquí */}
                    {Component.getLayout(<Component {...pageProps} />)}
                </LayoutProvider>
            </I18nProvider>
        );
    } else {
        return (
            <I18nProvider>
                <LayoutProvider>
                    <Layout>
                        <Toast ref={toast} position="top-right" />
                        <ProductionGuard /> {/* ✅ También aquí */}
                        {showChild && <Component {...pageProps} />}
                    </Layout>
                </LayoutProvider>
            </I18nProvider>
        );
    }
}

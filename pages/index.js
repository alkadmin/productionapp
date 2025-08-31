import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ProductService } from '../demo/service/ProductService';
import { LayoutContext } from '../layout/context/layoutcontext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Toast } from 'primereact/toast';
import { useTranslation } from '../utilities/i18n';

const Dashboard = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState(null);
    const menu1 = useRef(null);
    const menu2 = useRef(null);
    const [lineOptions, setLineOptions] = useState(null);
    const [logged, setLogged] = useState('');
    const { layoutConfig } = useContext(LayoutContext);

    const toast = useRef(null);
    const router = useRouter();

    const lineData = {
        labels: [
            t('months.january'),
            t('months.february'),
            t('months.march'),
            t('months.april'),
            t('months.may'),
            t('months.june'),
            t('months.july')
        ],
        datasets: [
            {
                label: t('dataset.first'),
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                backgroundColor: '#2f4860',
                borderColor: '#2f4860',
                tension: 0.4
            },
            {
                label: t('dataset.second'),
                data: [28, 48, 40, 19, 86, 27, 90],
                fill: false,
                backgroundColor: '#00bb7e',
                borderColor: '#00bb7e',
                tension: 0.4
            }
        ]
    };

    const applyLightTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
    };

    const applyDarkTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
    };

    useEffect(() => {
        ProductService.getProductsSmall().then((data) => setProducts(data));
    }, []);

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
        
        // if(!localStorage.getItem("username") || localStorage.getItem("Token") ){
        //     router.push('/auth/login');
        // }else{
        //     setLogged(localStorage.getItem("username"));
        // }
        
    }, [layoutConfig.colorScheme]);

    // console.log('en index')
    // useEffect(() => {
    //     const tokenExpiration = localStorage.getItem('tokenExpiration');
    //     const currentTime = Date.now();
    //     const tolerance = 30 * 60 * 1000; // 30 minutos en milisegundos
    
    //     if (!localStorage.getItem("username") || !localStorage.getItem("Token")) {
    //         router.push('/auth/login');
    //     } else if ((tokenExpiration - tolerance)-currentTime<0) {
    //         toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Your session has expired or is about to expire. Please log in again.', life: 5000 });
    //         localStorage.clear();
    //         router.push('/auth/login');
    //     } else {
    //         setLogged(localStorage.getItem("username"));
    //     }
    // }, [router]);
    
    
    

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const logout = () => {
        localStorage.clear();
        router.push('/auth/login');
    };

    return (
        <div className="grid">
            <div className="col-12 ">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <h1>{t('welcome', { name: logged })}</h1>
                    </div>
                    <span className="text-green-500 font-medium">{t('today')} </span>
                    <span className="text-500">{t('isHappy')}</span>

                    <div className="text-blue-500 font-medium mt-5" onClick={() => logout()}>{t('logout')} </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;

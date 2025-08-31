"use client";

import React, { useContext, useState, useEffect } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { useRouter } from 'next/navigation';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();
    const [path, setPath] = useState('');

    useEffect(() => {
        // Recuperar el valor del path desde localStorage
        const storedPath = localStorage.getItem('path');
        if (storedPath) {
            setPath(storedPath);
        }
    }, []); // Esto solo se ejecuta una vez al cargar el componente

    // Definir los items de producción
    const productionItems = [];

    if (path === 'Tortilla' || path === 'All') {
        productionItems.push({ 
            label: 'Tortillas', 
            icon: 'pi pi-fw pi-circle icon-white', 
            command: () => router.push('/tortillas') 
        });
    }

    if (path === 'Chips' || path === 'All') {
        productionItems.push({ 
            label: 'Chips', 
            icon: 'pi pi-caret-right icon-white'
,
            command: () => router.push('/chips') 
        });
    }

            if (path === 'Chips' || path === 'All') {
                productionItems.push({ 
                    label: 'Variety Pack', 
                    icon: 'pi pi-fw pi-box icon-white', 
                    command: () => router.push('/variety-pack') 
                });
            }

            if (path === 'Chips' || path === 'Tortilla'  || path === 'All') {
                productionItems.push({ 
                    label: 'Waste', 
                    icon: 'pi pi-fw pi-trash icon-white', 
                    command: () => router.push('/waste') 
                });
            }


            if ( path === 'All') {
                productionItems.push({ 
                    label: 'DownTime', 
                    icon: 'pi pi-clock pi-fw icon-white', 
                    command: () => router.push('/downtime') 
                });
            }

            if (path === 'Tortilla' || path === 'All'){
                productionItems.push({ 
                    label: 'Report Tortillas', 
                    icon: 'pi pi-file pi-fw icon-white', 
                    command: () => router.push('/report') 
                });
            }
    const model = [

        {
            label: 'Production',
            items: productionItems.length ? productionItems : []
        },
        {
            label: 'Session',
            items: [{ 
                label: 'Log out', 
                icon: 'pi pi-fw pi-sign-out icon-white', 
                command: () => {
                    localStorage.clear();
                    sessionStorage.clear();
                    router.push('/auth/login');
                }
            }]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.separator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;

"use client";

import React, { useContext, useState, useEffect } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../utilities/i18n';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();
    const { t } = useTranslation();
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
            label: t('tortillas'),
            icon: 'pi pi-fw pi-circle icon-white',
            command: () => router.push('/tortillas')
        });
    }

    if (path === 'Chips' || path === 'All') {
        productionItems.push({
            label: t('menu.chips'),
            icon: 'pi pi-caret-right icon-white',
            command: () => router.push('/chips')
        });
    }

            if (path === 'Chips' || path === 'All') {
                productionItems.push({
                    label: t('menu.varietyPack'),
                    icon: 'pi pi-fw pi-box icon-white',
                    command: () => router.push('/variety-pack')
                });
            }

            if (path === 'Chips' || path === 'Tortilla'  || path === 'All') {
                productionItems.push({
                    label: t('menu.waste'),
                    icon: 'pi pi-fw pi-trash icon-white',
                    command: () => router.push('/waste')
                });
            }


            if ( path === 'All') {
                productionItems.push({
                    label: t('menu.downTime'),
                    icon: 'pi pi-clock pi-fw icon-white',
                    command: () => router.push('/downtime')
                });
            }

            if (path === 'Tortilla' || path === 'All'){
                productionItems.push({
                    label: t('menu.reportTortillas'),
                    icon: 'pi pi-file pi-fw icon-white',
                    command: () => router.push('/report')
                });
            }
    const model = [

        {
            label: t('menu.production'),
            items: productionItems.length ? productionItems : []
        },
        {
            label: t('menu.session'),
            items: [{
                label: t('logout'),
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

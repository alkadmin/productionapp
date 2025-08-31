"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppConfig from '../../../layout/AppConfig';

import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoginPage = () => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [shift, setShift] = useState(null);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();
    const BASE_URL = process.env.NEXT_PUBLIC_API_UR;

    useEffect(() => {
        const fetchShifts = async () => {
            try {
                const response = await fetch(`/api/UsersShifts`);
                if (response.ok) {
                    const data = await response.json();
                    setShifts(data.map(shift => ({ label: shift.Code, value: shift.Name })));
                } else {
                    console.error('Failed to fetch shifts');
                }
            } catch (error) {
                console.error('Error fetching shifts:', error);
            }
        };

        fetchShifts();
    }, []); // Empty dependency array ensures this runs only once

    const runLogin = async () => {
        setLoading(true);
        setErrorMessage('');

        const loginData = {
            UserName: email,
            Password: password,
        };

        try {
            // Attempt to log in
            const response = await fetch(`${BASE_URL}/Account/Login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            if (!response.ok) {
                const errorResult = await response.json();
                setErrorMessage(errorResult.message || 'Incorrect username or password');
                return;
            }

            const result = await response.json();
            localStorage.setItem('Token', result.token);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('username', loginData.UserName);

            const decodedToken = JSON.parse(atob(result.token.split('.')[1]));
            const expirationTime = decodedToken.exp * 1000;
            localStorage.setItem('tokenExpiration', expirationTime);

            // Fetch user details
            const responseUser = await fetch(`/api/UserDetails?id=${loginData.UserName}`);
            if (!responseUser.ok) {
                setErrorMessage('User does not have an assigned production type.');
                return;
            }

            const data = await responseUser.json();
            if (data.length === 0 || !data[0]?.path) {
                setErrorMessage('User does not have an assigned production type.');
                return;
            }

            localStorage.setItem('line', data[0]?.LineCode);
            localStorage.setItem('shift', data[0]?.LineShift);
            localStorage.setItem('path', data[0]?.path);

            // Navigate based on user path
            console.log(data[0]?.path)
            // router.push(data[0]?.path === 'Tortilla' ? '/tortillas' : '/chips');
            router.replace(data[0]?.path === 'Tortilla' || data[0]?.path === 'All' ? '/tortillas' : '/chips');

        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <div style={{
                    borderRadius: '26px',
                    padding: '0.2rem',
                    background: 'linear-gradient(180deg, #D71A28 5%, #FFD700 45%, #CFAF50 60%, #ffa133 85%)'

                }}>
                    <div className="w-full surface-card py-5 px-5 sm:px-8" style={{ borderRadius: '25px' }}>
                        <div className="text-center mb-5">
                            <div className='logo-login'></div>
                            Web Production
                        </div>

                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-1">
                                Username
                            </label>
                            <InputText
                                inputid="email1" type="text" placeholder="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full md:w-20rem mb-5" style={{ padding: '0.5rem' }} />
                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-1">
                                Password
                            </label>
                            <Password
                                inputid="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" toggleMask className="w-full mb-5" inputClassName="w-full p-1.5 md:w-20rem"></Password>
                            {/* <label htmlFor="shift" className="block text-900 font-medium text-xl mb-1">
                                Shift
                            </label> */}
                            {/* <Dropdown id="shift"  value={shift} options={shifts} onChange={(e) => setShift(e.value)} placeholder="Select a Shift" className="w-full mb-5" /> */}
                            <div className="flex align-items-center justify-content-between mb-2 gap-5"></div>
                            <Button
                                className="w-full p-3 text-xl mb-2 custom-brown-button"
                                onClick={runLogin}
                                disabled={loading}
                                style={{ background: '#ffa133', borderColor: '#ffa133', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {loading ? (
                                    <>
                                        <ProgressSpinner style={{ width: '20px', height: '20px', marginRight: '8px' }} strokeWidth="8" />
                                        {/* Processing... */}
                                    </>
                                ) : (
                                    'Log In'
                                )}
                            </Button>

                            {errorMessage && (
                                <div className="p-error mb-4">{errorMessage}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

LoginPage.getLayout = function getLayout(page) {
    return (
        <React.Fragment>
            {page}
            {false && <AppConfig simple />}
        </React.Fragment>
    );
};

export default LoginPage;

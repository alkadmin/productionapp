"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.replace('/login'); // Redirigir al login si no hay token
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

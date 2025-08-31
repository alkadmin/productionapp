// src/components/LogoutHandler.js
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

const fetchOpenOrders = async () => {
  // Aquí deberías implementar la lógica para obtener las órdenes abiertas
  // Por ahora, suponemos que retornamos un array de docEntries
  return [
    { docEntry: '122', updateData: { U_CTS_PDate: '2024-07-18', U_CTS_PTime: '1430' } },
    { docEntry: '123', updateData: { U_CTS_PDate: '2024-07-18', U_CTS_PTime: '1445' } },
    // Agrega más órdenes abiertas según sea necesario
  ];
};

const updateOrder = async (order) => {
  const response = await fetch('http://localhost:3000/api/UpdateProductionOrder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });
  if (!response.ok) {
    throw new Error('Error updating order');
  }
  return response.json();
};

const LogoutHandler = () => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      fetchOpenOrders()
        .then((orders) => {
          return Promise.all(orders.map((order) => updateOrder(order)));
        })
        .then(() => {
          console.log('All orders updated successfully');
          router.push('/login');
        })
        .catch((error) => {
          console.error('Error updating orders:', error);
        });
    }
  }, [isAuthenticated, logout, router]);

  return null; // Este componente no renderiza nada
};

export default LogoutHandler;

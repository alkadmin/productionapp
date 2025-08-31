// utils/sessionStorage.js
export const addOrderToSession = (orderNumber) => {
    let orders = JSON.parse(sessionStorage.getItem('ordersInProgress')) || [];
    if (!orders.includes(orderNumber)) {
      orders.push(orderNumber);
      sessionStorage.setItem('ordersInProgress', JSON.stringify(orders));
    }
  };
  
  export const orderExistsInSession = (orderNumber) => {
    let orders = JSON.parse(sessionStorage.getItem('ordersInProgress')) || [];
    return orders.includes(orderNumber);
  };
  
  export const getOrdersFromSession = () => {
    return JSON.parse(sessionStorage.getItem('ordersInProgress')) || [];
  };
  
  export const clearOrdersFromSession = () => {
    sessionStorage.removeItem('ordersInProgress');
  };
  
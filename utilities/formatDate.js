
export const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }
  
    // Asume que el formato de fecha es YYYY-MM-DD
    const dateParts = dateString.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
  
    // Retorna en el formato MM/DD/YYYY
    return `${month}/${day}/${year}`;
  };
  
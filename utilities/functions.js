const combineDateAndTime = (date, time) => {


  

   const timec=String(time).padStart(4, '0');

    if (!(date instanceof Date)) {
      date = new Date(date);
    }
  
    
    const dateStr = date.toISOString().split('T')[0];
  
    const timeStr = timec.toString().padStart(4, '0');
    const hour = parseInt(timeStr.substring(0, 2), 10);
    const minute = timeStr.substring(2, 4);
  
   
    const dateTimeStr = `${dateStr}T${String(hour).padStart(2, '0')}:${minute}:00`;

    const dateTime = new Date(dateTimeStr);
  
    return dateTime;
  };
  
  export default combineDateAndTime;
  
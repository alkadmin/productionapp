const julian = require('julian'); // Importar la librería julian

const getLotNumber = (plantId) => {
    let currentDate = new Date();
    const currentHour = currentDate.getHours(); 

    console.log("Current Hour:", currentHour); 

   
    if (currentHour >= 1 && currentHour < 6) {
        
        currentDate.setDate(currentDate.getDate() - 1);
    }

    
    let jd = julian(currentDate); 
    let startOfYearJulian = julian(new Date(currentDate.getFullYear(), 0, 1)); 
    let julianDay = Math.floor(jd - startOfYearJulian + 1);

    const year = currentDate.getFullYear().toString().slice(-2); 
    const julianDate = julianDay.toString().padStart(3, '0') + year;
    console.log('Julian Date:', julianDate); 

    const lotNumber = `${julianDate}${plantId}`;
    return lotNumber;
};

export default getLotNumber;

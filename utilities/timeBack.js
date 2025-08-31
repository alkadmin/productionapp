function subtractTimeFromCurrent(timeString) {
    // Obtener la fecha y hora actual
    const currentDate = new Date();

    // Dividir la cadena de tiempo en horas, minutos y segundos
    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    // Restar el tiempo de la fecha actual
    currentDate.setHours(currentDate.getHours() - hours);
    currentDate.setMinutes(currentDate.getMinutes() - minutes);
    currentDate.setSeconds(currentDate.getSeconds() - seconds);

    // Devolver la fecha resultante como objeto Date
    return currentDate;
}

export default subtractTimeFromCurrent;

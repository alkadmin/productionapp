// logger.js
import log from 'loglevel';

// Configura el nivel de log (puedes hacerlo dinámicamente)
log.setLevel('info');

/**
 * Agrega un nuevo log utilizando loglevel.
 * @param {Object} event - Información del evento a loguear.
 * @param {string} level - Nivel de log ('info', 'warn', 'error').
 */
export const logEvent = (event, level = 'info') => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        ...event
    };

    switch (level) {
        case 'info':
            log.info(logEntry);
            break;
        case 'warn':
            log.warn(logEntry);
            break;
        case 'error':
            log.error(logEntry);
            break;
        default:
            log.info(logEntry);
    }
};

import hana from '@sap/hana-client';
import dotenv from 'dotenv';

dotenv.config();

const hanaConfig = {
  serverNode: process.env.HANA_SERVER,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
};

console.log(hanaConfig);

export async function getConnection() {
  const conn = hana.createConnection();
  try {
    await new Promise((resolve, reject) => {
      conn.connect(hanaConfig, (err) => {
        if (err) {
          console.error('Connection error', err);
          reject(new Error('Connection error: ' + err.message));
        } else {
          resolve();
        }
      });
    });
    console.log('Connected to SAP HANA');

    // Seleccionar la base de datos específica
    await new Promise((resolve, reject) => {
      conn.exec(`SET SCHEMA ${process.env.HANA_SCHEMA}`, (err) => {
        if (err) {
          console.error('Error selecting database:', err);
          reject(new Error('Error selecting database: ' + err.message));
        } else {
          console.log(`Database ${process.env.HANA_SCHEMA} selected`);
          resolve();
        }
      });
    });

    return conn;
  } catch (error) {
    console.error('Error connecting to SAP HANA:', error);
    throw error;
  }
}

export async function closeConnection(conn) {
  try {
    await new Promise((resolve, reject) => {
      conn.disconnect((err) => {
        if (err) {
          console.error('Error disconnecting from SAP HANA:', err);
          reject(new Error('Error disconnecting from SAP HANA: ' + err.message));
        } else {
          console.log('Disconnected from SAP HANA');
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error disconnecting from SAP HANA:', error);
    throw error;
  }
}

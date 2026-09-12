// backend/utils/databaseDiagnostics.js
const mongoose = require("mongoose");

const getDatabaseState = () => {
  const readyStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const state = mongoose.connection.readyState;
  return {
    stateCode: state,
    stateName: readyStates[state] || state,
    host: mongoose.connection.host || "none",
    dbName: mongoose.connection.name || "none",
    pid: process.pid
  };
};

const measureDatabaseOperation = async (opName, reqId, operationFn) => {
  const pid = process.pid;
  const requestId = reqId || `${pid}-${Date.now()}`;
  console.log(`[DB:${pid}:${requestId}] ${opName} START`);
  const startTime = Date.now();
  try {
    const result = await operationFn();
    const duration = Date.now() - startTime;
    console.log(`[DB:${pid}:${requestId}] ${opName} END duration=${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[DB:${pid}:${requestId}] ${opName} ERROR duration=${duration}ms error=${error.message} (code=${error.code || "N/A"})`);
    throw error;
  }
};

const pingDatabase = async (reqId = null) => {
  const pid = process.pid;
  const requestId = reqId || `${pid}-${Date.now()}`;
  const startTime = Date.now();
  try {
    if (mongoose.connection.readyState !== 1) {
      return { connected: false, duration: Date.now() - startTime, state: getDatabaseState() };
    }
    await mongoose.connection.db.admin().ping();
    const duration = Date.now() - startTime;
    console.log(`[DB:${pid}:${requestId}] ping duration=${duration}ms`);
    return { connected: true, duration, state: getDatabaseState() };
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[DB:${pid}:${requestId}] ping ERROR duration=${duration}ms error=${err.message}`);
    return { connected: false, duration, error: err.message, state: getDatabaseState() };
  }
};

module.exports = {
  getDatabaseState,
  measureDatabaseOperation,
  pingDatabase
};

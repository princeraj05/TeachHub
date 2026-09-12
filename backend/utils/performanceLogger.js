// backend/utils/performanceLogger.js

class PerformanceLogger {
  constructor(moduleName, customReqId = null) {
    this.moduleName = moduleName;
    this.reqId = customReqId || `${process.pid}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.timers = new Map();
    this.durations = new Map();
    this.startTime = Date.now();
    console.log(`[PERF:${this.moduleName}:${this.reqId}] START`);
  }

  start(stepName) {
    this.timers.set(stepName, Date.now());
    console.log(`[PERF:${this.moduleName}:${this.reqId}] ${stepName} START`);
  }

  end(stepName) {
    const start = this.timers.get(stepName);
    if (!start) {
      console.warn(`[PERF:${this.moduleName}:${this.reqId}] ${stepName} ended without being started.`);
      return 0;
    }
    const duration = Date.now() - start;
    this.durations.set(stepName, duration);
    console.log(`[PERF:${this.moduleName}:${this.reqId}] ${stepName} END duration=${duration}ms`);
    return duration;
  }

  summary() {
    const totalDuration = Date.now() - this.startTime;
    console.log(`[PERF:${this.moduleName}:${this.reqId}] TOTAL duration=${totalDuration}ms`);
    return {
      reqId: this.reqId,
      totalDuration,
      steps: Object.fromEntries(this.durations)
    };
  }
}

const createPerformanceLogger = (moduleName, reqId) => new PerformanceLogger(moduleName, reqId);

module.exports = {
  PerformanceLogger,
  createPerformanceLogger
};

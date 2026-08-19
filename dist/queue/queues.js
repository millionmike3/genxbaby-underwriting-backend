"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationQueue = exports.anchoringQueue = exports.underwritingCaseQueue = void 0;
const connection_1 = require("./connection");
exports.underwritingCaseQueue = new connection_1.Queue('underwriting-case', { connection: connection_1.connection });
exports.anchoringQueue = new connection_1.Queue('anchoring', { connection: connection_1.connection });
exports.notificationQueue = new connection_1.Queue('notification', { connection: connection_1.connection });

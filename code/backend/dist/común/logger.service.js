"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
let LoggerService = class LoggerService {
    log(message, context) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [INFO] ${context ? `[${context}] ` : ''}${message}`);
    }
    error(message, stack, context) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] ${context ? `[${context}] ` : ''}${message}`);
        if (stack) {
            console.error(`[${timestamp}] [ERROR] Stack: ${stack}`);
        }
    }
    warn(message, context) {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] [WARN] ${context ? `[${context}] ` : ''}${message}`);
    }
    debug(message, context) {
        const timestamp = new Date().toISOString();
        console.debug(`[${timestamp}] [DEBUG] ${context ? `[${context}] ` : ''}${message}`);
    }
    verbose(message, context) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [VERBOSE] ${context ? `[${context}] ` : ''}${message}`);
    }
    logAuth(action, userId, email, success = true) {
        const level = success ? 'INFO' : 'WARN';
        const message = `Auth ${action}: ${email || userId || 'unknown'} - ${success ? 'SUCCESS' : 'FAILED'}`;
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] [Auth] ${message}`);
    }
    logRequest(method, url, statusCode, responseTime) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [INFO] [HTTP] ${method} ${url} ${statusCode} - ${responseTime}ms`);
    }
    authInfo(message, data, context = 'Auth') {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
        console.log(`[${timestamp}] [INFO] [${context}] ${message}${dataStr}`);
    }
    authError(message, data, error, context = 'Auth') {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
        const errorStr = error ? ` | Error: ${error.message}` : '';
        console.error(`[${timestamp}] [ERROR] [${context}] ${message}${dataStr}${errorStr}`);
        if (error?.stack) {
            console.error(`[${timestamp}] [ERROR] [${context}] Stack: ${error.stack}`);
        }
    }
    authWarn(message, data, context = 'Auth') {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
        console.warn(`[${timestamp}] [WARN] [${context}] ${message}${dataStr}`);
    }
    authDebug(message, data, context = 'Auth') {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
        console.debug(`[${timestamp}] [DEBUG] [${context}] ${message}${dataStr}`);
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)()
], LoggerService);
//# sourceMappingURL=logger.service.js.map
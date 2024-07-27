import { jest, describe, it, expect } from '@jest/globals';
import { LogManager } from './log-manager';

const FILENAME = 'log-manager.js';

describe('LogManager', () => {
    it('should init the manager', async () => {
        return LogManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(LogManager, 'setMap');
        const map = {};

        LogManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(LogManager.getName()).toBe(FILENAME);
    });

    it('should be one item logged from the initAsync', () => {
        const size = LogManager.getSize();
        const item = LogManager.getLog()[0];

        expect(size).toBe(1);
        ['timestamp', 'level', 'origin', 'method', 'value'].forEach((prop) => {
            expect(item).toHaveProperty(prop);
        });
    });

    it('should empty the log', () => {
        const beforeSize = LogManager.getSize();
        expect(beforeSize).toBe(1);
        
        LogManager.clearLog();

        const afterSize = LogManager.getSize();
        expect(afterSize).toBe(0);
    });

    it('should have five log-levels [debug, information, warning, error, fatal]', () => {
        const logLevels = LogManager.getLogLevels();
        expect(logLevels).toHaveProperty('debug');
        expect(logLevels.debug.value).toBe(1);

        expect(logLevels).toHaveProperty('information');
        expect(logLevels.information.value).toBe(2);
        
        expect(logLevels).toHaveProperty('warning');
        expect(logLevels.warning.value).toBe(3);

        expect(logLevels).toHaveProperty('error');
        expect(logLevels.error.value).toBe(4);
        
        expect(logLevels).toHaveProperty('fatal');
        expect(logLevels.fatal.value).toBe(5);
    });

    it('should log to window.console', () => {
        LogManager.clearLog();
        LogManager.setLogToConsole(true);

        const logLevels = LogManager.getLogLevels();
        const spyOnLogMethod = jest.spyOn(logLevels.debug, 'method');
        LogManager.logDebug(FILENAME, 'jest', {});

        const size = LogManager.getSize();
        const item = LogManager.getLog()[0];

        expect(size).toBe(1);
        expect(item.level.value).toBe(1);
        expect(spyOnLogMethod).toHaveBeenCalledTimes(1);
    });

    it('should log a debug item', () => {
        LogManager.clearLog();
        LogManager.logDebug(FILENAME, 'jest', {});
        
        const size = LogManager.getSize();
        const item = LogManager.getLog()[0];

        expect(size).toBe(1);
        expect(item.level.value).toBe(1);
    });

    it('should log a information item', () => {
        LogManager.clearLog();
        LogManager.logInformation(FILENAME, 'jest', {});
        
        const size = LogManager.getSize();
        const item = LogManager.getLog()[0];

        expect(size).toBe(1);
        expect(item.level.value).toBe(2);
    });

    it('should log a warning item', () => {
        LogManager.clearLog();
        LogManager.logWarning(FILENAME, 'jest', {});
        
        const size = LogManager.getSize();
        const item = LogManager.getLog()[0];

        expect(size).toBe(1);
        expect(item.level.value).toBe(3);
    });

    it('should log a error item', () => {
        LogManager.clearLog();
        LogManager.logError(FILENAME, 'jest', {});
        
        const size = LogManager.getSize();
        const item = LogManager.getLog()[0];

        expect(size).toBe(1);
        expect(item.level.value).toBe(4);
    });

    it('should log a fatal item', () => {
        LogManager.clearLog();
        LogManager.logFatal(FILENAME, 'jest', {});
        
        const size = LogManager.getSize();
        const item = LogManager.getLog()[0];

        expect(size).toBe(1);
        expect(item.level.value).toBe(5);
    });
});
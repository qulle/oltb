import { jest, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { LogManager } from '../log-manager/log-manager';
import { ErrorManager } from './error-manager';
import { EventManager } from '../event-manager/event-manager';
import { ElementManager } from '../element-manager/element-manager';

const FILENAME = 'error-manager.js';
const I18N__BASE = 'managers.errorManager';

describe('ErrorManager', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the manager', async () => {
        return ErrorManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(ErrorManager, 'setMap');
        const map = {};

        ErrorManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(ErrorManager.getName()).toBe(FILENAME);
    });

    it('should not catch handled error', () => {
        const spyOnLogFatal = jest.spyOn(LogManager, 'logFatal');

        try {
            throw new Error();
        }catch(error) {
            expect(error).toBeTruthy();
            expect(spyOnLogFatal).not.toHaveBeenCalled();
        }
    });

    it('should catch un-handled error', () => {
        const spyOnWindowConsole = jest.spyOn(window.console, 'error').mockImplementation(() => {});
        const spyOnLogFatal = jest.spyOn(LogManager, 'logFatal');
        const spyOnToastError = jest.spyOn(Toast, 'error');

        EventManager.dispatchEvent([window], 'error');
        
        expect(spyOnWindowConsole).toHaveBeenCalled();
        expect(spyOnLogFatal).toHaveBeenCalled();
        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.uncaughtException`
        });
    });
});
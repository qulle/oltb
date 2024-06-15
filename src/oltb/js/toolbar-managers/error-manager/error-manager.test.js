import { jest, describe, it, expect } from '@jest/globals';
import { LogManager } from '../log-manager/log-manager';
import { ErrorManager } from './error-manager';

const FILENAME = 'error-manager.js';

describe('ErrorManager', () => {
    it('should init the manager', async () => {
        return ErrorManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spy = jest.spyOn(ErrorManager, 'setMap');
        const map = {};

        ErrorManager.setMap(map);
        expect(spy).toHaveBeenCalled();
        expect(ErrorManager.getName()).toBe(FILENAME);
    });

    it('should not catch handled error', () => {
        const spy = jest.spyOn(LogManager, 'logFatal');

        try {
            throw new Error();
        }catch(error) {
            expect(error).toBeTruthy();
            expect(spy).not.toHaveBeenCalled();
        }
    });

    it('should catch un-handled error', () => {
        // TODO:
        // How to spy on the LogManager that is called by the #onError
        // const spy = jest.spyOn(LogManager, 'logFatal');
        // expect(spy).toHaveBeenCalled();

        const wrapper = () => {
            throw new TypeError();
        };

        expect(wrapper).toThrow(TypeError);
    });
});
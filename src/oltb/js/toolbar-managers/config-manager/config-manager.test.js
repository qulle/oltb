import { jest, describe, it, expect } from '@jest/globals';
import axios from 'axios';
import { ConfigManager } from './config-manager';

const FILENAME = 'config-manager.js';

describe('ConfigManager', () => {
    it('should init the manager', async () => {
        jest.spyOn(axios, 'get').mockImplementation(async () => {
            return Promise.resolve({
                status: 200,
                data: '{}'
            });
        });

        return ConfigManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spy = jest.spyOn(ConfigManager, 'setMap');
        const map = {};

        ConfigManager.setMap(map);
        expect(spy).toHaveBeenCalled();
        expect(ConfigManager.getName()).toBe(FILENAME);
    });
});
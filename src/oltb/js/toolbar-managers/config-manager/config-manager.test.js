import { jest, describe, it, expect } from '@jest/globals';
import axios from 'axios';
import { LogManager } from '../log-manager/log-manager';
import { ConfigManager } from './config-manager';

const FILENAME = 'config-manager.js';

describe('ConfigManager', () => {
    it('should init the manager successful load [200 Ok]', async () => {
        const config = {
            localization: {
                languages: []
            }
        };

        jest.spyOn(axios, 'get').mockImplementation(async () => {
            return Promise.resolve({
                status: 200,
                data: JSON.stringify(config)
            });
        });

        return ConfigManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should init the manager failed load [404 Not Found]', async () => {
        const config = {};
        const spy = jest.spyOn(LogManager, 'logWarning');

        jest.spyOn(axios, 'get').mockImplementation(async () => {
            return Promise.resolve({
                status: 404,
                data: JSON.stringify(config)
            });
        });

        return ConfigManager.initAsync({}).then((result) => {
            expect(spy).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: false
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
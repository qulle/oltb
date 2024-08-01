import _ from 'lodash';
import axios from 'axios';
import { jest, beforeEach, describe, it, expect } from '@jest/globals';
import { LogManager } from '../log-manager/log-manager';
import { ConfigManager } from './config-manager';
import { DefaultConfig } from './default-config';

const FILENAME = 'config-manager.js';

describe('ConfigManager', () => {
    beforeEach(() => {
        ConfigManager.clearConfig();
    });

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

        const expectedConfig = _.mergeWith(_.cloneDeep(DefaultConfig), config, (a, b) => {
            if(_.isArray(b)) {
                return b;
            }
            
            return undefined;
        });

        return ConfigManager.initAsync({}).then((result) => {
            expect(ConfigManager.getConfig()).toStrictEqual(expectedConfig);
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should init the manager failed load [404 Not Found]', async () => {
        const config = {};
        const spyOnLogWarning = jest.spyOn(LogManager, 'logWarning');

        jest.spyOn(axios, 'get').mockImplementation(async () => {
            return Promise.resolve({
                status: 404,
                data: JSON.stringify(config)
            });
        });

        return ConfigManager.initAsync({}).then((result) => {
            expect(spyOnLogWarning).toHaveBeenCalledTimes(1);
            expect(ConfigManager.getConfig()).toStrictEqual(DefaultConfig);
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: false
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(ConfigManager, 'setMap');
        const map = {};

        ConfigManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(ConfigManager.getName()).toBe(FILENAME);
    });
});
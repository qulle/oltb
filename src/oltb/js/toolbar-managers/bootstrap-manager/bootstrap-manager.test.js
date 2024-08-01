import { jest, describe, it, expect } from '@jest/globals';
import { BootstrapManager } from './bootstrap-manager';

const FILENAME = 'bootstrap-manager.js';

describe('BootstrapManager', () => {
    it('should init the manager', async () => {
        const items = [{
            manager: {
                initAsync: async () => {},
                setMap: () => {}
            }
        }];

        return BootstrapManager.initAsync(items).then((result) => {
            expect(result).toStrictEqual(void 0);
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(BootstrapManager, 'setMap');
        const map = {};

        BootstrapManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(BootstrapManager.getName()).toBe(FILENAME);
    });

    it('should dispatch global window event [oltb.is.ready]', () => {
        window.addEventListener('oltb.is.ready', (event) => {
            expect(event).toBeTruthy();
        });

        BootstrapManager.ready();
    });
});
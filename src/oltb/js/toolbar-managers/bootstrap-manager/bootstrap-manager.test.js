import { jest, describe, it, expect } from '@jest/globals';
import { BootstrapManager } from './bootstrap-manager';

const FILENAME = 'bootstrap-manager.js';

describe('BootstrapManager', () => {
    it('should init the manager', () => {
        BootstrapManager.initAsync([]).then((result) => {
            expect(result).toStrictEqual(void 0);
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spy = jest.spyOn(BootstrapManager, 'setMap');
        const map = {};

        BootstrapManager.setMap(map);
        expect(spy).toHaveBeenCalled();
        expect(BootstrapManager.getName()).toBe(FILENAME);
    });

    it('should dispatch global window event [oltb.is.ready]', () => {
        window.addEventListener('oltb.is.ready', (event) => {
            expect(event).toBeTruthy();
        });

        BootstrapManager.ready();
    });
});
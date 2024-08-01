import { jest, describe, it, expect } from '@jest/globals';
import { EventManager } from './event-manager';

const FILENAME = 'event-manager.js';

describe('EventManager', () => {
    it('should init the manager', async () => {
        return EventManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(EventManager, 'setMap');
        const map = {};

        EventManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(EventManager.getName()).toBe(FILENAME);
    });

    it('should dispatch normal event for select-element', () => {
        const callbacks = {onChange: () => {}};
        const spyOnOnChange = jest.spyOn(callbacks, 'onChange');
        
        const select = window.document.createElement('select');
        select.addEventListener('change', callbacks.onChange)

        const event = EventManager.dispatchEvent([select], 'change');

        expect(event).toBeTruthy();
        expect(spyOnOnChange).toHaveBeenCalledTimes(1);
    });

    it('should dispatch custom event on the window object', () => {
        const callbacks = {onJest: () => {}};
        const spyOnOnJest = jest.spyOn(callbacks, 'onJest');
        window.addEventListener('oltb.jest', callbacks.onJest);

        const event = EventManager.dispatchCustomEvent([window], 'oltb.jest');

        expect(event).toBeTruthy();
        expect(spyOnOnJest).toHaveBeenCalledTimes(1);
    });
});
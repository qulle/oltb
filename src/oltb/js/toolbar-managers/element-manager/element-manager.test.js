import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { Events } from '../../browser-constants/events';
import { EventManager } from '../event-manager/event-manager';
import { StateManager } from '../state-manager/state-manager';
import { ElementManager } from './element-manager';

const FILENAME = 'element-manager.js';

describe('ElementManager', () => {
    beforeAll(async () => {
        jest.spyOn(window.document, 'getElementById').mockImplementation(() => {
            return window.document.createElement('div');
        });

        await StateManager.initAsync();
    });

    it('should init the manager', async () => {
        return ElementManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
            
            EventManager.dispatchCustomEvent([window], Events.custom.ready);
        });
    });

    it('should init the manager with [light and col in localStorage]', async () => {
        window.localStorage.setItem('oltb', JSON.stringify({
            themeTool: {
                theme: 'light'
            },
            directionTool: {
                direction: 'col'
            }
        }));

        // Note:
        // At this point the StateManager has already been initialized.
        // It need to load the runtime state one more time to fetch the mocked values set above.
        StateManager.loadRuntimeState();

        return ElementManager.initAsync({}).then((result) => {
            expect(ElementManager.getToolbarElement().classList.contains('light')).toBe(false);
            expect(ElementManager.getToolbarElement().classList.contains('dark')).toBe(false);

            expect(ElementManager.getToolbarElement().classList.contains('row')).toBe(false);
            expect(ElementManager.getToolbarElement().classList.contains('col')).toBe(false);

            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should init the manager with [dark and row in localStorage]', async () => {
        window.localStorage.setItem('oltb', JSON.stringify({
            themeTool: {
                theme: 'dark'
            },
            directionTool: {
                direction: 'row'
            }
        }));

        // Note:
        // At this point the StateManager has already been initialized.
        // It need to load the runtime state one more time to fetch the mocked values set above.
        StateManager.loadRuntimeState();

        return ElementManager.initAsync({}).then((result) => {
            expect(ElementManager.getToolbarElement().classList.contains('dark')).toBe(true);
            expect(ElementManager.getToolbarElement().classList.contains('row')).toBe(true);

            expect(window.document.body.classList.contains('oltb-dark')).toBe(true);
            expect(window.document.body.classList.contains('oltb-row')).toBe(true);

            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(ElementManager, 'setMap');
        const map = {};

        ElementManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(ElementManager.getName()).toBe(FILENAME);
    });

    it('should have map-element ref', () => {
        expect(ElementManager.getMapElement()).toBeTruthy();
        expect(ElementManager.getMapElement().nodeName).toBe('DIV');
    });

    it('should have toast-element ref', () => {
        expect(ElementManager.getToastElement()).toBeTruthy();
        expect(ElementManager.getToastElement().nodeName).toBe('DIV');
    });

    it('should have toolbar-element ref', () => {
        expect(ElementManager.getToolbarElement()).toBeTruthy();
        expect(ElementManager.getToolbarElement().nodeName).toBe('DIV');
    });

    it('should have toolbox-element ref', () => {
        expect(ElementManager.getToolboxElement()).toBeTruthy();
        expect(ElementManager.getToolboxElement().nodeName).toBe('DIV');
    });
});
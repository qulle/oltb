import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { Events } from '../../browser-constants/events';
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

            // TODO:
            // Why not using the eventDispatcher?
            window.dispatchEvent(new CustomEvent(Events.custom.ready));
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spy = jest.spyOn(ElementManager, 'setMap');
        const map = {};

        ElementManager.setMap(map);
        expect(spy).toHaveBeenCalled();
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
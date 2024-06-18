import { jest, beforeAll, afterAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { RefreshTool } from './refresh-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'refresh-tool.js';

describe('RefreshTool', () => {
    const original = window.location;

    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { 
                reload: jest.fn() 
            },
        });

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterAll(() => {
        Object.defineProperty(window, 'location', { 
            configurable: true, 
            value: original 
        });
    });

    it('should init the tool', () => {
        const tool = new RefreshTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(RefreshTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should test user callbacks [onInitiated, onClicked]', () => {
        const options = {
            onInitiated: () => {},
            onClicked: () => {}
        };

        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const tool = new RefreshTool(options);

        tool.onClickTool();

        expect(spyOnInitiated).toHaveBeenCalled();
        expect(spyOnClicked).toHaveBeenCalled();
    });
});
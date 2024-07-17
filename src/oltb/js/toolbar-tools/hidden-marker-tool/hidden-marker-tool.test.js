import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { HiddenMarkerTool } from './hidden-marker-tool';
import '../../browser-prototypes/string';

const FILENAME = 'hidden-marker-tool.js';

describe('HiddenMarkerTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new HiddenMarkerTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        toolInstances.forEach((tool) => {
            tool.detachGlobalListeners();
        });
        toolInstances.length = 0;

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = initToolInstance();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(HiddenMarkerTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should show icon-marker-modal and close it', () => {
        const coordinates = [0, 0];
        const tool = initToolInstance();

        // Note:
        // Trigger twice to also let JEST verify the blocking of modal/dialog when truthy
        tool.doShowIconMarkerModal(coordinates);
        tool.doShowIconMarkerModal(coordinates);
        
        expect(tool.iconMarkerModal).toBeTruthy();

        const buttons = tool.iconMarkerModal.getButtons();
        const closeButton = buttons[0];
        closeButton.click();

        expect(tool.iconMarkerModal).toBeFalsy();
    });

    // TODO:
    // Add strictEqual match to what the object that is returned should look like.
    it('should show icon-marker-modal and create marker', () => {
        const coordinates = [0, 0];
        const options = {onAdded: () => {}};
        const spyOnOnAdded = jest.spyOn(options, 'onAdded');
        const tool = initToolInstance(options);

        tool.doShowIconMarkerModal(coordinates);

        const buttons = tool.iconMarkerModal.getButtons();
        const createButton = buttons[1];
        createButton.click();

        expect(spyOnOnAdded).toHaveBeenCalledTimes(1);
    });
});
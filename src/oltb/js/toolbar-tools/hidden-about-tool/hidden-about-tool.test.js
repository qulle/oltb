import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { HiddenAboutTool } from './hidden-about-tool';

const FILENAME = 'hidden-about-tool.js';

describe('HiddenAboutTool', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it('should init the tool', () => {
        const tool = new HiddenAboutTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(HiddenAboutTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should show about-modal', () => {
        const tool = new HiddenAboutTool();

        // Note:
        // Trigger twice to also let JEST verify the blocking of modal/dialog when truthy
        expect(tool.aboutInfoModal).toBeUndefined();
        tool.doShowAboutModal();
        tool.doShowAboutModal();
        expect(tool.aboutInfoModal).not.toBeUndefined();

        const buttons = tool.aboutInfoModal.buttons;
        const closeButton = buttons[0];
        closeButton.click();
        expect(tool.aboutInfoModal).toBeUndefined();
    });
});
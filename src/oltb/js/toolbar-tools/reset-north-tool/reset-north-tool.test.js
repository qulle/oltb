import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ResetNorthTool } from './reset-north-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'reset-north-tool.js';

describe('MagnifyTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the tool', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new ResetNorthTool(options);

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ResetNorthTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(ResetNorthTool.prototype, 'momentaryActivation');

        const tool = new ResetNorthTool(options);
        tool.onClickTool();

        expect(spyMomentary).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });
});
import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ScaleLineTool } from './scale-line-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'scale-line-tool.js';

describe('ScaleLineTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(StateManager, 'getStateObject').mockImplementation(() => {
            return {};
        });
    });

    it('should init the tool', () => {
        // TODO:
        // Not able to make toHaveBeenCalled() working on the ctor options
        const tool = new ScaleLineTool({
            onClicked: () => {
                expect(1).toBe(1);
            },
            onInitiated: () => {
                expect(1).toBe(1);
            }
        });

        expect(tool).toBeTruthy();
        expect(tool.getName()).toBe(FILENAME);

        tool.onClickTool();
    });
});
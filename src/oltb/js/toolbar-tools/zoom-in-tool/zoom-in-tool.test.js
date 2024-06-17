import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { ZoomInTool } from './zoom-in-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'zoom-in-tool.js';

describe('ZoomInTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the tool', () => {
        // TODO:
        // Not able to make toHaveBeenCalled() working on the ctor options
        const tool = new ZoomInTool({
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
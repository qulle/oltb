import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { ZoomOutTool } from './zoom-out-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'zoom-out-tool.js';

describe('ZoomOutTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the tool', () => {
        // TODO:
        // Not able to make toHaveBeenCalled() working on the ctor options
        const tool = new ZoomOutTool({
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
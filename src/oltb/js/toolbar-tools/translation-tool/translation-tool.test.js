import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TranslationTool } from './translation-tool';

const FILENAME = 'translation-tool.js';

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('TranslationTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new TranslationTool(options);

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(TranslationTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(TranslationTool.prototype, 'momentaryActivation');

        const tool = new TranslationTool(options);
        tool.onClickTool();

        expect(spyMomentary).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });
});
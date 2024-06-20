import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import * as jsts from 'jsts/dist/jsts.min';
import { BaseTool } from '../base-tool';
import { ScissorsTool } from './scissors-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'scissors-tool.js';

describe('ScissorsTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(StateManager, 'getStateObject').mockImplementation(() => {
            return {};
        });

        jest.spyOn(StateManager, 'setStateObject').mockImplementation(() => {
            return;
        });
    });

    it('should init the tool', () => {
        const tool = new ScissorsTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ScissorsTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(jsts.io.OL3Parser).toHaveBeenCalled();
    });

    it('should test user callbacks [onInitiated, onClicked]', () => {
        const options = {
            onInitiated: () => {},
            onClicked: () => {}
        };

        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const tool = new ScissorsTool(options);

        tool.onClickTool();

        expect(spyOnInitiated).toHaveBeenCalled();
        expect(spyOnClicked).toHaveBeenCalled();
    });
});
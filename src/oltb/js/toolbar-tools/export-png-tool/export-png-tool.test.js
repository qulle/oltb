import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ExportPngTool } from './export-png-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';

const FILENAME = 'export-png-tool.js';

describe('ExportPngTool', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        window.onkeydown = function() {};
        window.onkeyup = function() {};

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = new ExportPngTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ExportPngTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            filename: 'map-image-export',
            appendTime: false,
            onInitiated: undefined,
            onClicked: undefined,
            onExported: undefined,
            onError: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new ExportPngTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new ExportPngTool(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    // TODO:
    // What to expect?
    it('should re-activate active tool after reload', () => {
        new ExportPngTool();
        eventDispatcher([window], 'oltb.is.ready');
    });
});
import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { MyLocationTool } from './my-location-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'my-location-tool.js';

describe('MagnifyTool', () => {
    beforeAll(() => {
        window.navigator.geolocation = {
            getCurrentPosition: (onSuccess, onError) => {}
        };

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the tool', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new MyLocationTool(options);

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(MyLocationTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(MyLocationTool.prototype, 'momentaryActivation');

        const tool = new MyLocationTool(options);
        tool.onClickTool();

        expect(spyMomentary).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });
});
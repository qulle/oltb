import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { HomeTool } from './home-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'home-tool.js';
const I18N__BASE = 'tools.homeTool';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const mockView = {
    animate: (options) => {},
    cancelAnimations: () => {},
    getAnimating: () => true,
    getZoom: () => 1.234,
    getProjection: () => 'jest',
    getCenter: () => [1.123, 2.456],
    getRotation: () => 1.234
};

const mockMap = {
    addLayer: (layer) => {},
    removeLayer: (layer) => {}, 
    addInteraction: (interaction) => {},
    removeInteraction: (interaction) => {},
    addOverlay: (overlay) => {},
    removeOverlay: (overlay) => {},
    on: (event, callback) => {},
    getView: () => {
        return mockView;
    }
};

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('HomeTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(async () => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(HomeTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });

        await StateManager.initAsync();
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new HomeTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(HomeTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new HomeTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(HomeTool.prototype, 'momentaryActivation');

        const tool = new HomeTool(options);
        tool.onClickTool();

        expect(spyMomentary).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should get zoom', () => {
        const tool = new HomeTool();
        const zoom = tool.getZoom();

        expect(zoom).toBe(3);
    });

    it('should get rotation', () => {
        const tool = new HomeTool();
        const rotation = tool.getRotation();

        expect(rotation).toBe(0);
    });

    it('should get location', () => {
        const tool = new HomeTool();
        const location = tool.getLocation();

        expect(location).toStrictEqual([18.1201, 35.3518]);
    });

    it('should get modified zoom', () => {
        const tool = new HomeTool();
        tool.localStorage.zoom = 4;
        const zoom = tool.getZoom();

        expect(zoom).toBe(4);
    });

    it('should get modified rotation', () => {
        const tool = new HomeTool();
        tool.localStorage.rotation = 1;
        const rotation = tool.getRotation();

        expect(rotation).toBe(1);
    });

    it('should get modified location', () => {
        const tool = new HomeTool();
        tool.localStorage.lon = 20.1234;
        tool.localStorage.lat = 40.5648;

        const location = tool.getLocation();
        expect(location).toStrictEqual([20.1234, 40.5648]);
    });

    it('should create new Home location', () => {
        const tool = new HomeTool();
        tool.localStorage.lon = 20.1234;
        tool.localStorage.lat = 40.5648;

        const location = tool.getLocation();
        expect(location).toStrictEqual([20.1234, 40.5648]);

        const spy = jest.spyOn(Toast, 'success');
        tool.doCreateNewHome([10.123, 20.456]);

        expect(tool.localStorage.lon).toBe(10.123);
        expect(tool.localStorage.lat).toBe(20.456);
        expect(spy).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.setHomeLocation`,
            autoremove: true
        });
    });
});
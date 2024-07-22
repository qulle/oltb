import screenfull from 'screenfull';
import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { MyLocationTool } from './my-location-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'my-location-tool.js';
const I18N__BASE = 'tools.myLocationTool';

describe('MagnifyTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new MyLocationTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(() => {
        window.navigator.geolocation = {
            getCurrentPosition: (onSuccess, onError) => {}
        };
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        toolInstances.forEach((tool) => {
            tool.detachGlobalListeners();
        });
        toolInstances.length = 0;

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = initToolInstance();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(MyLocationTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            title: 'My Location',
            description: 'This is the location that the browser was able to find. It might not be your actual location.',
            enableHighAccuracy: true,
            timeout: 10000,
            markerLabelUseEllipsisAfter: 20,
            markerLabelUseUpperCase: false,
            onInitiated: undefined,
            onClicked: undefined,
            onLocationFound: undefined,
            onError: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool when in fullscreen mode', () => {
        const tool = initToolInstance();
        const spyOnAskToExitFullscreen = jest.spyOn(tool, 'askToExitFullscreen').mockImplementation(() => {
            return;
        });

        screenfull.isFullscreen = true;
        tool.onClickTool();

        expect(spyOnAskToExitFullscreen).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [G]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, 'G');

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        initToolInstance(options);
        simulateKeyPress('keyup', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });

    it('should resolve ask user to exit fullscreen mode', async () => {
        const spyOnExitFullscreen = jest.spyOn(screenfull, 'exit').mockImplementation(() => {
            return Promise.resolve();
        })

        const tool = initToolInstance();
        const spyOnGeoLocationSearch = jest.spyOn(tool, 'doGeoLocationSearch').mockImplementation(() => {
            return;
        });

        const dialog = tool.askToExitFullscreen();
        await dialog.options.onConfirm();

        expect(spyOnExitFullscreen).toHaveBeenCalledTimes(1);
        expect(spyOnGeoLocationSearch).toHaveBeenCalledTimes(1);
    });

    it('should reject ask user to exit fullscreen mode', async () => {
        const spyOnLogError = jest.spyOn(LogManager, 'logError');
        const spyOnToastError = jest.spyOn(Toast, 'error');
        const spyOnExitFullscreen = jest.spyOn(screenfull, 'exit').mockImplementation(() => {
            return Promise.reject();
        })

        const tool = initToolInstance();
        const dialog = tool.askToExitFullscreen();
        await dialog.options.onConfirm();

        expect(spyOnExitFullscreen).toHaveBeenCalledTimes(1);
        expect(spyOnLogError).toHaveBeenCalled();
        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.exitFullscreen`
        });
    });
});
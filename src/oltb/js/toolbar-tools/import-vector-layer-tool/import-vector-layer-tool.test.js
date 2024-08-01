import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import { ImportVectorLayerTool } from './import-vector-layer-tool';

const FILENAME = 'import-vector-layer-tool.js';
const I18N__BASE = 'tools.importVectorLayerTool';

describe('ImportVectorLayerTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new ImportVectorLayerTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
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
        expect(tool).toBeInstanceOf(ImportVectorLayerTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onImported: undefined,
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

    it('should toggle the tool using short-cut-key [O]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, 'O');

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

    it('should ask user to import vector layer but user cancel', () => {
        const tool = initToolInstance();
        const file = 'jest.file';
        const result = {};

        // Note:
        // Trigger twice to also let JEST verify the blocking of modal/dialog when truthy
        expect(tool.importLayerModal).toBeUndefined();
        tool.askToImportLayer(file, result);
        tool.askToImportLayer(file, result);
        expect(tool.importLayerModal).not.toBeUndefined();

        const buttons = tool.importLayerModal.getButtons();
        const cancelButton = buttons[0];
        cancelButton.click();
        expect(tool.importLayerModal).toBeUndefined();
    });

    it('should ask user to import vector layer but abourt due to missing/false file-extension', () => {
        const tool = initToolInstance();
        const spyOnDoImpotLayer = jest.spyOn(tool, 'doImportLayer');

        const spyOnLogError = jest.spyOn(LogManager, 'logError');
        const spyOnToastError = jest.spyOn(Toast,'error');

        const file = 'jest-without-extension';
        const result = {};

        expect(tool.importLayerModal).toBeUndefined();
        tool.askToImportLayer(file, result);
        expect(tool.importLayerModal).not.toBeUndefined();

        const buttons = tool.importLayerModal.getButtons();
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spyOnDoImpotLayer).toHaveBeenCalledTimes(1);
        expect(tool.importLayerModal).toBeUndefined();
        expect(spyOnLogError).toHaveBeenCalled();
        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.unsupportedFormat`,
        });
    });

    it('should ask user to import vector layer but fail to parse', () => {
        const options = {onError: () => {}};
        const spyOnOnError = jest.spyOn(options, 'onError');

        const tool = initToolInstance(options);
        const spyOnDoImpotLayer = jest.spyOn(tool, 'doImportLayer');

        const spyOnLogError = jest.spyOn(LogManager, 'logError');
        const spyOnToastError = jest.spyOn(Toast,'error');

        const file = 'jest.geojson';
        const result = {
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:3857'
        };

        expect(tool.importLayerModal).toBeUndefined();
        tool.askToImportLayer(file, result);
        expect(tool.importLayerModal).not.toBeUndefined();

        const buttons = tool.importLayerModal.getButtons();
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spyOnDoImpotLayer).toHaveBeenCalledTimes(1);
        expect(tool.importLayerModal).toBeUndefined();
        expect(spyOnLogError).toHaveBeenCalled();
        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.importFailed`,
        });
        expect(spyOnOnError).toHaveBeenCalledTimes(1);
    });

    it('should ask user to import vector layer', () => {
        const options = {onImported: () => {}};
        const spyOnOnImported = jest.spyOn(options, 'onImported');

        const tool = initToolInstance(options);
        const spyOnDoImpotLayer = jest.spyOn(tool, 'doImportLayer');

        const mockFileReader = {
            result: `
                {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "id": "1",
                            "type": "Feature",
                            "properties": {
                                "name": "Hartsfield-Jackson Atlanta International Airport",
                                "location": "Atlanta, Georgia",
                                "country": "United States",
                                "totalPassengers": "93,699,630"
                            },
                            "geometry": {
                                "coordinates": [
                                    "-84.428056",
                                    "33.636667"
                                ],
                                "type": "Point"
                            }
                        }
                    ]
                }
            `
        }

        tool.fileReader = mockFileReader;
        const file = 'jest.geojson';
        const result = {
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:3857'
        };

        expect(tool.importLayerModal).toBeUndefined();
        tool.askToImportLayer(file, result);
        expect(tool.importLayerModal).not.toBeUndefined();

        const buttons = tool.importLayerModal.getButtons();
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spyOnDoImpotLayer).toHaveBeenCalledTimes(1);
        expect(tool.importLayerModal).toBeUndefined();
        expect(spyOnOnImported).toHaveBeenCalledTimes(1);
    });
});
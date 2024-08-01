import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TranslationTool } from './translation-tool';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const FILENAME = 'translation-tool.js';

describe('TranslationTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new TranslationTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(async () => {
        await StateManager.initAsync();
        await TranslationManager.initAsync();
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
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
        expect(tool).toBeInstanceOf(TranslationTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined
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

    it('should toggle the tool using short-cut-key [3]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, '3');

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

    it('should change language from en-us to sv-se', async () => {
        const from = 'en-us';
        const to = 'sv-se';

        const spyOnLogInformation = jest.spyOn(LogManager, 'logInformation');
        const spyOnSetActiveLanguage = jest.spyOn(TranslationManager, 'setActiveLanguage');

        const tool = initToolInstance();
        tool.doChangeLanguage({
            from: from,
            to: to
        });

        expect(spyOnLogInformation).toHaveBeenCalledWith(FILENAME, 'doChangeLanguage', {
            from: from,
            to: to
        });

        expect(spyOnSetActiveLanguage).toHaveBeenCalledWith(to);
    });

    it('should ask user to change language but user cancel', () => {
        const tool = initToolInstance();

        // Note:
        // Trigger twice to also let JEST verify the blocking of modal/dialog when truthy
        expect(tool.languageDialog).toBeUndefined();
        tool.askToChangeLanguage();
        tool.askToChangeLanguage();
        expect(tool.languageDialog).not.toBeUndefined();

        const buttons = tool.languageDialog.buttons;
        const cancelButton = buttons[0];
        cancelButton.click();
        expect(tool.languageDialog).toBeUndefined();
    });

    it('should ask user to change language', () => {
        const tool = initToolInstance();
        const spyOnDoChangeLanguage = jest.spyOn(tool, 'doChangeLanguage');

        expect(tool.languageDialog).toBeUndefined();
        tool.askToChangeLanguage();
        expect(tool.languageDialog).not.toBeUndefined();

        const buttons = tool.languageDialog.buttons;
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spyOnDoChangeLanguage).toHaveBeenCalledTimes(1);
        expect(tool.languageDialog).toBeUndefined();
    });
});
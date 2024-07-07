import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TranslationTool } from './translation-tool';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

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

        jest.spyOn(StateManager, 'getStateObject').mockImplementation(() => {
            return {};
        });

        jest.spyOn(StateManager, 'setStateObject').mockImplementation(() => {
            return;
        });
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new TranslationTool();

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
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new TranslationTool(options);

        expect(tool).toBeTruthy();
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

    it('should toggle the tool using short-cut-key [3]', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(TranslationTool.prototype, 'momentaryActivation');

        new TranslationTool(options);
        simulateKeyPress('keyup', window, '3');

        // Note:
        // Since using prototype spy, more have-been-called-results than one first might expect.
        // 5 -> 4 times called by key-binding on window-object and 1 using tool.onClickTool
        expect(spyMomentary).toHaveBeenCalledTimes(5);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spy = jest.spyOn(options, 'onClicked');

        new TranslationTool(options);
        simulateKeyPress('keyup', window, '!');
        expect(spy).not.toHaveBeenCalled();
    });

    it('should change language from en-us to sv-se', async () => {
        const from = 'en-us';
        const to = 'sv-se';

        const spyOnLogInformation = jest.spyOn(LogManager, 'logInformation');
        const spyOnTranslation = jest.spyOn(TranslationManager, 'setActiveLanguage');

        await TranslationManager.initAsync();

        const tool = new TranslationTool();
        tool.doChangeLanguage({
            from: from,
            to: to
        });

        expect(spyOnLogInformation).toHaveBeenCalledWith(FILENAME, 'doChangeLanguage', {
            from: from,
            to: to
        });

        expect(spyOnTranslation).toHaveBeenCalledWith(to);
    });

    it('should ask user to change language but user cancel', () => {
        const tool = new TranslationTool();

        // Note:
        // Trigger twice to also let JEST verify the blocking of languageDialog when truthy
        expect(tool.languageDialog).toBeUndefined();
        tool.askToChangeLanguage();
        tool.askToChangeLanguage();
        expect(tool.languageDialog).not.toBeUndefined();

        const buttons = tool.languageDialog.buttons;
        const cancelButton = buttons[0];
        cancelButton.click();
        expect(tool.languageDialog).toBeUndefined();
    });

    it('should ask user to change language', async () => {
        const tool = new TranslationTool();
        const spy = jest.spyOn(TranslationTool.prototype, 'doChangeLanguage');
        await TranslationManager.initAsync();

        expect(tool.languageDialog).toBeUndefined();
        tool.askToChangeLanguage();
        expect(tool.languageDialog).not.toBeUndefined();

        const buttons = tool.languageDialog.buttons;
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(tool.languageDialog).toBeUndefined();
    });
});
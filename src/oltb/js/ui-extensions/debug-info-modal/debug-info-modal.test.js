import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { StyleManager } from '../../toolbar-managers/style-manager/style-manager';
import { DebugInfoModal } from './debug-info-modal';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import '../../browser-prototypes/json-cycle';

const FILENAME = 'debug-info-modal.js';
const I18N__BASE = 'modalExtensions.debugInfoModal';

class MockResponse {
    constructor() {}
}

describe('DebugInfoModal', () => {
    beforeAll(async () => {
        window.Response = MockResponse;

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(TranslationManager, 'getLanguages').mockImplementation(() => {
            return [];
        });

        await StyleManager.initAsync();
    });

    afterEach(() => {
        jest.reset
    });

    it('should create modal-extension', () => {
        const modal = new DebugInfoModal({
            title: 'jest'
        });

        expect(modal).toBeTruthy();
        expect(modal.getName()).toBe(FILENAME);
        expect(modal.getTitle()).toBe('jest');
    });

    it('should log map to console', () => {
        const spyOnConsole = jest.spyOn(window.console, 'dir');
        const spyOnToast = jest.spyOn(Toast, 'info');

        const modal = new DebugInfoModal();
        modal.doActionLoggingMap();

        expect(spyOnConsole).toHaveBeenCalled();
        expect(spyOnToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.logMapObject`,
            autoremove: true
        });
    });

    it('should generate UUID', () => {
        const spyOnLogger = jest.spyOn(LogManager, 'logInformation');
        const spyOnDom = jest.spyOn(DOM, 'prependChildren');
        const spyOnCreateElement = jest.spyOn(window.document, 'getElementById').mockImplementation(() => {
            return window.document.createElement('div');
        });

        const modal = new DebugInfoModal();
        modal.doActionGenerateUUID();

        expect(spyOnLogger).toHaveBeenCalled();
        expect(spyOnDom).toHaveBeenCalled();
        expect(spyOnCreateElement).toHaveBeenCalled();
    });

    it('should resolve copy event-log', async () => {
        const spyOnToast = jest.spyOn(Toast, 'info');
        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.resolve();
        });

        const modal = new DebugInfoModal();
        await modal.doActionCopyEventLogAsync();

        expect(spyOnToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.copyEventLog`,
            autoremove: true
        });
    });
    
    it('should reject copy event-log', async () => {
        const spyOnToast = jest.spyOn(Toast, 'error');
        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.reject();
        });

        const modal = new DebugInfoModal();
        await modal.doActionCopyEventLogAsync();

        expect(spyOnToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.copyEventLog`,
        });
    });

    it('should clear style-manager-buffer', async () => {
        const spyOnToast = jest.spyOn(Toast, 'info');
        const modal = new DebugInfoModal();
        const result = modal.doActionClearStyleManager();

        expect(result).toStrictEqual([0, 0]);
        expect(spyOnToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.clearStyleManager`,
            autoremove: true
        });
    });
});
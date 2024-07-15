import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { ElementManager } from '../element-manager/element-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { copyMarkerInfoAsync } from './copy-marker-info';

const I18N__BASE = 'managers.infoWindowManager';

describe('copyMarkerInfo', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should resolve copy marker-coordinates', async () => {
        const manager = {};
        const data = 'Jest maker info';
        const spyToast = jest.spyOn(Toast, 'info');

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.resolve();
        });

        await copyMarkerInfoAsync(manager, data);

        expect(spyToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.copyMarkerInfo`,
            autoremove: true
        });
    });

    it('should reject copy marker-coordinates', async () => {
        const manager = {};
        const data = 'Jest maker info';
        const spyToast = jest.spyOn(Toast, 'error');

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.reject();
        });
        
        await copyMarkerInfoAsync(manager, data);

        expect(spyToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.copyMarkerInfo`
        });
    });
});
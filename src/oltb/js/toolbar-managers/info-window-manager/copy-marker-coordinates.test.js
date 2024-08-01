import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { LogManager } from '../log-manager/log-manager';
import { ElementManager } from '../element-manager/element-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { copyMarkerCoordinatesAsync } from './copy-marker-coordinates';

const I18N__BASE = 'managers.infoWindowManager';

describe('copyMarkerCoordinatesAsync', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should resolve copy marker-coordinates', async () => {
        const manager = {};
        const data = {lon: 12.34, lat: 43.21};
        const spyToast = jest.spyOn(Toast, 'info');

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return  Promise.resolve();
        });

        await copyMarkerCoordinatesAsync(manager, data);

        expect(spyToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.copyMarkerCoordinates`,
            autoremove: true
        });
    });

    it('should reject copy marker-coordinates', async () => {
        const manager = {};
        const data = {lon: 12.34, lat: 43.21};
        const spyToast = jest.spyOn(Toast, 'error');
        const spyLogManager = jest.spyOn(LogManager, 'logError');

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return  Promise.reject();
        });
        
        await copyMarkerCoordinatesAsync(manager, data);

        expect(spyLogManager).toHaveBeenCalledTimes(1);
        expect(spyToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.copyMarkerCoordinates`
        });
    });
});
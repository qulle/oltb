import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from './toast';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('Toast', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create a information-toast', () => {
        const toast = Toast.info({});
        expect(toast).toBeTruthy();
        expect(toast.getType()).toBe('info');
    });

    it('should create a warning-toast', () => {
        const toast = Toast.warning({});
        expect(toast).toBeTruthy();
        expect(toast.getType()).toBe('warning');
    });

    it('should create a error-toast', () => {
        const toast = Toast.error({});
        expect(toast).toBeTruthy();
        expect(toast.getType()).toBe('error');
    });

    it('should create a success-toast', () => {
        const toast = Toast.success({});
        expect(toast).toBeTruthy();
        expect(toast.getType()).toBe('success');
    });
});

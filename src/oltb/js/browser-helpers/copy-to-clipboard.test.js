import { jest, describe, it, expect } from '@jest/globals';
import { DOM } from './dom-factory';
import { copyToClipboard } from './copy-to-clipboard';

describe('copyToClipboard', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(DOM, 'createElement').mockImplementation(() => ({
            select: jest.fn(),
            remove: jest.fn(),
        }));
    });

    it('should use clipboard API when available and secure context', async () => {
        const writeTextMock = jest.fn().mockResolvedValue(undefined);

        Object.assign(window.navigator, {
            clipboard: {
                writeText: writeTextMock
            }
        });
        Object.assign(window, {
            isSecureContext: true
        });

        await copyToClipboard.copyAsync('  test  ');

        expect(writeTextMock).toHaveBeenCalledWith('test');
        expect(DOM.createElement).not.toHaveBeenCalled();
    });

    it('should fall back to execCommand when clipboard API is not available', async () => {
        delete window.navigator.clipboard;
        Object.assign(window, {
            isSecureContext: false
        });

        const mockTextArea = {
            select: jest.fn(),
            remove: jest.fn()
        };

        DOM.createElement.mockReturnValue(mockTextArea);
        document.execCommand = jest.fn().mockReturnValue(false);

        await copyToClipboard.copyAsync('  test  ');
        
        expect(mockTextArea.select).toHaveBeenCalled();
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(mockTextArea.remove).toHaveBeenCalled();
        expect(DOM.createElement).toHaveBeenCalledWith({
            element: 'textarea',
            value: 'test',
            style: {
                'position': 'absolute',
                'left': '-999999px',
                'opacity': 0
            }
        });
    });

    it('should handle case when execCommand throws an error', async () => {
        delete window.navigator.clipboard;
        Object.assign(window, {
            isSecureContext: false
        });

        const mockTextArea = {
            select: jest.fn(),
            remove: jest.fn()
        };

        DOM.createElement.mockReturnValue(mockTextArea);
        document.execCommand = jest.fn(() => {
            throw new Error('execCommand failed');
        });

        await expect(copyToClipboard.copyAsync('  test  ')).rejects.toThrow();

        expect(mockTextArea.select).toHaveBeenCalled();
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(mockTextArea.remove).toHaveBeenCalled();
        expect(DOM.createElement).toHaveBeenCalledWith({
            element: 'textarea',
            value: 'test',
            style: {
                'position': 'absolute',
                'left': '-999999px',
                'opacity': 0
            }
        });
    });
});
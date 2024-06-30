import { jest, describe, it, expect } from '@jest/globals';
import { DOM } from './dom-factory';
import { LogManager } from '../toolbar-managers/log-manager/log-manager';
import { downloadFile } from './download-file';

describe('downloadFile', () => {
    let spyLogDebug;
    let spyCreateElement;
    let mockSetAttribute;
    let mockClick;

    beforeEach(() => {
        jest.clearAllMocks();

        spyLogDebug = jest.spyOn(LogManager, 'logDebug').mockImplementation(jest.fn());
        mockSetAttribute = jest.fn();
        mockClick = jest.fn();
        spyCreateElement = jest.spyOn(DOM, 'createElement').mockImplementation(() => ({
            setAttribute: mockSetAttribute,
            click: mockClick,
        }));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should download an image file correctly', () => {
        const name = 'test.jpg';
        const content = 'image-content';

        downloadFile(name, content);

        expect(spyLogDebug).toHaveBeenCalledWith('download-file.js', 'downloadFile', name);
        expect(spyCreateElement).toHaveBeenCalledWith({
            element: 'a',
            attributes: {
                'download': name
            }
        });
        expect(mockSetAttribute).toHaveBeenCalledWith('href', content);
        expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('should download a non-image file correctly', () => {
        const name = 'test.txt';
        const content = 'plain-text-content';

        downloadFile(name, content);

        expect(spyLogDebug).toHaveBeenCalledWith('download-file.js', 'downloadFile', name);
        expect(spyCreateElement).toHaveBeenCalledWith({
            element: 'a',
            attributes: {
                'download': name
            }
        });
        expect(mockSetAttribute).toHaveBeenCalledWith('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
        expect(mockClick).toHaveBeenCalledTimes(1);
    });
});
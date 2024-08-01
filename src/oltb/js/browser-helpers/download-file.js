import { DOM } from './dom-factory';
import { LogManager } from '../toolbar-managers/log-manager/log-manager';

const FILENAME = 'download-file.js';

const isImage = function(name) {
    return name.split('.').pop().match(/jpg|jpeg|png|gif|svg/i) !== null;
}

const downloadFile = function(name, content) {
    LogManager.logDebug(FILENAME, 'downloadFile', name);

    const downloadTrigger = DOM.createElement({
        element: 'a', 
        attributes: {
            'download': name
        }
    });

    const data = isImage(name)
        ? content
        : `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

    downloadTrigger.setAttribute('href', data);
    downloadTrigger.click();
}

export { downloadFile };
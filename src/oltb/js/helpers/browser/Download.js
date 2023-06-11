import { DOM } from '../../helpers/browser/DOM';
import { LogManager } from '../../core/managers/LogManager';

const FILENAME = 'browser/Download.js';

const download = function(name, content) {
    LogManager.logDebug(FILENAME, 'download', name);

    const downloadTrigger = DOM.createElement({
        element: 'a', 
        attributes: {
            download: name
        }
    });

    const data = isImage(name)
        ? content
        : `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

    downloadTrigger.setAttribute('href', data);
    downloadTrigger.click();
}

const isImage = function(name) {
    return name.split('.').pop().match(/jpg|jpeg|png|gif|svg/i) !== null;
}

export { download, isImage };
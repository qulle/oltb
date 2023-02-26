import { DOM } from '../../helpers/browser/DOM';

const FILENAME = 'browser/Download.js';

const download = function(filename, content) {
    const downloadTrigger = DOM.createElement({
        element: 'a', 
        style: 'display: none;',
        attributes: {
            download: filename
        }
    });

    downloadTrigger.setAttribute('href', isImage()
        ? content
        : `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
    );
    
    downloadTrigger.click();
}

const isImage = function(filename) {
    return filename.split('.').pop().match(/jpg|jpeg|png|gif|svg/i) !== null;
}

export { download, isImage };
import { DOM } from '../../helpers/browser/DOM';

const download = function(filename, content) {
    const downloadTrigger = DOM.createElement({
        element: 'a', 
        style: 'display: none;',
        attributes: {
            download: filename
        }
    });
    
    if(isImage(filename)) {
        downloadTrigger.setAttribute('href', content);
    }else {
        downloadTrigger.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    }
    
    downloadTrigger.click();
}

const isImage = function(filename) {
    return filename.split('.').pop().match(/jpg|jpeg|png|gif|svg/i) !== null;
}

export { download, isImage };
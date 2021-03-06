const download = function(filename, content) {
    const element = document.createElement('a');
    if(isImage(filename)) {
        element.setAttribute('href', content);
    }else {
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    }
    
    element.style.display = 'none';
    element.setAttribute('download', filename);
    
    document.body.appendChild(element);
    element.click();
    
    document.body.removeChild(element);
}

const isImage = function(filename) {
    return filename.split('.').pop().match(/jpg|jpeg|png|gif|svg/i) !== null;
}

export { download };
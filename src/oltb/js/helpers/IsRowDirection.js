const FILENAME = 'helpers/IsRowDirection.js';

const isHorizontal = function() {
    return document.body.classList.contains('oltb-row');
}

export { isHorizontal };
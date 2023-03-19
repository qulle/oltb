const FILENAME = 'helpers/IsDarkTheme.js';

const isDarkTheme = function() {
    return document.body.classList.contains('oltb-dark');
}

export { isDarkTheme };
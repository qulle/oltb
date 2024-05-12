import { ConfigManager } from '../managers/ConfigManager';

const isDarkTheme = function() {
    return window.document.body.classList.contains(ConfigManager.getConfig().className.dark);
}

export { isDarkTheme };
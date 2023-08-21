import { ConfigManager } from '../core/managers/ConfigManager';

const isDarkTheme = function() {
    return document.body.classList.contains(ConfigManager.getConfig().className.dark);
}

export { isDarkTheme };
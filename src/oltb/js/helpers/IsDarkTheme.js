import { ConfigManager } from '../managers/ConfigManager';

const isDarkTheme = function() {
    return document.body.classList.contains(ConfigManager.getConfig().className.dark);
}

export { isDarkTheme };
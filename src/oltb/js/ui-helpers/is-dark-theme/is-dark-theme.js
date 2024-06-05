import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';

const isDarkTheme = function() {
    return window.document.body.classList.contains(ConfigManager.getConfig().className.dark);
}

export { isDarkTheme };
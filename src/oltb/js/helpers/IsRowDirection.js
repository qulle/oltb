import { ConfigManager } from '../managers/ConfigManager';

const isHorizontal = function() {
    return document.body.classList.contains(ConfigManager.getConfig().className.row);
}

export { isHorizontal };
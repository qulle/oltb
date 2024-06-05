import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';

const isHorizontal = function() {
    return window.document.body.classList.contains(ConfigManager.getConfig().className.row);
}

export { isHorizontal };
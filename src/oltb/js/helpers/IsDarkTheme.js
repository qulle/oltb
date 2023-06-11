import { Config } from "../core/Config";

const isDarkTheme = function() {
    return document.body.classList.contains(Config.classNames.dark);
}

export { isDarkTheme };
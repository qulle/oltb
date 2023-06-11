import { Config } from "../core/Config";

const isHorizontal = function() {
    return document.body.classList.contains(Config.classNames.row);
}

export { isHorizontal };
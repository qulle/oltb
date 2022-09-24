import Toast from '../common/Toast';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { ShortcutKeys } from '../helpers/Constants/ShortcutKeys';

const DEFAULT_OPTIONS = {
    url: 'https://github.com/qulle/oltb',
    target: '_blank'
};

class Help extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Help,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Help (${ShortcutKeys.Help})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, ShortcutKeys.Help)) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
        try {
            window.open(this.options.url, this.options.target).focus();
        }catch(error) {
            console.error(`Error opening Help [${error}]`);
            Toast.info({text: 'Action was blocked by browser, try open with mouse'});
        }
    }
}

export default Help;
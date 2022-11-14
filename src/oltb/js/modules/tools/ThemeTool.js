import StateManager from '../core/managers/StateManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { isDarkTheme } from '../helpers/IsDarkTheme';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';

const LOCAL_STORAGE_NODE_NAME = 'theme';

const DEFAULT_OPTIONS = {};

class ThemeTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        this.lightThemeIcon = getIcon({
            path: SVG_PATHS.LightOn,
            class: 'oltb-tool-button__icon'
        });

        this.darkThemeIcon = getIcon({
            path: SVG_PATHS.LightOff,
            class: 'oltb-tool-button__icon'
        });
        
        const button = DOM.createElement({
            element: 'button',
            html: isDarkTheme() ? this.lightThemeIcon : this.darkThemeIcon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': (isDarkTheme() ? 'Light theme' : 'Dark theme') + ` (${SHORTCUT_KEYS.ToolbarTheme})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowClearTheme.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ToolbarTheme)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        // Note: User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        let theme = 'light';
        
        if(isDarkTheme()) {
            this.onWindowClearTheme();
        }else {
            theme = 'dark';

            StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, 'dark');
            TOOLBAR_ELEMENT.classList.add('dark');
            document.body.classList.add('oltb-dark');

            // Update toolbar icon
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.lightThemeIcon);
            this.button._tippy.setContent(`Light theme (${SHORTCUT_KEYS.ToolbarTheme})`);
        }

        // Note: User defined callback from constructor
        if(typeof this.options.changed === 'function') {
            this.options.changed(theme);
        }
    }

    onWindowClearTheme() {
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, 'light');
        TOOLBAR_ELEMENT.classList.remove('dark');
        document.body.classList.remove('oltb-dark');

        // Update toolbar icon
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', this.darkThemeIcon);
        this.button._tippy.setContent(`Dark theme (${SHORTCUT_KEYS.ToolbarTheme})`);
    }
}

export default ThemeTool;
import { DOM } from '../helpers/browser/DOM';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { isDarkTheme } from '../helpers/IsDarkTheme';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';

const FILENAME = 'tools/ThemeTool.js';
const DEFAULT_OPTIONS = Object.freeze({
    click: undefined,
    changed: undefined
});

const THEMES_DATA = Object.freeze({
    light: Object.freeze({
        class: 'light',
        tippyContent: 'Light theme',
        icon: getIcon({
            path: SVG_PATHS.Sun.Stroked,
            class: 'oltb-tool-button__icon'
        })
    }),
    dark: Object.freeze({
        class: 'dark',
        tippyContent: 'Dark theme',
        icon: getIcon({
            path: SVG_PATHS.MoonStars.Stroked,
            class: 'oltb-tool-button__icon'
        })
    })
});

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.ThemeTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    theme: THEMES_DATA.light.class
});

class ThemeTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });

        const button = DOM.createElement({
            element: 'button',
            html: isDarkTheme() 
                ? THEMES_DATA.light.icon
                : THEMES_DATA.dark.icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `${(
                    isDarkTheme() 
                        ? THEMES_DATA.light.tippyContent 
                        : THEMES_DATA.dark.tippyContent
                )} (${SHORTCUT_KEYS.ToolbarTheme})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ToolbarTheme)) {
            this.handleClick(event);
        }
    }

    onWindowSettingsCleared() {
        const active = this.getActiveTheme();
        this.swithThemeFromTo(active, THEMES_DATA.light);
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        this.toggleTheme();

        // User defined callback from constructor
        if(typeof this.options.changed === 'function') {
            const active = this.getActiveTheme();
            this.options.changed(active.class);
        }
    }

    toggleTheme() {
        const active = this.getActiveTheme();
        const inActive = this.getInActiveThem();

        this.swithThemeFromTo(active, inActive);
    }

    swithThemeFromTo(from, to) {
        this.localStorage.theme = to.class;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);

        const toolbarElement = ElementManager.getToolbarElement();

        toolbarElement.classList.remove(from.class);
        document.body.classList.remove(`oltb-${from.class}`);

        toolbarElement.classList.add(to.class);
        document.body.classList.add(`oltb-${to.class}`);

        // Update toolbar button
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', from.icon);
        this.button._tippy.setContent(`${from.tippyContent} (${SHORTCUT_KEYS.ToolbarTheme})`);
    }

    getInActiveThem() {
        return isDarkTheme()
            ? THEMES_DATA.light
            : THEMES_DATA.dark;
    }

    getActiveTheme() {
        return isDarkTheme()
            ? THEMES_DATA.dark
            : THEMES_DATA.light;
    }
}

export { ThemeTool };
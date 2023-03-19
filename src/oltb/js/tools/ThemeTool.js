import { DOM } from '../helpers/browser/DOM';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { isDarkTheme } from '../helpers/IsDarkTheme';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/ThemeTool.js';

const DefaultOptions = Object.freeze({
    click: undefined,
    changed: undefined
});

const ThemesData = Object.freeze({
    light: Object.freeze({
        class: 'light',
        tippyContent: 'Light theme',
        icon: getIcon({
            path: SvgPaths.sun.stroked,
            class: 'oltb-tool-button__icon'
        })
    }),
    dark: Object.freeze({
        class: 'dark',
        tippyContent: 'Dark theme',
        icon: getIcon({
            path: SvgPaths.moonStars.stroked,
            class: 'oltb-tool-button__icon'
        })
    })
});

const LocalStorageNodeName = LocalStorageKeys.themeTool;
const LocalStorageDefaults = Object.freeze({
    theme: ThemesData.light.class
});

class ThemeTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });

        const button = DOM.createElement({
            element: 'button',
            html: isDarkTheme() 
                ? ThemesData.light.icon
                : ThemesData.dark.icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `${(
                    isDarkTheme() 
                        ? ThemesData.light.tippyContent 
                        : ThemesData.dark.tippyContent
                )} (${ShortcutKeys.themeTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.options = { ...DefaultOptions, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.localStorage = { ...LocalStorageDefaults, ...localStorageState };

        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.themeTool)) {
            this.handleClick(event);
        }
    }

    onWindowSettingsCleared() {
        const active = this.getActiveTheme();
        this.swithThemeFromTo(active, ThemesData.light);
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
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        const toolbarElement = ElementManager.getToolbarElement();

        toolbarElement.classList.remove(from.class);
        document.body.classList.remove(`oltb-${from.class}`);

        toolbarElement.classList.add(to.class);
        document.body.classList.add(`oltb-${to.class}`);

        // Update toolbar button
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', from.icon);
        this.button._tippy.setContent(`${from.tippyContent} (${ShortcutKeys.themeTool})`);
    }

    getInActiveThem() {
        return isDarkTheme()
            ? ThemesData.light
            : ThemesData.dark;
    }

    getActiveTheme() {
        return isDarkTheme()
            ? ThemesData.dark
            : ThemesData.light;
    }
}

export { ThemeTool };
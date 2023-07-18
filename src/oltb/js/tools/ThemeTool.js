import _ from 'lodash';
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
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    onClick: undefined,
    onChanged: undefined
});

// Note: The values are flipped
const ThemesData = Object.freeze({
    light: Object.freeze({
        class: 'light',
        tippyContent: 'Dark theme',
        icon: getIcon({
            path: SvgPaths.moonStars.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        })
    }),
    dark: Object.freeze({
        class: 'dark',
        tippyContent: 'Light theme',
        icon: getIcon({
            path: SvgPaths.sun.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        })
    })
});

const LocalStorageNodeName = LocalStorageKeys.themeTool;
const LocalStorageDefaults = Object.freeze({
    theme: ThemesData.light.class
});

class ThemeTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });

        const button = DOM.createElement({
            element: 'button',
            html: isDarkTheme() 
                ? ThemesData.dark.icon
                : ThemesData.light.icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                type: 'button',
                'data-tippy-content': `${(
                    isDarkTheme() 
                        ? ThemesData.dark.tippyContent 
                        : ThemesData.light.tippyContent
                )} (${ShortcutKeys.themeTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            },
            prototypes:{
                getTippy: function() {
                    return this._tippy;
                }
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.themeTool)) {
            this.onClickTool(event);
        }
    }

    onWindowSettingsCleared() {
        const active = this.getActiveTheme();
        this.swithThemeFromTo(active, ThemesData.light);
    }

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        this.toggleTheme();

        // Note: Consumer callback
        if(this.options.onChanged instanceof Function) {
            const active = this.getActiveTheme();
            this.options.onChanged(active.class);
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

        const uiRefToolbarElement = ElementManager.getToolbarElement();

        uiRefToolbarElement.classList.remove(from.class);
        document.body.classList.remove(`oltb-${from.class}`);

        uiRefToolbarElement.classList.add(to.class);
        document.body.classList.add(`oltb-${to.class}`);

        // Update toolbar button
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', to.icon);
        this.button.getTippy().setContent(`${to.tippyContent} (${ShortcutKeys.themeTool})`);
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
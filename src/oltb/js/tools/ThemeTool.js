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
import { TranslationManager } from '../core/managers/TranslationManager';

const FILENAME = 'tools/ThemeTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onChanged: undefined
});

const ThemesData = Object.freeze({
    light: {
        class: 'light',
        tippyContent: '',
        icon: getIcon({
            path: SvgPaths.moonStars.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        })
    },
    dark: {
        class: 'dark',
        tippyContent: '',
        icon: getIcon({
            path: SvgPaths.sun.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        })
    }
});

const LocalStorageNodeName = LocalStorageKeys.themeTool;
const LocalStorageDefaults = Object.freeze({
    theme: ThemesData.light.class
});

/**
 * About:
 * Change theme of the Toolbar
 * 
 * Description:
 * The Toolbar is light by default, via this tool the Toolbar can be made dark to be better seen against a bright Map image.
 */
class ThemeTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });

        // Note: The values are flipped
        const i18n = TranslationManager.get('tools.themeTool.titles');
        ThemesData.light.tippyContent = i18n.dark;
        ThemesData.dark.tippyContent = i18n.light;

        const button = DOM.createElement({
            element: 'button',
            html: this.getToolIcon(),
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${this.getToolTippyContent()} (${ShortcutKeys.themeTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            },
            prototypes: {
                getTippy: function() {
                    return this._tippy;
                }
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.isActive = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        this.momentaryActivation();

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        this.doToggleTheme();

        // Note: Consumer callback
        if(this.options.onChanged instanceof Function) {
            const active = this.getActiveTheme();
            this.options.onChanged(active.class);
        }
    }
    
    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.themeTool)) {
            this.onClickTool(event);
        }
    }

    onWindowBrowserStateCleared() {
        const active = this.getActiveTheme();
        this.doSwitchThemeFromTo(active, ThemesData.light);

        // Note: Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Getters and Setters
    // -------------------------------------------------------------------

    getToolTippyContent() {
        return isDarkTheme() 
            ? ThemesData.dark.tippyContent 
            : ThemesData.light.tippyContent;
    }

    getToolIcon() {
        return isDarkTheme() 
            ? ThemesData.dark.icon
            : ThemesData.light.icon;
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

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doToggleTheme() {
        const active = this.getActiveTheme();
        const inActive = this.getInActiveThem();

        this.doSwitchThemeFromTo(active, inActive);
    }

    doSwitchThemeFromTo(from, to) {
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
}

export { ThemeTool };
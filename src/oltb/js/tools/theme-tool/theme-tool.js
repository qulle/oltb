import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { LogManager } from '../../managers/log-manager/log-manager';
import { isDarkTheme } from '../../helpers/is-dark-theme';
import { StateManager } from '../../managers/state-manager/state-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { LocalStorageKeys } from '../../helpers/constants/local-storage-keys';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';

const FILENAME = 'theme-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.themeTool';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onChanged: undefined
});

const ThemesData = Object.freeze({
    light: {
        class: 'light',
        icon: getIcon({
            path: SvgPaths.moonStars.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        })
    },
    dark: {
        class: 'dark',
        icon: getIcon({
            path: SvgPaths.sun.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
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

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.getToolIcon(),
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.themeTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.themeTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
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

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        this.doToggleTheme();
    }
    
    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.themeTool)) {
            this.onClickTool(event);
        }
    }

    onWindowBrowserStateCleared() {
        const active = this.getActiveTheme();
        this.doSwitchThemeFromTo(active, ThemesData.light);

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Getters and Setters
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doToggleTheme() {
        const active = this.getActiveTheme();
        const inActive = this.getInActiveThem();

        this.doSwitchThemeFromTo(active, inActive);

        // Note: 
        // @Consumer callback
        if(this.options.onChanged instanceof Function) {
            this.options.onChanged(inActive.class);
        }
    }

    doSwitchThemeFromTo(from, to) {
        this.localStorage.theme = to.class;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        const uiRefToolbarElement = ElementManager.getToolbarElement();

        uiRefToolbarElement.classList.remove(from.class);
        window.document.body.classList.remove(`oltb-${from.class}`);

        uiRefToolbarElement.classList.add(to.class);
        window.document.body.classList.add(`oltb-${to.class}`);

        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', to.icon);
    }
}

export { ThemeTool };
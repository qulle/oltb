import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../managers/LogManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../managers/ElementManager';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/TranslationTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.translationTool';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined
});

/**
 * About:
 * Display dialog to change current language
 * 
 * Description:
 * The languag can be changed on the fly and also new languages can be added in the configuration without the need to rebuild the code.
 */
class TranslationTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.translate.mixed,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.translationTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.translationTool})`,
                'data-oltb-i18n': `${I18N_BASE}.title`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.infoModal = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

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
        this.askToChangeLanguage();
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.translationTool)) {
            this.onClickTool(event);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Ask User
    // -------------------------------------------------------------------

    askToChangeLanguage() {
        const languages = TranslationManager.getLanguages();
        const currentLang = TranslationManager.getActiveLanguage();
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.selects.changeLanguage`);

        Dialog.select({
            title: i18n.title,
            message: `${i18n.message} <strong>${currentLang.text}</strong>`,
            value: currentLang,
            options: languages,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: (result) => {
                this.doChangeLanguage(result);
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doChangeLanguage(result) {
        LogManager.logInformation(FILENAME, 'doChangeLanguage', {
            from: result.from,
            to: result.to
        });

        TranslationManager.setActiveLanguage(result.to);
    }
}

export { TranslationTool };
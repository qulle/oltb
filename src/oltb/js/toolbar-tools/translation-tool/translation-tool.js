import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Dialog } from '../../common/dialogs/dialog';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { LogManager } from '../../managers/log-manager/log-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'translation-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.translationTool';

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
        
        const icon = getSvgIcon({
            path: SvgPaths.translate.mixed,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.translationTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.translationTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.languageDialog = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

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
        this.askToChangeLanguage();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.translationTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Ask User
    //--------------------------------------------------------------------
    askToChangeLanguage() {
        if(this.languageDialog) {
            return;
        }

        const languages = TranslationManager.getLanguages();
        const currentLanguage = TranslationManager.getActiveLanguage();
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.selects.changeLanguage`);

        this.languageDialog = Dialog.select({
            title: i18n.title,
            message: `${i18n.message} <strong>${currentLanguage.text}</strong>`,
            value: currentLanguage.value,
            options: languages,
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: (result) => {
                this.doChangeLanguage(result);
                this.languageDialog = undefined;
            },
            onCancel: () => {
                this.languageDialog = undefined;
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doChangeLanguage(result) {
        LogManager.logInformation(FILENAME, 'doChangeLanguage', {
            from: result.from,
            to: result.to
        });

        TranslationManager.setActiveLanguage(result.to);
    }
}

export { TranslationTool };
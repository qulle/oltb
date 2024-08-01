import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Dialog } from '../../ui-common/ui-dialogs/dialog';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { toLonLat } from 'ol/proj';
import { goToView } from '../../ol-helpers/go-to-view';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { ConversionManager } from '../../toolbar-managers/conversion-manager/conversion-manager';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'reset-north-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.resetNorthTool';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onReset: undefined
});

/**
 * About:
 * Reset the Map rotation to 0 degrees
 * 
 * Description:
 * The Map can be rotated using keyboard shortcuts and the mouse or using a specific number of degrees.
 */
class ResetNorthTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        this.icon = getSvgIcon({
            path: SvgPaths.compass.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        this.resetRotationIcon = getSvgIcon({
            path: SvgPaths.arrowRepeat.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.resetNorthTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.resetNorthTool})`,
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
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.#initContextMenuItems();
        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);
        
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initContextMenuItems() {
        ContextMenuTool.addItem({
            icon: this.resetRotationIcon, 
            i18nKey: `${I18N__BASE}.contextItems.rotate`, 
            fn: this.#onContextMenuSetRotation.bind(this)
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    momentaryActivation() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const view = map.getView();
        const zoom = view.getZoom();
        const coordinates = toLonLat(view.getCenter());

        goToView({
            map: map,
            coordinates: coordinates,
            zoom: zoom,
            rotation: 0,
            onDone: (result) => {
                // Note: 
                // @Consumer callback
                if(this.options.onReset) {
                    this.options.onReset(result);
                }
            } 
        });
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.resetNorthTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    #onContextMenuSetRotation(map, coordinates, target) {
        this.askToSetRotation(map);
    }

    //--------------------------------------------------------------------
    // # Section: Ask User
    //--------------------------------------------------------------------
    askToSetRotation(map) {
        const view = map.getView();

        const zoom = view.getZoom();
        const rotation = ConversionManager.radiansToDegrees(view.getRotation());
        const normalizationMinLimit = 0;
        const normalizationMaxLimit = 360;
        const normalizedRotation = rotation < normalizationMinLimit 
            ? rotation + normalizationMaxLimit 
            : rotation;

        // Note: 
        // Must use the center of the view, not the clicked coordinates
        const coordinates = toLonLat(view.getCenter());
        const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.prompts.rotateMap`);

        return Dialog.prompt({
            title: i18n.title,
            message: i18n.message,
            value: Math.round(normalizedRotation),
            confirmText: i18n.confirmText,
            cancelText: i18n.cancelText,
            onConfirm: (result) => {
                if(result.isDigitsOnly()) {
                    this.doRotation(map, coordinates, zoom, result);
                }else {
                    LogManager.logError(FILENAME, 'askToSetRotation', {
                        message: 'Only digits are allowed as input',
                        result: result
                    });
                    
                    Toast.error({
                        i18nKey: `${I18N__BASE}.toasts.errors.invalidValue`
                    });
                }
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doRotation(map, coordinates, zoom, degrees) {
        const radians = ConversionManager.degreesToRadians(degrees);

        LogManager.logDebug(FILENAME, 'doRotation', {
            degrees: degrees,
            radians: radians
        });

        goToView({
            map: map,
            coordinates: coordinates,
            zoome: zoom,
            rotation: radians
        });
    }
}

export { ResetNorthTool };
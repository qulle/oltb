import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Toast } from '../../common/toasts/toast';
import { Dialog } from '../../common/dialogs/dialog';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { toLonLat } from 'ol/proj';
import { goToView } from '../../helpers/go-to-view';
import { LogManager } from '../../managers/log-manager/log-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';
import { degreesToRadians, radiansToDegrees } from '../../helpers/conversions';

const FILENAME = 'ResetNorthTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.resetNorthTool';

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
class ResetNorthTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        this.icon = getIcon({
            path: SvgPaths.compass.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        this.resetRotationIcon = getIcon({
            path: SvgPaths.arrowRepeat.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.resetNorthTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.resetNorthTool})`,
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
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.initContextMenuItems();

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
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    initContextMenuItems() {
        ContextMenuTool.addItem({
            icon: this.resetRotationIcon, 
            i18nKey: `${I18N_BASE}.contextItems.rotate`, 
            fn: this.onContextMenuSetRotation.bind(this)
        });
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
                if(this.options.onReset instanceof Function) {
                    this.options.onReset(result);
                }
            } 
        });
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.resetNorthTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    onContextMenuSetRotation(map, coordinates, target) {
        this.askToSetRotation(map);
    }

    //--------------------------------------------------------------------
    // # Section: Ask User
    //--------------------------------------------------------------------
    askToSetRotation(map) {
        const view = map.getView();

        const zoom = view.getZoom();
        const rotation = radiansToDegrees(view.getRotation());
        const normalizationMinLimit = 0;
        const normalizationMaxLimit = 360;
        const normalizedRotation = rotation < normalizationMinLimit 
            ? rotation + normalizationMaxLimit 
            : rotation;

        // Note: 
        // Must use the center of the view, not the clicked coordinates
        const coordinates = toLonLat(view.getCenter());
        const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.prompts.rotateMap`);

        Dialog.prompt({
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
                        i18nKey: `${I18N_BASE}.toasts.errors.invalidValue`
                    });
                }
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doRotation(map, coordinates, zoom, degrees) {
        const radians = degreesToRadians(degrees);

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
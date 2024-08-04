import _ from 'lodash';
import { OSM } from 'ol/source';
import { DOM } from '../../browser-helpers/dom-factory';
import { Tile } from 'ol/layer';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { OverviewMap } from 'ol/control';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'overview-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOGGLEABLE = 'oltb-toggleable';
const ID__PREFIX = 'oltb-overview';
const ID__OVERVIEW_TARGET = `${ID__PREFIX}-target`;
const I18N__BASE = 'tools.overviewTool';
const I18N__BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined
});

const LocalStorageNodeName = LocalStorageKeys.overviewTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false,
    isCollapsed: false
});

/**
 * About:
 * Thumbnail overview
 * 
 * Description:
 * See the Map and its current view in a thumbnail version of the Map.
 */
class OverviewTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.pip.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.overviewTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.overviewTool})`,
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
        this.isActive = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.#initToolboxHTML();
        this.uiRefToolboxSection = window.document.querySelector(`#${ID__PREFIX}-toolbox`);
        this.#initToggleables();

        this.overviewMap = this.#generateOLOverviewMap();
        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        this.onOLTBReadyBind = this.#onOLTBReady.bind(this);
        this.onWindowBrowserStateClearedBind = this.#onWindowBrowserStateCleared.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.addEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.removeEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.removeEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);

        if(this.isActive) {
            this.deactivateTool();
        }else {
            this.activateTool(); 
        }

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initToolboxHTML() {
        const i18n = TranslationManager.get(`${I18N__BASE}.toolbox`);
        const i18nCommon = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);

        const html = (`
            <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
                <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
                <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.overview">${i18n.titles.overview}</h4>
                    <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS__TOOLBOX_SECTION}__group" id="${ID__OVERVIEW_TARGET}"></div>
                </div>
            </div>
        `);

        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', html);
    }

    #initToggleables() {
        this.uiRefToolboxSection.querySelectorAll(`.${CLASS__TOGGLEABLE}`).forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.#onToggleToolbox.bind(this, toggle));
        });
    }

    //--------------------------------------------------------------------
    // # Section: Generate Helpers
    //--------------------------------------------------------------------
    #generateOLOverviewMap() {
        return new OverviewMap({
            target: ID__OVERVIEW_TARGET,
            isCollapsed: false,
            collapsible: false,
            layers: [
                new Tile({
                    source: new OSM(),
                }),
            ]
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Note:
        // The class must be added before setMap or the overview will not render correctly
        this.uiRefToolboxSection.classList.add(`${CLASS__TOOLBOX_SECTION}--show`);
        this.doAddOverview(map);

        this.isActive = true;
        this.button.classList.add(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        this.uiRefToolboxSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end', 
            inline: 'nearest' 
        });
    }

    deactivateTool() {
        this.doRemoveOverview();

        this.isActive = false;
        this.button.classList.remove(`${CLASS__TOOL_BUTTON}--active`);
        this.uiRefToolboxSection.classList.remove(`${CLASS__TOOLBOX_SECTION}--show`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onToggleToolbox(toggle) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const targetName = toggle.dataset.oltbToggleableTarget;
        this.doToggleToolboxSection(targetName);
    }
    
    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.overviewTool)) {
            this.onClickTool(event);
        }
    }
    
    #onWindowBrowserStateCleared() {
        this.doClearState();

        if(this.isActive) {
            this.deactivateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared) {
            this.options.onBrowserStateCleared();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doToggleToolboxSection(targetName) {
        const targetNode = window.document.getElementById(targetName);
        const duration = ConfigManager.getConfig().animationDuration.fast;

        targetNode?.slideToggle(duration, (collapsed) => {
            this.localStorage.isCollapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

            // Note: 
            // Force render of overview, 
            // Other solutions will not render the dashed box correctly until the map is moved
            const map = this.getMap();
            this.overviewMap.setMap(null);
            this.overviewMap.setMap(map);
        });
    }

    doAddOverview(map) {
        this.overviewMap.setMap(map);
    }

    doRemoveOverview() {
        this.overviewMap.setMap(null);
    }
}

export { OverviewTool };
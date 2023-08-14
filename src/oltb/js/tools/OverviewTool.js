import _ from 'lodash';
import { OSM } from 'ol/source';
import { DOM } from '../helpers/browser/DOM';
import { Tile } from 'ol/layer';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { LogManager } from '../core/managers/LogManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { Control, OverviewMap } from 'ol/control';

const FILENAME = 'tools/OverviewTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-overview';

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
class OverviewTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.aspectRatio.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Map Overview (${ShortcutKeys.overviewTool})`
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

        this.initToolboxHTML();
        this.uiRefToolboxSection = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();

        this.overviewMap = this.generateOLOverviewMap();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
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
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initToolboxHTML() {
        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Map Overview
                        <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" title="Toggle Section"></span>
                    </h4>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group" id="${ID_PREFIX}-target"></div>
                </div>
            </div>
        `);
    }

    initToggleables() {
        this.uiRefToolboxSection.querySelectorAll(`.${CLASS_TOGGLEABLE}`).forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });
    }

    // -------------------------------------------------------------------
    // # Section: Generate Helpers
    // -------------------------------------------------------------------

    generateOLOverviewMap() {
        return new OverviewMap({
            target: 'oltb-overview-target',
            isCollapsed: false,
            collapsible: false,
            layers: [
                new Tile({
                    source: new OSM(),
                }),
            ]
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        if(this.isActive) {
            this.deActivateTool();
        }else {
            this.activateTool(); 
        }

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // The class must be added before setMap or the overview will not render correctly
        this.uiRefToolboxSection.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.overviewMap.setMap(map);

        this.isActive = true;
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.overviewMap.setMap(null);

        this.isActive = false;
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);
        this.uiRefToolboxSection.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onToggleToolbox(toggle) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const targetName = toggle.dataset.oltbToggleableTarget;
        this.doToggleToolboxSection(targetName);
    }
    
    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onDOMContentLoaded() {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.overviewTool)) {
            this.onClickTool(event);
        }
    }
    
    onWindowBrowserStateCleared() {
        this.doClearState();

        if(this.isActive) {
            this.deActivateTool();
        }

        // Note: Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doToggleToolboxSection(targetName) {
        const targetNode = document.getElementById(targetName);
        const map = this.getMap();

        targetNode?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage.isCollapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        
            // Note: Force render of overview, 
            // Other solutions will not render the dashed box correctly until the map is moved
            this.overviewMap.setMap(null);
            this.overviewMap.setMap(map);
        });
    }

    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }
}

export { OverviewTool };
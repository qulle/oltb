import Dialog from '../common/Dialog';
import LayerManager from '../core/Managers/LayerManager';
import SettingsManager from '../core/Managers/SettingsManager';
import StateManager from '../core/Managers/StateManager';
import TooltipManager from '../core/Managers/TooltipManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { Select, Modify, Translate } from 'ol/interaction';
import { shiftKeyOnly } from 'ol/events/condition';
import { unByKey } from 'ol/Observable';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { setActiveTool } from '../helpers/ActiveTool';
import { getMeasureTooltipCoordinates, getMeasureTooltipValue } from '../helpers/olFunctions/Measurements';
import { hasNestedProperty } from '../helpers/HasNestedProperty';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const ID_PREFIX = 'oltb-edit';

const LOCAL_STORAGE_NODE_NAME = 'editTool';
const LOCAL_STORAGE_DEFAULTS = {
    collapsed: false
};

const DEFAULT_OPTIONS = {};

class EditTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Edit,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Edit (${SHORTCUT_KEYS.Edit})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };
        
        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Edit tool
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <button type="button" disabled id="${ID_PREFIX}-delete-selected-btn" class="oltb-btn oltb-btn--red-mid oltb-w-100">Delete selected features</button>
                    </div>
                </div>
            </div>
        `);

        this.editToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        this.deleteSelectedButton = this.editToolbox.querySelector(`#${ID_PREFIX}-delete-selected-btn`);
        this.deleteSelectedButton.addEventListener(EVENTS.Browser.Click, this.deleteSelectedFeatures.bind(this));

        const toggleableTriggers = this.editToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, (event) => {
                const targetName = toggle.dataset.oltbToggleableTarget;
                document.getElementById(targetName).slideToggle(200, (collapsed) => {
                    this.localStorage.collapsed = collapsed;
                    StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
                });
            });
        });

        this.select = new Select({
            hitTolerance: 5,
            filter: function(feature, layer) {
                const selectable = !hasNestedProperty(feature.getProperties(), 'notSelectable');
                const isFeatureLayer = LayerManager.getFeatureLayers().find((layerWrapper) => {
                    return layerWrapper.layer.getSource().hasFeature(feature);
                });
                
                return selectable && (isFeatureLayer || SettingsManager.getSetting('select.vector.map.shapes'));
            }
        });
        
        this.modify = new Modify({
            features: this.select.getFeatures(),
            condition: function(event) {
                return shiftKeyOnly(event);
            }
        });

        this.translate = new Translate({
            features: this.select.getFeatures(),
        });

        this.select.getFeatures().on(EVENTS.Ol.Add, (event) => {
            this.deleteSelectedButton.removeAttribute('disabled');

            // User defined callback from constructor
            if(typeof this.options.selectadd === 'function') {
                this.options.selectadd(event);
            }
        });

        this.select.getFeatures().on(EVENTS.Ol.Remove, (event) => {
            if(!this.select.getFeatures().getLength()) {
                this.deleteSelectedButton.setAttribute('disabled', '');
            }

            // User defined callback from constructor
            if(typeof this.options.selectremove === 'function') {
                this.options.selectremove(event);
            }
        });

        this.modify.addEventListener(EVENTS.Ol.ModifyStart, (event) => {
            event.features.forEach((feature) => {
                if(hasNestedProperty(feature.getProperties(), 'tooltipOverlay')) {
                    this.attachOnChange(feature);
                }
            });

            // User defined callback from constructor
            if(typeof this.options.modifystart === 'function') {
                this.options.modifystart(event);
            }
        });

        this.modify.addEventListener(EVENTS.Ol.ModifyEnd, (event) => {
            event.features.forEach((feature) => {
                if(hasNestedProperty(feature.getProperties(), 'tooltipOverlay')) {
                    this.detachOnChange(feature);
                }
            });

            // User defined callback from constructor
            if(typeof this.options.modifyend === 'function') {
                this.options.modifyend(event);
            }
        });

        this.translate.addEventListener(EVENTS.Ol.TranslateStart, (event) => {
            event.features.forEach((feature) => {
                if(hasNestedProperty(feature.getProperties(), 'tooltipOverlay')) {
                    this.attachOnChange(feature);
                }
            });

            // User defined callback from constructor
            if(typeof this.options.translatestart === 'function') {
                this.options.translatestart(event);
            }
        });

        this.translate.addEventListener(EVENTS.Ol.TranslateEnd, (event) => {
            event.features.forEach((feature) => {
                if(hasNestedProperty(feature.getProperties(), 'tooltipOverlay')) {
                    this.detachOnChange(feature);
                }
            });

            // User defined callback from constructor
            if(typeof this.options.translateend === 'function') {
                this.options.translateend(event);
            }
        });

        window.addEventListener(EVENTS.Custom.FeatureLayerRemoved, this.onWindowFeatureLayerRemoved.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Edit)) {
            this.handleClick(event);
        }else if(isShortcutKeyOnly(event, 'delete')) {
            if(this.select.getFeatures().getArray().length > 0) {
                this.deleteSelectedFeatures();
            }
        }
    }
    
    onWindowSettingsCleared() {
        this.localStorage = LOCAL_STORAGE_DEFAULTS;
    }

    deleteSelectedFeatures() {
        const numSelectedFeatures = this.select.getFeatures().getArray().length;

        Dialog.confirm({
            text: `Delete ${numSelectedFeatures} selected feature${numSelectedFeatures > 1 ? 's': ''}?`,
            onConfirm: () => {
                const layerWrappers = LayerManager.getFeatureLayers();
                const features = [...this.select.getFeatures().getArray()];

                // The user can select features from any layer. Each feature needs to be removed from its associated layer. 
                features.forEach((feature) => {
                    layerWrappers.forEach((layerWrapper) => {
                        const source = layerWrapper.layer.getSource();
                        if(source.hasFeature(feature)) {
                            // Remove feature from layer
                            source.removeFeature(feature);

                            // Remove feature from selected collection
                            this.select.getFeatures().remove(feature);

                            // Remove potential overlays associated with the feature
                            if(hasNestedProperty(feature.getProperties(), 'tooltipOverlay')) {
                                this.getMap().removeOverlay(feature.getProperties().tooltipOverlay);
                            }

                            // User defined callback from constructor
                            if(typeof this.options.removedfeature === 'function') {
                                this.options.removedfeature(feature);
                            }
                        }
                    });
                });
            }
        });
    }

    onWindowFeatureLayerRemoved(event) {
        this.select.getFeatures().clear();
    }

    attachOnChange(feature) {
        const selectedFeatures = this.select.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();

        if(hasOtherTooltip && selectedFeatures.length === 1) {
            this.tooltipItem = TooltipManager.push('edit');
        }

        feature.getProperties().tooltipOverlay.getElement().className = `oltb-overlay-tooltip ${hasOtherTooltip && selectedFeatures.length === 1 ? 'oltb-overlay-tooltip--hidden' : ''}`;
        feature.getProperties().onChangeListener = feature.getGeometry().on(EVENTS.Ol.Change, this.onFeatureChange.bind(this, feature));
    }

    detachOnChange(feature) {
        const selectedFeatures = this.select.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();
        
        if(hasOtherTooltip && selectedFeatures.length === 1) {
            const poppedTooltip = TooltipManager.pop('edit');
        }

        unByKey(feature.getProperties().onChangeListener);

        const overlay = feature.getProperties().tooltipOverlay;
        overlay.setPosition(getMeasureTooltipCoordinates(feature.getGeometry()));

        const tooltip = overlay.getElement();
        tooltip.className = 'oltb-overlay-tooltip';
        tooltip.firstElementChild.innerHTML = getMeasureTooltipValue(feature.getGeometry());
    }

    onFeatureChange(feature) {
        const selectedFeatures = this.select.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();

        if(hasOtherTooltip && selectedFeatures.length === 1) {
            this.tooltipItem.innerHTML = getMeasureTooltipValue(feature.getGeometry());
        }else {
            const overlay = feature.getProperties().tooltipOverlay;
            overlay.setPosition(getMeasureTooltipCoordinates(feature.getGeometry()));

            const tooltip = overlay.getElement();
            tooltip.firstElementChild.innerHTML = getMeasureTooltipValue(feature.getGeometry());
        }
    }

    // Called when the user activates a tool that cannot be used with this tool
    deSelect() {
        this.handleEdit();
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        setActiveTool(this);
        this.handleEdit();
    }

    handleEdit() {
        const map = this.getMap();
        const interactions = [
            this.select,
            this.translate,
            this.modify
        ];

        if(this.active) {
            interactions.forEach((item) => {
                map.removeInteraction(item);
            });

            // Remove this tool as the active global tool
            window.oltb.activeTool = null;
        }else {
            interactions.forEach((item) => {
                map.addInteraction(item);
            });
        }
        
        this.active = !this.active;
        this.editToolbox.classList.toggle('oltb-toolbox-section--show');
        this.button.classList.toggle('oltb-tool-button--active');
    }
}

export default EditTool;
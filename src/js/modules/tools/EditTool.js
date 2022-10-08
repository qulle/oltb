import Dialog from '../common/Dialog';
import LayerManager from '../core/managers/LayerManager';
import SettingsManager from '../core/managers/SettingsManager';
import StateManager from '../core/managers/StateManager';
import TooltipManager from '../core/managers/TooltipManager';
import ToolManager from '../core/managers/ToolManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { Select, Modify, Translate } from 'ol/interaction';
import { shiftKeyOnly } from 'ol/events/condition';
import { unByKey } from 'ol/Observable';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { getMeasureTooltipCoordinates, getMeasureTooltipValue } from '../helpers/ol-functions/Measurements';
import { hasCustomFeatureProperty } from '../helpers/HasNestedProperty';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';
import { SETTINGS } from '../helpers/constants/Settings';
import { FEATURE_PROPERTIES } from '../helpers/constants/FeatureProperties';

const ID_PREFIX = 'oltb-edit';

const LOCAL_STORAGE_NODE_NAME = 'editTool';
const LOCAL_STORAGE_DEFAULTS = {
    collapsed: false,
    hitTolerance: 5
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
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleToolbox.bind(this, toggle));
        });

        this.select = new Select({
            hitTolerance: this.options.hitTolerance,
            filter: function(feature, layer) {
                const selectable = !hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.NotSelectable);
                const isFeatureLayer = LayerManager.getFeatureLayers().find((layerWrapper) => {
                    return layerWrapper.layer.getSource().hasFeature(feature);
                });
                
                return selectable && (isFeatureLayer || SettingsManager.getSetting(SETTINGS.SelectVectorMapShapes));
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

        this.select.getFeatures().on(EVENTS.Ol.Add, this.onSelectAddFeature.bind(this));
        this.select.getFeatures().on(EVENTS.Ol.Remove, this.onSelectRemoveFeature.bind(this));

        this.modify.addEventListener(EVENTS.Ol.ModifyStart, this.onModifyStart.bind(this));
        this.modify.addEventListener(EVENTS.Ol.ModifyEnd, this.onModifyEnd.bind(this));

        this.translate.addEventListener(EVENTS.Ol.TranslateStart, this.onTranslateStart.bind(this));
        this.translate.addEventListener(EVENTS.Ol.TranslateEnd, this.onTranslateEnd.bind(this));

        window.addEventListener(EVENTS.Custom.FeatureLayerRemoved, this.onWindowFeatureLayerRemoved.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
    }

    onSelectAddFeature(event) {
        this.deleteSelectedButton.removeAttribute('disabled');

        // Note: User defined callback from constructor
        if(typeof this.options.selectadd === 'function') {
            this.options.selectadd(event);
        }
    }

    onSelectRemoveFeature(event) {
        if(!this.select.getFeatures().getLength()) {
            this.deleteSelectedButton.setAttribute('disabled', '');
        }

        // Note: User defined callback from constructor
        if(typeof this.options.selectremove === 'function') {
            this.options.selectremove(event);
        }
    }

    onModifyStart(event) {
        event.features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                this.attachOnChange(feature);
            }
        });

        // Note: User defined callback from constructor
        if(typeof this.options.modifystart === 'function') {
            this.options.modifystart(event);
        }
    }

    onModifyEnd(event) {
        event.features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                this.detachOnChange(feature);
            }
        });

        // Note: User defined callback from constructor
        if(typeof this.options.modifyend === 'function') {
            this.options.modifyend(event);
        }
    }

    onTranslateStart(event) {
        event.features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                this.attachOnChange(feature);
            }
        });

        // Note: User defined callback from constructor
        if(typeof this.options.translatestart === 'function') {
            this.options.translatestart(event);
        }
    }

    onTranslateEnd(event) {
        event.features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                this.detachOnChange(feature);
            }
        });

        // Note: User defined callback from constructor
        if(typeof this.options.translateend === 'function') {
            this.options.translateend(event);
        }
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(200, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
        });
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
                            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                                this.getMap().removeOverlay(feature.getProperties().oltb.tooltip);
                            }

                            // Note: User defined callback from constructor
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

        feature.getProperties().oltb.tooltip.getElement().className = `oltb-overlay-tooltip ${hasOtherTooltip && selectedFeatures.length === 1 ? 'oltb-overlay-tooltip--hidden' : ''}`;
        feature.getProperties().oltb.onChangeListener = feature.getGeometry().on(EVENTS.Ol.Change, this.onFeatureChange.bind(this, feature));
    }

    detachOnChange(feature) {
        const selectedFeatures = this.select.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();
        
        if(hasOtherTooltip && selectedFeatures.length === 1) {
            const poppedTooltip = TooltipManager.pop('edit');
        }

        unByKey(feature.getProperties().oltb.onChangeListener);

        const overlay = feature.getProperties().oltb.tooltip;
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
            const overlay = feature.getProperties().oltb.tooltip;
            overlay.setPosition(getMeasureTooltipCoordinates(feature.getGeometry()));

            const tooltip = overlay.getElement();
            tooltip.firstElementChild.innerHTML = getMeasureTooltipValue(feature.getGeometry());
        }
    }

    deSelect() {
        this.handleEdit();
    }

    handleClick() {
        // Note: User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        ToolManager.setActiveTool(this);
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
            ToolManager.removeActiveTool();
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
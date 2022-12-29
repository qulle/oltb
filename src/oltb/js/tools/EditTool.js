import jsts from 'jsts/dist/jsts.min';
import { DOM } from '../helpers/browser/DOM';
import { KEYS } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Dialog } from '../common/Dialog';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Feature } from 'ol';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { SETTINGS } from '../helpers/constants/Settings';
import { ToolManager } from '../core/managers/ToolManager';
import { shiftKeyOnly } from 'ol/events/condition';
import { LayerManager } from '../core/managers/LayerManager';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TooltipManager } from '../core/managers/TooltipManager';
import { SettingsManager } from '../core/managers/SettingsManager';
import { generateTooltip } from '../generators/GenerateTooltip';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';
import { FEATURE_PROPERTIES } from '../helpers/constants/FeatureProperties';
import { Fill, Stroke, Style } from 'ol/style';
import { hasCustomFeatureProperty } from '../helpers/browser/HasNestedProperty';
import { getCustomFeatureProperty } from '../helpers/browser/GetNestedProperty';
import { Select, Modify, Translate } from 'ol/interaction';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/elements/index';
import { getMeasureCoordinates, getMeasureValue } from '../helpers/Measurements';
import { GeometryCollection, LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom';

/*!
 *  JSTS
 *  To avoid circular dependencies i include the full dist
 *  This increases the bundle size but removes errors/warnings in Rollup build process
 *  Also more features can be used from this lib in the future
 *   
 *  https://github.com/bjornharrtell/jsts#caveats
 */

const ID_PREFIX = 'oltb-edit';
const DEFAULT_OPTIONS = Object.freeze({});

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.EditTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false,
    collapsed: false,
    hitTolerance: 5,
    strokeColor: '#4A86B8',
    fillColor: '#D7E3FA80'
});

const DEFAULT_BUTTON_PROPS = Object.freeze({
    width: 20,
    height: 20,
    fill: 'rgb(255, 255, 255)',
    stroke: 'none',
    class: 'oltb-btn__icon'
});

const DEFAULT_DRAWING_STYLE = new Style({
    fill: new Fill({
        color: '#D7E3FA80'
    }),
    stroke: new Stroke({
        color: '#4A86B8',
        width: 2.5
    })
});

const DEFAULT_MEASURE_STYLE = new Style({
    fill: new Fill({
        color: 'rgba(255, 255, 255, .5)'
    }),
    stroke: new Stroke({
        color: '#3B4352',
        lineDash: [2, 5],
        width: 2.5
    })
});

class EditTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Cursor.Stroked,
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
        this.lastStyle = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // JSTS
        this.parser = new jsts.io.OL3Parser();
        this.parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection);

        // Load stored data from localStorage
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
                        <label class="oltb-label">Misc</label>
                        <button type="button" id="${ID_PREFIX}-delete-selected-btn" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Delete">
                            ${getIcon({ ...DEFAULT_BUTTON_PROPS, path: SVG_PATHS.Trash.Stroked })}
                        </button>
                    </div>
                    <div class="oltb-toolbox-section__group oltb-toolbox-section__group--sub-toolbar">
                        <label class="oltb-label">Shapes</label>
                        <button type="button" id="${ID_PREFIX}-union-selected-btn" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Union">
                            ${getIcon({ ...DEFAULT_BUTTON_PROPS, path: SVG_PATHS.Union.Mixed })}
                        </button>
                        <button type="button" id="${ID_PREFIX}-intersect-selected-btn" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Intersect">
                            ${getIcon({ ...DEFAULT_BUTTON_PROPS, path: SVG_PATHS.Intersect.Mixed })}
                        </button>
                        <button type="button" id="${ID_PREFIX}-exclude-selected-btn" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Exclude">
                            ${getIcon({ ...DEFAULT_BUTTON_PROPS, path: SVG_PATHS.Exclude.Mixed })}
                        </button>
                        <button type="button" id="${ID_PREFIX}-difference-selected-btn" class="oltb-btn oltb-btn--blue-mid oltb-tippy" title="Difference">
                            ${getIcon({ ...DEFAULT_BUTTON_PROPS, path: SVG_PATHS.Subtract.Mixed })}
                        </button>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-stroke-color">Stroke color</label>
                        <div id="${ID_PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                        </div>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-fill-color">Fill color</label>
                        <div id="${ID_PREFIX}-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-fill-color" data-oltb-color="${this.localStorage.fillColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.fillColor};"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.editToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        this.deleteSelectedButton = this.editToolbox.querySelector(`#${ID_PREFIX}-delete-selected-btn`);
        this.deleteSelectedButton.addEventListener(EVENTS.Browser.Click, this.onDeleteSelectedFeatures.bind(this));

        this.unionSelectedButton = this.editToolbox.querySelector(`#${ID_PREFIX}-union-selected-btn`);
        this.unionSelectedButton.addEventListener(EVENTS.Browser.Click, this.onShapeOperator.bind(this, this.unionFeatures, 'union'));

        this.intersectSelectedButton = this.editToolbox.querySelector(`#${ID_PREFIX}-intersect-selected-btn`);
        this.intersectSelectedButton.addEventListener(EVENTS.Browser.Click, this.onShapeOperator.bind(this, this.intersectFeatures, 'intersect'));

        this.excludeSelectedButton = this.editToolbox.querySelector(`#${ID_PREFIX}-exclude-selected-btn`);
        this.excludeSelectedButton.addEventListener(EVENTS.Browser.Click, this.onShapeOperator.bind(this, this.excludeFeatures, 'exclude'));

        this.differenceSelectedButton = this.editToolbox.querySelector(`#${ID_PREFIX}-difference-selected-btn`);
        this.differenceSelectedButton.addEventListener(EVENTS.Browser.Click, this.onShapeOperator.bind(this, this.differenceFeatures, 'difference'));

        this.fillColor = this.editToolbox.querySelector(`#${ID_PREFIX}-fill-color`);
        this.fillColor.addEventListener(EVENTS.Custom.ColorChange, this.onFeatureColorChange.bind(this));

        this.strokeColor = this.editToolbox.querySelector(`#${ID_PREFIX}-stroke-color`);
        this.strokeColor.addEventListener(EVENTS.Custom.ColorChange, this.onFeatureColorChange.bind(this));

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
                
                return (
                    selectable && 
                    (
                        isFeatureLayer || 
                        SettingsManager.getSetting(SETTINGS.SelectVectorMapShapes)
                    )
                );
            },
            style: this.lastStyle
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

        this.select.getFeatures().on(EVENTS.OpenLayers.Add, this.onSelectFeatureAdd.bind(this));
        this.select.getFeatures().on(EVENTS.OpenLayers.Remove, this.onSelectFeatureRemove.bind(this));

        this.modify.addEventListener(EVENTS.OpenLayers.ModifyStart, this.onModifyStart.bind(this));
        this.modify.addEventListener(EVENTS.OpenLayers.ModifyEnd, this.onModifyEnd.bind(this));

        this.translate.addEventListener(EVENTS.OpenLayers.TranslateStart, this.onTranslateStart.bind(this));
        this.translate.addEventListener(EVENTS.OpenLayers.TranslateEnd, this.onTranslateEnd.bind(this));

        window.addEventListener(EVENTS.Custom.FeatureLayerRemoved, this.onWindowFeatureLayerRemoved.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onSelectFeatureAdd(event) {
        // User defined callback from constructor
        if(typeof this.options.selectadd === 'function') {
            this.options.selectadd(event);
        }
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onSelectFeatureRemove(event) {
        const feature = event.element;

        // The setTimeout must be used, if not, the style will be reset to the style used before the feature was selected
        setTimeout(() => {
            if(this.colorHasChanged) {
                // Set the lastStyle as the default style
                feature.setStyle(this.lastStyle);

                if(getCustomFeatureProperty(feature.getProperties(), 'type') === FEATURE_PROPERTIES.Type.Measurement) {
                    // To add lineDash, a new Style object must be used
                    // If the lastStyle is used all object that is referenced with that object will get a dashed line
                    const style = new Style({
                        fill: new Fill({
                            color: this.lastStyle.getFill().getColor()
                        }),
                        stroke: new Stroke({
                            color: this.lastStyle.getStroke().getColor(),
                            width: this.lastStyle.getStroke().getWidth(),
                            lineDash: [2, 5]
                        })
                    });
                    
                    feature.setStyle(style);
                }

                // User defined callback from constructor
                if(typeof this.options.styleChange === 'function') {
                    this.options.styleChange(event, this.lastStyle);
                }

                // Reset for the last deselected item
                if(event.index === 0) {
                    this.colorHasChanged = false;
                }
            }
        });

        // User defined callback from constructor
        if(typeof this.options.selectremove === 'function') {
            this.options.selectremove(event);
        }
    }

    onModifyStart(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                this.attachOnChange(feature);
            }
        });

        // User defined callback from constructor
        if(typeof this.options.modifystart === 'function') {
            this.options.modifystart(event);
        }
    }

    onModifyEnd(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                this.detachOnChange(feature);
            }
        });

        // User defined callback from constructor
        if(typeof this.options.modifyend === 'function') {
            this.options.modifyend(event);
        }
    }

    onTranslateStart(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                this.attachOnChange(feature);
            }
        });

        // User defined callback from constructor
        if(typeof this.options.translatestart === 'function') {
            this.options.translatestart(event);
        }
    }

    onTranslateEnd(event) {
        const features = event.features;

        features.forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                this.detachOnChange(feature);
            }
        });

        // User defined callback from constructor
        if(typeof this.options.translateend === 'function') {
            this.options.translateend(event);
        }
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(CONFIG.AnimationDuration.Fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
        });
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Edit)) {
            this.handleClick(event);
        }else if(event.key.toLowerCase() === KEYS.Delete && this.active) {
            this.onDeleteSelectedFeatures();
        }
    }
    
    onWindowSettingsCleared() {
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS };

        this.fillColor.setAttribute('data-oltb-color', this.localStorage.fillColor);
        this.fillColor.firstElementChild.style.backgroundColor = this.localStorage.fillColor;

        this.strokeColor.setAttribute('data-oltb-color', this.localStorage.strokeColor);
        this.strokeColor.firstElementChild.style.backgroundColor = this.localStorage.strokeColor;
    }

    onDeleteSelectedFeatures() {
        const featureLength = this.select.getFeatures().getArray().length;

        if(featureLength === 0) {
            Toast.info({
                title: 'Whoops',
                message: 'No features selected to delete', 
                autoremove: 4000
            });

            return;
        }

        Dialog.confirm({
            title: 'Delete feature',
            message: `Delete ${featureLength} selected feature${featureLength > 1 ? 's': ''}?`,
            confirmText: 'Delete',
            onConfirm: () => {
                const features = [ ...this.select.getFeatures().getArray() ];
                this.deleteFeatures(features);
            }
        });
    }

    deleteFeatures(features) {
        const layerWrappers = LayerManager.getFeatureLayers();

        // The user can select features from any layer
        // Each feature needs to be removed from its associated layer
        features.forEach((feature) => {
            layerWrappers.forEach((layerWrapper) => {
                const source = layerWrapper.layer.getSource();
                if(source.hasFeature(feature)) {
                    // Remove feature from layer
                    source.removeFeature(feature);

                    // Remove feature from selected collection
                    this.select.getFeatures().remove(feature);

                    // Remove overlays associated with the feature
                    if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                        this.getMap().removeOverlay(feature.getProperties().oltb.tooltip);
                    }

                    // User defined callback from constructor
                    if(typeof this.options.removedfeature === 'function') {
                        this.options.removedfeature(feature);
                    }
                }
            });
        });
    }

    onFeatureColorChange(event) {
        this.colorHasChanged = true;

        const fillColor = this.fillColor.getAttribute('data-oltb-color');
        const strokeColor = this.strokeColor.getAttribute('data-oltb-color');

        const features = [ ...this.select.getFeatures().getArray() ];

        this.lastStyle = new Style({
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: strokeColor,
                width: 2.5
            })
        });

        features.forEach((feature) => {
            feature.setStyle(this.lastStyle);      
        });

        this.localStorage.fillColor = this.lastStyle.getFill().getColor();
        this.localStorage.strokeColor = this.lastStyle.getStroke().getColor();

        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    onShapeOperator(operation, type) {
        const features = [ ...this.select.getFeatures().getArray() ];

        // Only allow two shapes at the time to be unioned
        if(features.length !== 2) {
            Toast.info({
                title: 'Whoops',
                message: 'Strict two overlapping features must be selected', 
                autoremove: 4000
            });

            return;
        }

        try {
            const a = features[0];
            const b = features[1];

            const aGeo = this.parser.read(a.getGeometry());
            const bGeo = this.parser.read(b.getGeometry());

            // JSTS Lib operation
            const shape = operation(aGeo, bGeo);

            // Create new feature with that shape
            const feature = new Feature({
                geometry: new Polygon(this.parser.write(shape).getCoordinates()),
            });

            // Check if a or b was a measurement, if so, create a new tooltip
            if(
                getCustomFeatureProperty(a.getProperties(), 'type') === FEATURE_PROPERTIES.Type.Measurement ||
                getCustomFeatureProperty(b.getProperties(), 'type') === FEATURE_PROPERTIES.Type.Measurement
            ) {
                const tooltip = generateTooltip();

                feature.setProperties({
                    oltb: {
                        type: FEATURE_PROPERTIES.Type.Measurement,
                        tooltip: tooltip.getOverlay()
                    }
                });

                const geometry = feature.getGeometry();

                tooltip.setPosition(getMeasureCoordinates(geometry));
                tooltip.setData(getMeasureValue(geometry));

                this.getMap().addOverlay(tooltip.getOverlay());

                feature.setStyle(DEFAULT_MEASURE_STYLE);
            }else {
                feature.setStyle(DEFAULT_DRAWING_STYLE);
            }

            // Add the unioned shape
            const layerWrapper = LayerManager.getActiveFeatureLayer();
            const source = layerWrapper.layer.getSource();

            source.addFeature(feature);

            // Remove two original shapes
            this.deleteFeatures(features);

            // User defined callback from constructor
            if(typeof this.options.shapeOperation === 'function') {
                this.options.shapeOperation(type, a, b, feature);
            }
        }catch(error) {
            const errorMessage = 'Failed to perform shape operation';

            console.error(errorMessage, error);
            Toast.error({
                title: 'Error',
                message: errorMessage
            }); 

            // User defined callback from constructor
            if(typeof this.options.error === 'function') {
                this.options.error(error);
            }
        }
    }

    unionFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.union(a, b);
    }

    intersectFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.intersection(a, b);
    }

    excludeFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.symDifference(a, b);
    }

    differenceFeatures(a, b) {
        return jsts.operation.overlay.OverlayOp.difference(a, b);
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

        const properties = feature.getProperties();
        const hiddenTooltip = hasOtherTooltip && selectedFeatures.length === 1;

        properties.oltb.tooltip.getElement().className = `oltb-overlay-tooltip ${hiddenTooltip ? 'oltb-overlay-tooltip--hidden' : ''}`;
        properties.oltb.onChangeListener = feature.getGeometry().on(EVENTS.OpenLayers.Change, this.onFeatureChange.bind(this, feature));
    }

    detachOnChange(feature) {
        const selectedFeatures = this.select.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();
        
        if(hasOtherTooltip && selectedFeatures.length === 1) {
            const poppedTooltip = TooltipManager.pop('edit');
        }

        const properties = feature.getProperties();
        const geometry = feature.getGeometry();

        unByKey(properties.oltb.onChangeListener);

        const overlay = properties.oltb.tooltip;
        overlay.setPosition(getMeasureCoordinates(geometry));

        const tooltip = overlay.getElement();
        tooltip.className = 'oltb-overlay-tooltip';
        tooltip.firstElementChild.innerHTML = getMeasureValue(geometry);
    }

    onFeatureChange(feature) {
        const selectedFeatures = this.select.getFeatures().getArray();
        const hasOtherTooltip = !TooltipManager.isEmpty();
        const geometry = feature.getGeometry();

        if(hasOtherTooltip && selectedFeatures.length === 1) {
            this.tooltipItem.innerHTML = getMeasureValue(geometry);
        }else {
            const overlay = feature.getProperties().oltb.tooltip;
            overlay.setPosition(getMeasureCoordinates(geometry));

            const tooltip = overlay.getElement();
            tooltip.firstElementChild.innerHTML = getMeasureValue(geometry);
        }
    }

    deSelect() {
        this.deActivateTool();
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        [
            this.select,
            this.translate,
            this.modify
        ].forEach((item) => {
            this.getMap().addInteraction(item);
        });

        ToolManager.setActiveTool(this);

        this.active = true;
        this.editToolbox.classList.add('oltb-toolbox-section--show');
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    deActivateTool() {
        [
            this.select,
            this.translate,
            this.modify
        ].forEach((item) => {
            this.getMap().removeInteraction(item);
        });

        ToolManager.removeActiveTool();

        this.active = false;
        this.editToolbox.classList.remove('oltb-toolbox-section--show');
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }
}

export { EditTool };
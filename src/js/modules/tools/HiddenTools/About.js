import 'ol/ol.css';
import Dialog from '../../common/Dialog';
import Config from '../../core/Config';
import { Control } from 'ol/control';
import { toolbarElement } from '../../core/ElementReferences';
import { addContextMenuItem } from '../../common/ContextMenu';
import { SVGPaths, getIcon } from '../../core/Icons';
import { VERSION } from 'ol';

class HiddenAbout extends Control {
    constructor() {
        super({
            element: toolbarElement
        });

        const icon = getIcon({path: SVGPaths.About});

        addContextMenuItem('main.map.context.menu', {});
        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'About OLTB', fn: function() {
            Dialog.alert({confirmText: 'Got it!', html: `
                <h3>Version ${Config.version}</h3>
                <p>Developed by Qulle <a href="//github.com/qulle/oltb" target="_blank" class="oltb-link">github.com/qulle/oltb</a></p>
                <p>Using OpenLayers <a href="//openlayers.org/en/v${VERSION}/apidoc/" target="_blank" class="oltb-link">${VERSION}</a></p>
            `});
        }});
    }
}

export default HiddenAbout;
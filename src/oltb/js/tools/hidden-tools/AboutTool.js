import { CONFIG } from '../../core/Config';
import { Dialog } from '../../common/Dialog';
import { VERSION } from 'ol';
import { Control } from 'ol/control';
import { ContextMenu } from '../../common/ContextMenu';
import { TOOLBAR_ELEMENT } from '../../core/elements/index';
import { SVG_PATHS, getIcon } from '../../core/icons/GetIcon';

class HiddenAboutTool extends Control {
    constructor() {
        super({
            element: TOOLBAR_ELEMENT
        });

        const icon = getIcon({
            path: SVG_PATHS.GitHub.Mixed
        });

        ContextMenu.addItem({});
        
        ContextMenu.addItem({
            icon: icon, 
            name: 'About OLTB', 
            fn: this.onContextMenuAbout.bind(this)
        });
    }

    onContextMenuAbout(map, coordinates, target) {
        Dialog.alert({
            confirmText: 'Got it!', 
            html: (`
                <h3>Version ${CONFIG.Version}</h3>
                <p>Developed by Qulle <a href="//github.com/qulle/oltb" target="_blank" class="oltb-link">github.com/qulle/oltb</a></p>
                <p>Using OpenLayers <a href="//openlayers.org/en/v${VERSION}/apidoc/" target="_blank" class="oltb-link">${VERSION}</a></p>
            `)
        });
    }
}

export { HiddenAboutTool };
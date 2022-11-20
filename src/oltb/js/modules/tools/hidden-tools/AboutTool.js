import CONFIG from '../../core/Config';
import Dialog from '../../common/Dialog';
import { VERSION } from 'ol';
import { Control } from 'ol/control';
import { CONTEXT_MENUS } from '../../helpers/constants/ContextMenus';
import { TOOLBAR_ELEMENT } from '../../core/ElementReferences';
import { addContextMenuItem } from '../../common/ContextMenu';
import { SVG_PATHS, getIcon } from '../../core/SVGIcons';

class HiddenAboutTool extends Control {
    constructor() {
        super({
            element: TOOLBAR_ELEMENT
        });

        const icon = getIcon({
            path: SVG_PATHS.GitHub
        });

        addContextMenuItem(CONTEXT_MENUS.MainMap, {});
        
        addContextMenuItem(CONTEXT_MENUS.MainMap, {
            icon: icon, 
            name: 'About OLTB', 
            fn: this.onContextMenuAbout.bind(this)
        });
    }

    onContextMenuAbout(map, coordinates, target) {
        Dialog.alert({confirmText: 'Got it!', html: `
            <h3>Version ${CONFIG.version}</h3>
            <p>Developed by Qulle <a href="//github.com/qulle/oltb" target="_blank" class="oltb-link">github.com/qulle/oltb</a></p>
            <p>Using OpenLayers <a href="//openlayers.org/en/v${VERSION}/apidoc/" target="_blank" class="oltb-link">${VERSION}</a></p>
        `});
    }
}

export default HiddenAboutTool;
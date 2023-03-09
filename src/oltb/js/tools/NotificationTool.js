import { DOM } from '../helpers/browser/DOM';
import { Modal } from '../common/Modal';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const FILENAME = 'tools/NotificationTool.js';
const NOTIFICATION_URL = 'https://raw.githubusercontent.com/qulle/notification-endpoints/main/endpoints/oltb.json';
const DEFAULT_OPTIONS = Object.freeze({
    click: undefined
});

class NotificationTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Bell.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Notifications (${SHORTCUT_KEYS.Notifications})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        this.notificationModal = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Notifications)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        if(Boolean(this.notificationModal)) {
            return;
        }

        this.notificationModal = Modal.create({
            title: 'Notifications',
            content: '<p>Loading notifications...</p>',
            onClose: () => {
                this.notificationModal = undefined;
            }
        });

        const timestamp = new Date().getTime().toString();
        const notificationPromise = fetch(`${NOTIFICATION_URL}?cache=${timestamp}`)
            .then((response) => {
                if(!Boolean(response.ok)) {
                    throw new Error(`Fetch error [${response.status}] [${response.statusText}]`);
                }

                return response.json();
            })
            .then((json) => {
                let features = '';
                if(json.features.length === 0) {
                    features = '<p>No features currently under development</p>';
                }else {
                    json.features.forEach((feature) => {
                        features += `<p>${feature}</p>`;
                    });
                }

                const content = `
                    <h3>👋 From Qulle</h3>
                    <p>${json.qulle}</p>
                    <h3>🔭 Your version</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${CONFIG.Version}" target="_blank" class="oltb-link">
                            v${CONFIG.Version}
                        </a>
                    </p>
                    <h3>🚀 Latest version</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${json.latest}" target="_blank" class="oltb-link">
                            v${json.latest} - ${new Date(json.released).toLocaleDateString(CONFIG.Locale)}
                        </a>
                    </p>
                    <h3>💡 New features under development</h3>
                    ${features}
                `;

                this.notificationModal.setContent(content);
            })
            .catch((error) => {
                const content = `
                    <h3>👋 From Qulle</h3>
                    <p>Glad you are using my App, hope you find it useful!</p>
                    <h3>🔭 Your version</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${CONFIG.Version}" target="_blank" class="oltb-link">
                            v${CONFIG.Version}
                        </a>
                    </p>
                    <h3>📡 Fetch error</h3>
                    <p>Data from the GitHub repo could not be fetched</p>
                `;

                this.notificationModal.setContent(content);
                LogManager.logError(FILENAME, 'momentaryActivation', {
                    message: 'Fetch error',
                    error: error
                });
            });
    }
}

export { NotificationTool };
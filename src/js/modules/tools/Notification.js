import Modal from '../common/Modal';
import DOM from '../helpers/Browser/DOM';
import CONFIG from '../core/Config';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const NOTIFICATION_URL = 'https://raw.githubusercontent.com/qulle/notification-endpoints/main/endpoints/oltb.json';

class Notification extends Control {
    constructor() {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Bell,
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

        this.element.appendChild(button);
        this.notificationModal = undefined;

        window.addEventListener(EVENTS.Browser.KeyUp, (event) => {
            if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Notifications)) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
        if(this.notificationModal) {
            return;
        }

        this.fetchData();
    }

    fetchData() {
        this.notificationModal = Modal.create({
            title: 'Notifications',
            content: '<p>Loading notifications...</p>',
            onClose: () => {
                this.notificationModal = undefined;
            }
        });

        const timestamp = new Date().getTime().toString();

        fetch(NOTIFICATION_URL + '?cache=' + timestamp)
            .then((response) => {
                if(!response.ok) {
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
                        <a href="https://github.com/qulle/oltb/releases/tag/v${CONFIG.version}" target="_blank" class="oltb-link">
                            v${CONFIG.version}
                        </a>
                    </p>
                    <h3>🚀 Latest version</h3>
                    <p>
                        <a href="https://github.com/qulle/oltb/releases/tag/v${json.latest}" target="_blank" class="oltb-link">
                            v${json.latest} - ${new Date(json.released).toLocaleDateString(CONFIG.locale)}
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
                        <a href="https://github.com/qulle/oltb/releases/tag/v${CONFIG.version}" target="_blank" class="oltb-link">
                            v${CONFIG.version}
                        </a>
                    </p>
                    <h3>📡 Fetch error</h3>
                    <p>Data from the GitHub repo could not be fetched</p>
                `;

                this.notificationModal.setContent(content);
                console.error(`Fetch error [${error}]`);
            });
    }
}

export default Notification;
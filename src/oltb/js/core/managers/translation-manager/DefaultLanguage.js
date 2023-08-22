export const DefaultLanguage = Object.freeze({
    lang: {
        text: 'English',
        code: 'en-us'
    },
    managers: {

    },
    common: {
        functionButtons: {
            delete: 'Delete Marker',
            copyCoordinates: 'Copy Marker Coordinates',
            copyText: 'Copy Marker Text',
            edit: 'Edit Marker'
        }
    },
    tools: {
        hiddenAboutTool: {
            contextItems: {
                about: 'About OLTB'
            },
            modals: {
                about: {
                    title: 'About OLTB',
                    version: 'Version',
                    developedBy: 'Developed by Qulle',
                    usingOpenLayers: 'Using OpenLayers'
                }
            }
        },
        hiddenMapNavigationTool: {
            contextItems: {
                copy: 'Copy Coordinates',
                navigate: 'Navigate To',
                move: 'Center Here',
                focus: 'Focus Here'
            },
            toasts: {
                copied: {
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard'
                }
            }
        },
        hiddenMarkerTool: {
            contextItems: {
                createMarker: 'Create Marker'
            }
        }
    }
});
export const SvSe = Object.freeze({
    lang: {
        text: 'Swedish',
        code: 'sv-se'
    },
    managers: {

    },
    common: {
        functionButtons: {
            delete: 'Delete',
            rename: 'Rename',
            edit: 'Edit',
            download: 'Download',
            copyCoordinates: 'Copy Coordinates',
            copyText: 'Copy Text',
            zoomToCoordinates: 'Zoom To Coordinates',
            toggleVisibility: 'Toggle Visibility'
        },
        titles: {
            toggleSection: 'Toggle Section',
            dragToSort: 'Drag To Sort'
        }
    },
    modalExtensions: {
        coordinateModal: {
            title: 'Coordinates',
            form: {
                latitude: 'Latitude',
                longitude: 'Longitude',
                navigateTo: 'Navigate To',
                cancel: 'Cancel',
                description: 'Coordinates are given in WGS84/EPSG:4326'
            }
        },
        debugInfoModal: {
            title: 'Debug Information',
            noMapFound: 'No map reference found',
            form: {
                logToBrowser: 'Log Map To Browser Console',
                generateUUID: 'Generate UUID',
                clearLog: 'Clear Event Log',
                doAction: 'Do Action',
            },
            sections: {
                appData: 'App Data',
                browserData: 'Browser Data',
                localStorage: 'Local Storage',
                sessionStorage: 'Session Storage',
                cookies: 'Cookies',
                eventlog: 'Eventlog'
            },
            toasts: {
                logged: {
                    title: 'Logged',
                    message: 'Map object logged to console'
                },
                cleared: {
                    title: 'Cleared',
                    message: 'Event log was cleared of all entries'
                },
                geoLocationNotSupported: {
                    message: 'Geolocation is not supported'
                },
                geoSearching: {
                    title: 'Searching',
                    message: 'Trying to find your location...'
                }
            }
        },
        downloadLayerModal: {
            title: 'Download Layer',
            form: {
                layerFormat: 'Layer format',
                download: 'Download layer',
                cancel: 'Cancel'
            }
        },
        iconMarkerModal: {
            title: 'Marker Configuration',
            form: {
                title: 'Title',
                description: 'Description',
                icon: 'Icon',
                latitude: 'Latitude',
                longitude: 'Longitude',
                markerFill: 'Marker Fill',
                markerStroke: 'Marker Stroke',
                label: 'Label',
                labelFill: 'Label Fill',
                labelStrokeWidth: 'Label Stroke Width',
                labelStroke: 'Label Stroke',
                saveChanges: 'Save Changes',
                createMarker: 'Create Marker',
                cancel: 'Cancel'
            }
        },
        importLayerModal: {
            title: 'Import Layer',
            form: {
                featureProjection: 'Feature Projection',
                dataProjection: 'Data Projection',
                import: 'Import Layer',
                cancel: 'Cancel'
            }
        },
        layerModal: {
            title: 'Create Map Layer',
            form: {
                name: 'Name',
                layer: 'Layer',
                source: 'Source',
                projection: 'Projection',
                url: 'URL',
                parameters: 'Parameters (JSON)',
                wrapX: 'WrapX',
                cors: 'CORS',
                createLayer: 'Create Layer',
                cancel: 'Cancel'
            }
        },
        settingsModal: {
            title: 'Settings',
            form: {
                save: 'Save Settings',
                cancel: 'Cancel'
            }
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
        },
        bookmarkTool: {
            title: 'Bookmarks',
            toolbox: {
                titles: {
                    bookmarks: 'Bookmarks'
                },
                groups: {
                    addBookmark: {
                        placeholder: 'Bookmark Name',
                        add: 'Add Bookmark'
                    }
                }
            },
            contextItems: {
                addBookmark: 'Add Bookmark',
                clearBookmarks: 'Clear Bookmarks'
            },
            layers: {
                bookmarks: 'Bookmarks'
            },
            toasts: {
                cleared: {
                    title: 'Cleared',
                    message: 'All stored bookmarks was cleared'
                },
                created: {
                    title: 'New Bookmark',
                    message: 'A new Bookmark created'
                },
                copied: {
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard'
                },
                copyError: {
                    title: 'Error',
                    message: 'Failed to copy coordinates'
                }
            }
        },
        coordinatesTool: {
            title: 'Show Coordinates',
            toolbox: {
                titles: {
                    coordinates: 'Coordinates'
                },
                groups: {
                    formats: {
                        title: 'Format',
                        dd: 'Decimal Degrees',
                        dms: 'Degrees, Minutes, Seconds'
                    },
                    coordinates: {
                        title: 'Coordinates'
                    }
                }
            },
            settings: {
                copyOnClick: 'Copy Coordinates On Click',
                updateToolboxOnHover: 'Update Toolbox Coordinates When Hover'
            },
            toasts: {
                copied: {
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard'
                },
                copyError: {
                    title: 'Error',
                    message: 'Failed to copy coordinates'
                }
            }
        },
        debugInfoTool: {
            title: 'Debug Info'
        },
        directionTool: {
            titles: {
                horizontal: 'Horizontal Toolbar',
                vertical: 'Vertical Toolbar'
            }
        },
        drawTool: {
            title: 'Draw',
            toolbox: {
                titles: {
                    draw: 'Draw'
                },
                groups: {
                    shapes: {
                        title: 'Shape',
                        circle: 'Circle',
                        square: 'Square',
                        rectangle: 'Rectangle',
                        lineString: 'Line',
                        point: 'Point',
                        polygon: 'Polygon'
                    },
                    intersectable: {
                        title: 'Intersection',
                        true: 'True',
                        false: 'Fals'
                    },
                    strokeWidth: {
                        title: 'Stroke width'
                    },
                    strokeColor: {
                        title: 'Stroke Color'
                    },
                    fillColor: {
                        title: 'Fill Color'
                    }
                }
            },
            layers: {
                defaultName: 'Drawing layer'
            },
            toasts: {
                drawingInHiddenLayer: {
                    title: 'Tip',
                    message: 'You are drawing in a hidden layer'
                },
                noIntersecting: {
                    title: 'Oops',
                    message: 'No intersecting object found'
                }
            }
        },
        editTool: {
            title: 'Edit',
            toolbox: {
                titles: {
                    edit: 'Edit'
                },
                groups: {
                    misc: 'Misc',
                    shapes: 'Shapes',
                    strokeColor: 'Stroke Color',
                    fillColor: 'Fill Color'
                }
            },
            settings: {
                mouseOnlyToEditVectorShapes: 'Mouse Only To Edit Vector Shapes',
            },
            toasts: {
                noSelected: {
                    title: 'Oops',
                    message: 'No features selected to delete'
                },
                strictTwoShapes: {
                    title: 'Oops',
                    message: 'Strict two overlapping features must be selected'
                },
                shapeOperationError: {
                    title: 'Error',
                    message: 'Failed to perform shape operation'
                }
            },
            dialogs: {
                deleteFeatures: {
                    title: 'Delete Feature',
                    message: 'Delete selected feature',
                    confirmText: 'Delete'
                }
            }
        },
        exportPngTool: {
            title: 'Export PNG',
            toasts: {
                renderError: {
                    title: 'Error',
                    message: 'Failed to export canvas image'
                }
            }
        },
        fullscreenTool: {
            titles: {
                exit: 'Exit Fullscreen',
                enter: 'Enter Fullscreen'
            },
            toasts: {
                fullscreenNotSupported: {
                    title: 'Error',
                    message: 'Fullscreen is not supported by this browser'
                }
            }
        },
        graticuleTool: {
            title: 'Show Graticule'
        },
        helpTool: {
            title: 'Help',
            dialogs: {
                openHelp: {
                    title: 'Help Pages',
                    message: 'Browsers block automatic opening new windows, here is a button for you to press',
                    confirmText: 'Open Help'
                }
            },
            toasts: {
                blockedByBrowserError: {
                    title: 'Error',
                    message: 'Action was restricted by browser settings'
                }
            }
        },
        homeTool: {
            title: 'Zooma Hem',
            contextItems: {
                setHome: 'Sätt Hem'
            },
            toasts: {
                newHome: {
                    title: 'Ny Hem',
                    message: 'Ny plats sparad som Hem'
                }
            }
        },
        importVectorLayerTool: {
            title: 'Import Vector Layer',
            toasts: {
                unsupportedFormatError: {
                    title: 'Error',
                    message: 'The layer format is not supported'
                },
                importError: {
                    title: 'Error',
                    message: 'Failed to import vector layer'
                }
            }
        },
        infoTool: {
            title: 'Info'
        },
        layerTool: {
            title: 'Layers',
            toolbox: {
                titles: {
                    mapLayers: 'Map Layers',
                    featureLayers: 'Feature Layers'
                },
                groups: {
                    createMapLayer: {
                        create: 'Create Map Layer'
                    },
                    createFeatureLayer: {
                        placeholder: 'Layer Name', 
                        create: 'Create Feature Layer'
                    }
                }
            },
            contextItems: {
                addMapLayer: 'Add Map Layer',
                addFeatureLayer: 'Add Feature Layer'
            },
            toasts: {
                newLayer: {
                    title: 'New Layer',
                    message: 'A new Feature layer created'
                },
                missingProjectionError: {
                    title: 'Error',
                    message: 'Missing projection definition'
                },
                newLayerError: {
                    title: 'Error',
                    message: 'Failed to create new layer'
                },
                unsupportedFormatError: {
                    title: 'Error',
                    message: 'The layer format is not supported'
                }
            },
            dialogs: {
                renameLayer: {
                    title: 'Edit Name',
                    message: 'Edit name for layer',
                    confirmText: 'Rename'
                },
                deleteLayer: {
                    title: 'Delete Layer',
                    message: 'Do you want to delete layer',
                    confirmText: 'Delete'
                }
            }
        },
        magnifyTool: {
            title: 'Magnify',
            toasts: {
                unexpectedError: {
                    title: 'Error',
                    message: 'Unexpected error using magnifyer',
                    corsMessage: 'CORS error with one of the layers'
                }
            }
        },
        measureTool: {
            title: 'Measure',
            toolbox: {
                titles: {
                    measure: 'Measure'
                },
                groups: {
                    type: {
                        title: 'Type',
                        lineString: 'Length',
                        polygon: 'Area'
                    },
                    strokeColor: {
                        title: 'Stroke Color'
                    },
                    fillColor: {
                        title: 'Fill Color'
                    }
                }
            },
            layers: {
                defaultName: 'Measurements layer'
            },
            toasts: {
                measuringInHiddenLayer: {
                    title: 'Tip',
                    message: 'You are measuring in a hidden layer'
                }
            }
        },
        myLocationTool: {
            title: 'My Location',
            dialogs: {
                exitFullscreen: {
                    title: 'Exit Fullscreen',
                    message: 'To use geolocation you must exit fullscreen',
                    confirmText: 'Exit Fullscreen'
                }
            },
            toasts: {
                exitFullscreenError: {
                    title: 'Error',
                    message: 'Error exiting fullscreen'
                },
                locationError: {
                    title: 'Error'
                }
            }
        },
        notificationTool: {
            title: 'Notifications',
            modals: {
                notifications: {
                    title: 'Notifications',
                    content: 'Loading notifications...',
                    from: 'From Qulle',
                    yourVersion: 'Your Version',
                    latestVersion: 'Latest Version',
                    news: 'New Features Under Development',
                    noNews: 'No features currently under development'
                }
            },
            toasts: {
                fetchError: {
                    title: 'Error',
                    message: 'Failed to fetch notifications'
                }
            }
        },
        overviewTool: {
            title: 'Map Overview',
            toolbox: {
                titles: {
                    overview: 'Map Overview'
                }
            }
        },
        refreshTool: {
            title: 'Refresh Page'
        },
        resetNorthTool: {
            title: 'Reset North',
            contextItems: {
                rotate: 'Rotate Map'
            },
            dialogs: {
                rotateMap: {
                    title: 'Rotate Map',
                    message: 'Set map rotation by degrees',
                    confirmText: 'Rotate Map'
                }
            },
            toasts: {
                invalidInput: {
                    title: 'Error',
                    message: 'Only digits are allowed as input'
                }
            }
        },
        scaleLineTool: {
            title: 'Scale Line'
        },
        scissorsTool: {
            title: 'Polygon Scissors',
            toasts: {
                noIntersecting: {
                    title: 'Oops',
                    message: 'No intersecting object found'
                }
            }
        },
        settingsTool: {
            title: 'Settings',
            contextItems: {
                clearBrowserState: 'Clear Browser State'
            },
            dialogs: {
                clearBrowserState: {
                    title: 'Clear Browser State',
                    message: 'Do you want to reset all items to default state for the Toolbar?',
                    confirmText: 'Clear'
                }
            },
            toasts: {
                cleared: {
                    title: 'Cleared',
                    message: 'All stored items was reset to default'
                },
                saved: {
                    title: 'Saved',
                    message: 'All settings was saved'
                }
            }
        },
        splitViewTool: {
            title: 'Split View',
            toolbox: {
                titles: {
                    splitView: 'Split View'
                },
                groups: {
                    leftSide: {
                        title: 'Left Side'
                    },
                    rightSide: {
                        title: 'Right Side'
                    },
                    swapSides: {
                        swap: 'Swap Sides'
                    }
                },
                toasts: {
                    onlyOneLayer: {
                        title: 'Tip',
                        message: 'You must have more then one layer'
                    },
                    layerError: {
                        title: 'Error',
                        message: 'One or both of the layers could not be loaded'
                    }
                }
            }
        },
        themeTool: {
            titles: {
                light: 'Light Theme',
                dark: 'Dark Theme'
            }
        },
        translationTool: {
            title: 'Translate',
            dialogs: {
                changeLanguage: {
                    title: 'Change Language',
                    message: 'Current language is',
                    confirmText: 'Translate'
                }
            }
        },
        zoomBoxTool: {
            title: 'Zoom Box',
            tooltips: {
                dragToZoom: 'Drag To Zoom'
            }
        },
        zoomInTool: {
            title: 'Zoom In'
        },
        zoomOutTool: {
            title: 'Zoom Out'
        }
    }
});
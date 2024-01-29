const DefaultIconMarkerOptions = Object.freeze({
    lon: undefined,
    lat: undefined,
    infoWindow: undefined,
    title: '',
    description: '',
    settings: Object.freeze({
        shouldReplaceHashtag: true
    }),
    marker: Object.freeze({
        width: 14,
        radius: 14,
        fill: '#0166A5FF',
        stroke: '#0166A566',
        strokeWidth: 2
    }),
    icon: Object.freeze({
        key: 'geoPin.filled',
        width: 14,
        height: 14,
        rotation: 0,
        fill: '#FFFFFFFF',
        stroke: '#FFFFFFFF',
        strokeWidth: 0
    }),
    label: Object.freeze({
        text: '',
        font: '14px Calibri',
        fill: '#FFFFFFFF',
        stroke: '#3B4352CC',
        strokeWidth: 8,
        useEllipsisAfter: 20,
        useUpperCase: false
    })
});

export { DefaultIconMarkerOptions };
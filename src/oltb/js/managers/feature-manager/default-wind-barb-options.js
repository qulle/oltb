const DefaultWindBarbOptions = Object.freeze({
    lon: undefined,
    lat: undefined,
    infoWindow: undefined,
    title: '',
    description: '',
    settings: Object.freeze({
        shouldReplaceHashtag: true
    }),
    icon: Object.freeze({
        key: 0,
        width: 200,
        height: 200,
        rotation: 0,
        fill: '#3B4352FF',
        stroke: '#3B4352FF',
        strokeWidth: 3
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

export { DefaultWindBarbOptions };
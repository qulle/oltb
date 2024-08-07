const flattenGeometryCoordinates = function(coordinates) {
    function flatten(children) {
        return children.reduce((accumulator, value) => Array.isArray(value) 
            ? accumulator.concat(flatten(value)) 
            : accumulator.concat(value), []);
    }

    const flattened = flatten(coordinates);
    const result = [];

    for(let i = 0; i < flattened.length; i += 2) {
        result.push([flattened[i], flattened[i + 1]]);
    }

    return result;
}

export { flattenGeometryCoordinates };
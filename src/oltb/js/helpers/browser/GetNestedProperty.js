const FILENAME = 'browser/GetNestedProperty.js';
const EMPTY = 0;

const getNestedProperty = (obj, prop, ...rest) => {
    if(obj === undefined) {
        return undefined;
    }

    if(
        rest.length === EMPTY &&
        Object.prototype.hasOwnProperty.call(obj, prop)
    ) {
        return obj[prop];
    }

    return getNestedProperty(obj[prop], ...rest);
}

const getCustomFeatureProperty = function(obj, ...props) {
    return getNestedProperty(obj, 'oltb', props);
}

export { getNestedProperty, getCustomFeatureProperty };
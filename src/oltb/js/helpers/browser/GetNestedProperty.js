const FILENAME = 'browser/GetNestedProperty.js';

const getNestedProperty = (obj, prop, ...rest) => {
    if(obj === undefined) {
        return undefined;
    }

    if(
        rest.length === 0 &&
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
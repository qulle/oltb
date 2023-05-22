const FILENAME = 'browser/HasNestedProperty.js';
const EMPTY = 0;

const hasNestedProperty = (obj, prop, ...rest) => {
    if(obj === undefined) {
        return false;
    }

    if(
        rest.length === EMPTY &&
        Object.prototype.hasOwnProperty.call(obj, prop)
    ) {
        return true;
    }

    return hasNestedProperty(obj[prop], ...rest);
}

const hasCustomFeatureProperty = function(obj, ...props) {
    return hasNestedProperty(obj, 'oltb', props);
}

export { hasNestedProperty, hasCustomFeatureProperty };
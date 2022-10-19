const hasNestedProperty = (obj, prop, ...rest) => {
    if(obj === undefined) {
        return false;
    }

    if(
        rest.length === 0 &&
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
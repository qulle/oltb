const hasNestedProperty = (obj, prop, ...restProps) => {
    if(obj === undefined) {
        return false;
    }

    if(
        restProps.length === 0 &&
        Object.prototype.hasOwnProperty.call(obj, prop)
    ) {
        return true;
    }

    return hasNestedProperty(obj[prop], ...restProps);
}

export { hasNestedProperty };
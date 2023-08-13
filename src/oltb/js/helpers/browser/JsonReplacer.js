// Note: Some objects have properties that we don't want to serialize due to size
// Example: Bookmarks have a reference to the marker on the Map
const IgnoredKeys = Object.freeze([
    'marker'
]);

const jsonReplacer = function(key, value) {
    if(IgnoredKeys.includes(key)) {
        return undefined;
    }

    if(value instanceof Error) {
        // Known properties from Error object
        // Native JS errors that inherits from Error
        return {
            name: value.name,
            message: value.message,
            fileName: value.fileName,
            lineNumber: value.lineNumber,
            columnNumber: value.columnNumber,
            stack: value.stack.split('\n').filter(element => element),
            cause: value.cause
        };
    }
    
    if(value instanceof Response) {
        // Known properties from Response object
        // Might bee a bad Fetch call that was thrown as an Error, contained inside cause property
        return {
            ok: value.ok,
            redirect: value.redirect,
            status: value.status,
            statusText: value.statusText,
            type: value.type,
            url: value.url
        };
    }
    
    // Normal anonymous object or number/literal
    return value;
}

export { jsonReplacer };
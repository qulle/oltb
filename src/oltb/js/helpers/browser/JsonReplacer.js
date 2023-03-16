const jsonReplacer = function(key, value) {
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
    
    // Normal anonymous object
    return value;
}

export { jsonReplacer };
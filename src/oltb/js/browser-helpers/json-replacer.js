import { IgnoredKeys } from "../browser-constants/ignored-keys";

const jsonReplacer = function(key, value) {
    if(IgnoredKeys.includes(key)) {
        return undefined;
    }

    if(value instanceof Error) {
        // Note:
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
        // Note:
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
    
    // Note:
    // Normal anonymous object or number/literal
    return value;
}

export { jsonReplacer };
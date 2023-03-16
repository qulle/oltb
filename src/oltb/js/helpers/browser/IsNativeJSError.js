const isNativeJSError = function(error) {
    const nativeErrors = [
        RangeError, 
        ReferenceError, 
        SyntaxError, 
        TypeError, 
        URIError, 
        EvalError, 
        InternalError,
        Response,
        DOMException,
        Error
    ];

    let result = false;
    nativeErrors.forEach((nativeError) => {
        if(error instanceof nativeError) {
            result = true;
        }
    });

    return result;
}

export { isNativeJSError };
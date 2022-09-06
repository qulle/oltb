// Expand with custom prototype features. 
// Use with caution so as not to risk defining your own features that could cause problems with future versions of JavaScript. 

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.isDigitsOnly = function() {
    return this.match(/^-?[0-9]+$/) != null;
}

String.prototype.ellipsis = function(limit) {
    return this.length > limit ? this.substring(0, limit) + '...' : this;
}
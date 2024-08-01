// Plain JS SlideToggle
// https://github.com/ericbutler555/plain-js-slidetoggle

HTMLElement.prototype.slideToggle = function(duration, callback) {
    if(this.clientHeight === 0) {
        slideToggle(this, duration, callback, true);
    }else {
        slideToggle(this, duration, callback);
    }
};

HTMLElement.prototype.slideUp = function(duration, callback) {
    slideToggle(this, duration, callback);
};

HTMLElement.prototype.slideDown = function(duration, callback) {
    slideToggle(this, duration, callback, true);
};

const slideToggle = function(el, duration, callback, isDown) {
    if(typeof duration === 'undefined') {
        duration = 200;
    }

    if(typeof isDown === 'undefined') {
        isDown = false;
    }
  
    // Note:
    // Fix to avoid jumping behaviour if no content is present
    const hasContentHeight = parseFloat(window.getComputedStyle(el).getPropertyValue('height'));
    if(hasContentHeight === 0) {
        return;
    }

    el.style.overflow = 'hidden';
    
    if(isDown) {
        el.style.display = 'block';
    }
  
    const elStyles = window.getComputedStyle(el);
  
    const elHeight        = parseFloat(elStyles.getPropertyValue('height'));
    const elPaddingTop    = parseFloat(elStyles.getPropertyValue('padding-top'));
    const elPaddingBottom = parseFloat(elStyles.getPropertyValue('padding-bottom'));
    const elMarginTop     = parseFloat(elStyles.getPropertyValue('margin-top'));
    const elMarginBottom  = parseFloat(elStyles.getPropertyValue('margin-bottom'));

    const stepHeight        = elHeight        / duration;
    const stepPaddingTop    = elPaddingTop    / duration;
    const stepPaddingBottom = elPaddingBottom / duration;
    const stepMarginTop     = elMarginTop     / duration;
    const stepMarginBottom  = elMarginBottom  / duration;
  
    let start;
  
    const step = function(timestamp) {
        if(start === undefined) {
            start = timestamp;
        }
  
        const elapsed = timestamp - start;
  
        if(isDown) {
            el.style.height        = `${(stepHeight        * elapsed)}px`;
            el.style.paddingTop    = `${(stepPaddingTop    * elapsed)}px`;
            el.style.paddingBottom = `${(stepPaddingBottom * elapsed)}px`;
            el.style.marginTop     = `${(stepMarginTop     * elapsed)}px`;
            el.style.marginBottom  = `${(stepMarginBottom  * elapsed)}px`;
        }else {
            el.style.height        = `${elHeight        - (stepHeight        * elapsed)}px`;
            el.style.paddingTop    = `${elPaddingTop    - (stepPaddingTop    * elapsed)}px`;
            el.style.paddingBottom = `${elPaddingBottom - (stepPaddingBottom * elapsed)}px`;
            el.style.marginTop     = `${elMarginTop     - (stepMarginTop     * elapsed)}px`;
            el.style.marginBottom  = `${elMarginBottom  - (stepMarginBottom  * elapsed)}px`;
        }
  
        if(elapsed >= duration) {
            el.style.height        = '';
            el.style.paddingTop    = '';
            el.style.paddingBottom = '';
            el.style.marginTop     = '';
            el.style.marginBottom  = '';
            el.style.overflow      = '';
            
            if(!isDown) {
                el.style.display = 'none';
            }

            if(callback instanceof Function) {
                callback(!isDown);
            }
        }else {
            window.requestAnimationFrame(step);
        }
    }

    window.requestAnimationFrame(step);
}
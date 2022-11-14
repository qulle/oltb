import Toaster from './toasts/Toaster';

class Toast {
    static info(options) {
        return new Toaster({ ...options, type: Toaster.Info });
    }

    static warning(options) {
        return new Toaster({ ...options, type: Toaster.Warning });
    }

    static success(options) {
        return new Toaster({ ...options, type: Toaster.Success });
    }

    static error(options) {
        return new Toaster({ ...options, type: Toaster.Error });
    }
}

export default Toast;
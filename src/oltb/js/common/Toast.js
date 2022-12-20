import { ToastBase } from './toasts/ToastBase';

class Toast {
    static info(options) {
        return new ToastBase({ ...options, type: ToastBase.Info });
    }

    static warning(options) {
        return new ToastBase({ ...options, type: ToastBase.Warning });
    }

    static success(options) {
        return new ToastBase({ ...options, type: ToastBase.Success });
    }

    static error(options) {
        return new ToastBase({ ...options, type: ToastBase.Error });
    }
}

export { Toast };
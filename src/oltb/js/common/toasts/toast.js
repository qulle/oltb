import { BaseToast } from './base-toast';

class Toast {
    static info(options) {
        return new BaseToast({...options, type: BaseToast.Info});
    }

    static warning(options) {
        return new BaseToast({...options, type: BaseToast.Warning});
    }

    static success(options) {
        return new BaseToast({...options, type: BaseToast.Success});
    }

    static error(options) {
        return new BaseToast({...options, type: BaseToast.Error});
    }
}

export { Toast };
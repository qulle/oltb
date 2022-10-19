class StateManager {
    static runtimeState = JSON.parse(localStorage.getItem('oltb-state')) || {};

    static updateStateObject(name, value) {
        this.runtimeState[name] = value;
        this.saveState();
    }

    static getStateObject(name) {
        if(name in this.runtimeState) {
            return this.runtimeState[name];
        }
        
        return null;
    }

    static saveState() {
        localStorage.setItem('oltb-state', JSON.stringify(this.runtimeState));
    }

    static clear() {
        this.runtimeState = {};
        localStorage.clear();
    }
}

export default StateManager;
class StateManager {
    static internalState = JSON.parse(localStorage.getItem('oltb-state')) || {};

    static updateStateObject(name, value) {
        this.internalState[name] = value;
        this.saveState();
    }

    static getStateObject(name) {
        if(name in this.internalState) {
            return this.internalState[name];
        }
        
        return null;
    }

    static saveState() {
        localStorage.setItem('oltb-state', JSON.stringify(this.internalState));
    }

    static clear() {
        this.internalState = {};
        localStorage.clear();
    }
}

export default StateManager;
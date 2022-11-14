class ToolManager {
    static tool;

    static init(map) {
        // Note: Not used in this Manager
    }

    static setActiveTool(tool) {
        if(this.tool && this.tool !== tool) {
            this.tool.deSelect();
        }

        this.tool = tool;
    }

    static getActiveTool() {
        return this.tool;
    }

    static hasActiveTool() {
        return this.tool !== undefined;
    }

    static removeActiveTool() {
        this.tool = undefined;
    }
}

export default ToolManager;
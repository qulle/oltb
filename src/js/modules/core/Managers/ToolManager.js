class ToolManager {
    static tool;

    static setActiveTool(tool) {
        if(this.tool && this.tool !== tool) {
            this.tool.deSelect();
        }

        this.tool = tool;
    }

    static getActiveTool() {
        return this.tool;
    }

    static removeActiveTool() {
        this.tool = undefined;
    }
}

export default ToolManager;
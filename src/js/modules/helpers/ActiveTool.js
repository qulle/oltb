const setActiveTool = function(tool) {
    // Check if there is a tool already in use that needs to be deselected
    const activeTool = window?.oltb?.activeTool; 
    if(activeTool && activeTool !== tool) {
        activeTool.deSelect();
    }

    // Set this tool as the active global tool
    window.oltb = window.oltb || {};
    window.oltb['activeTool'] = tool;
}

export { setActiveTool };
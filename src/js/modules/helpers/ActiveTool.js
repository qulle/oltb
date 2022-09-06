// Some tools cannot be used at the same time. 
// Check for a reference to such a tool and disable it before enabling the new one.

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
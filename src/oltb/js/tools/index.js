import { HomeTool } from './HomeTool';
import { DrawTool } from './DrawTool';
import { EditTool } from './EditTool';
import { InfoTool } from './InfoTool';
import { HelpTool } from './HelpTool';
import { ThemeTool } from './ThemeTool';
import { LayerTool } from './LayerTool';
import { ZoomInTool } from './ZoomInTool';
import { MeasureTool } from './MeasureTool';
import { MagnifyTool } from './MagnifyTool';
import { ZoomOutTool } from './ZoomOutTool';
import { ZoomboxTool } from './ZoomboxTool';
import { ToolboxTool } from './ToolboxTool';
import { RefreshTool } from './RefreshTool';
import { SettingsTool } from './SettingsTool';
import { OverviewTool } from './OverviewTool';
import { ScissorsTool } from './ScissorsTool';
import { BookmarkTool } from './BookmarkTool';
import { DirectionTool } from './DirectionTool';
import { DebugInfoTool } from './DebugInfoTool';
import { SplitViewTool } from './SplitViewTool';
import { ExportPngTool } from './ExportPngTool';
import { ScaleLineTool } from './ScaleLineTool';
import { GraticuleTool } from './GraticuleTool';
import { MyLocationTool } from './MyLocationTool';
import { ResetNorthTool } from './ResetNorthTool';
import { FullscreenTool } from './FullscreenTool';
import { CoordinatesTool } from './CoordinatesTool';
import { TranslationTool } from './TranslationTool';
import { HiddenAboutTool } from './hidden-tools/HiddenAboutTool';
import { HiddenMarkerTool } from './hidden-tools/HiddenMarkerTool';
import { ImportVectorLayerTool } from './ImportVectorLayerTool';
import { HiddenMapNavigationTool } from './hidden-tools/HiddenMapNavigationTool';

// Note: 
// The order decides order in the Toolbar
const AllTools = Object.freeze({
    HiddenMarkerTool,
    HiddenMapNavigationTool,
    HomeTool,
    ZoomInTool,
    ZoomOutTool,
    ZoomboxTool,
    FullscreenTool,
    ExportPngTool,
    DrawTool,
    MeasureTool,
    EditTool,
    ScissorsTool,
    BookmarkTool,
    LayerTool,
    SplitViewTool,
    OverviewTool,
    GraticuleTool,
    MagnifyTool,
    ResetNorthTool,
    CoordinatesTool,
    MyLocationTool,
    ImportVectorLayerTool,
    ScaleLineTool,
    RefreshTool,
    ThemeTool,
    DirectionTool,
    ToolboxTool,
    InfoTool,
    TranslationTool,
    HelpTool,
    SettingsTool,
    DebugInfoTool,
    HiddenAboutTool
});

export { AllTools };
import { HomeTool } from './home-tool/home-tool';
import { DrawTool } from './draw-tool/draw-tool';
import { EditTool } from './edit-tool/edit-tool';
import { InfoTool } from './info-tool/info-tool';
import { HelpTool } from './help-tool/help-tool';
import { ThemeTool } from './theme-tool/theme-tool';
import { LayerTool } from './layer-tool/layer-tool';
import { ZoomInTool } from './zoom-in-tool/zoom-in-tool';
import { MeasureTool } from './measure-tool/measure-tool';
import { MagnifyTool } from './magnify-tool/magnify-tool';
import { ZoomOutTool } from './zoom-out-tool/zoom-out-tool';
import { ZoomboxTool } from './zoombox-tool/zoombox-tool';
import { ToolboxTool } from './toolbox-tool/toolbox-tool';
import { RefreshTool } from './refresh-tool/refresh-tool';
import { SettingsTool } from './settings-tool/settings-tool';
import { OverviewTool } from './overview-tool/overview-tool';
import { ScissorsTool } from './scissors-tool/scissors-tool';
import { BookmarkTool } from './bookmark-tool/bookmark-tool';
import { DirectionTool } from './direction-tool/direction-tool';
import { DebugInfoTool } from './debug-info-tool/debug-info-tool';
import { SplitViewTool } from './split-view-tool/split-view-tool';
import { ExportPngTool } from './export-png-tool/export-png-tool';
import { ScaleLineTool } from './scale-line-tool/scale-line-tool';
import { GraticuleTool } from './graticule-tool/graticule-tool';
import { MyLocationTool } from './my-location-tool/my-location-tool';
import { ResetNorthTool } from './reset-north-tool/reset-north-tool';
import { FullscreenTool } from './fullscreen-tool/fullscreen-tool';
import { CoordinatesTool } from './coordinates-tool/coordinates-tool';
import { TranslationTool } from './translation-tool/translation-tool';
import { HiddenAboutTool } from './hidden-about-tool/hidden-about-tool';
import { ContextMenuTool } from './context-menu-tool/context-menu-tool';
import { HiddenMarkerTool } from './hidden-marker-tool/hidden-marker-tool';
import { ImportVectorLayerTool } from './import-vector-layer-tool/import-vector-layer-tool';
import { HiddenMapNavigationTool } from './hidden-map-navigation-tool/hidden-map-navigation-tool';

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
    HiddenAboutTool,
    ContextMenuTool
});

export { AllTools };
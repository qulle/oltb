import HomeTool from './HomeTool';
import DrawTool from './DrawTool';
import EditTool from './EditTool';
import InfoTool from './InfoTool';
import HelpTool from './HelpTool';
import ThemeTool from './ThemeTool';
import LayerTool from './LayerTool';
import ZoomInTool from './ZoomInTool';
import MeasureTool from './MeasureTool';
import MagnifyTool from './MagnifyTool';
import ZoomOutTool from './ZoomOutTool';
import RefreshTool from './RefreshTool';
import SettingsTool from './SettingsTool';
import OverviewTool from './OverviewTool';
import BookmarkTool from './BookmarkTool';
import DirectionTool from './DirectionTool';
import DebugInfoTool from './DebugInfoTool';
import SplitViewTool from './SplitViewTool';
import ExportPNGTool from './ExportPNGTool';
import ScaleLineTool from './ScaleLineTool';
import GraticuleTool from './GraticuleTool';
import MyLocationTool from './MyLocationTool';
import ResetNorthTool from './ResetNorthTool';
import FullscreenTool from './FullscreenTool';
import CoordinateTool from './CoordinateTool';
import HiddenAboutTool from './hidden-tools/AboutTool';
import NotificationTool from './NotificationTool';
import HiddenMarkerTool from './hidden-tools/MarkerTool';
import ImportVectorLayerTool from './ImportVectorLayerTool';
import HiddenMapNavigationTool from './hidden-tools/MapNavigationTool';

// The order decides order in the Toolbar
const ALL_TOOLS = {
    HiddenMarkerTool,
    HiddenMapNavigationTool,
    HomeTool,
    ZoomInTool,
    ZoomOutTool,
    FullscreenTool,
    ExportPNGTool,
    DrawTool,
    MeasureTool,
    EditTool,
    BookmarkTool,
    LayerTool,
    SplitViewTool,
    OverviewTool,
    GraticuleTool,
    MagnifyTool,
    ResetNorthTool,
    CoordinateTool,
    MyLocationTool,
    ImportVectorLayerTool,
    ScaleLineTool,
    RefreshTool,
    ThemeTool,
    DirectionTool,
    InfoTool,
    NotificationTool,
    HelpTool,
    SettingsTool,
    DebugInfoTool,
    HiddenAboutTool
};

export default ALL_TOOLS;
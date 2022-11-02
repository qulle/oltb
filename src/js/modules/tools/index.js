import HiddenMarkerTool from './hidden-tools/MarkerTool';
import HiddenMapNavigationTool from './hidden-tools/MapNavigationTool';
import HomeTool from './HomeTool';
import ZoomInTool from './ZoomInTool';
import ZoomOutTool from './ZoomOutTool';
import FullscreenTool from './FullscreenTool';
import ExportPNGTool from './ExportPNGTool';
import DrawTool from './DrawTool';
import MeasureTool from './MeasureTool';
import EditTool from './EditTool';
import BookmarkTool from './BookmarkTool';
import LayerTool from './LayerTool';
import SplitViewTool from './SplitViewTool';
import OverviewTool from './OverviewTool';
import GraticuleTool from './GraticuleTool';
import MagnifyTool from './MagnifyTool';
import ResetNorthTool from './ResetNorthTool';
import CoordinatesTool from './CoordinatesTool';
import MyLocationTool from './MyLocationTool';
import ImportVectorLayerTool from './ImportVectorLayerTool';
import ScaleLineTool from './ScaleLineTool';
import RefreshTool from './RefreshTool';
import ThemeTool from './ThemeTool';
import DirectionTool from './DirectionTool';
import InfoTool from './InfoTool';
import NotificationTool from './NotificationTool';
import HelpTool from './HelpTool';
import SettingsTool from './SettingsTool';
import DebugInfoTool from './DebugInfoTool';
import HiddenAboutTool from './hidden-tools/AboutTool';

const ALL_TOOLS = [
    {
        name: 'HiddenMarkerTool',
        tool: HiddenMarkerTool
    },
    {
        name: 'HiddenMapNavigationTool',
        tool: HiddenMapNavigationTool
    },
    {
        name: 'HomeTool',
        tool: HomeTool
    },
    {
        name: 'ZoomInTool',
        tool: ZoomInTool
    },
    {
        name: 'ZoomOutTool',
        tool: ZoomOutTool
    },
    {
        name: 'FullscreenTool',
        tool: FullscreenTool
    },
    {
        name: 'ExportPNGTool',
        tool: ExportPNGTool
    },
    {
        name: 'DrawTool',
        tool: DrawTool
    },
    {
        name: 'MeasureTool',
        tool: MeasureTool
    },
    {
        name: 'EditTool',
        tool: EditTool
    },
    {
        name: 'BookmarkTool',
        tool: BookmarkTool
    },
    {
        name: 'LayerTool',
        tool: LayerTool
    },
    {
        name: 'SplitViewTool',
        tool: SplitViewTool
    },
    {
        name: 'OverviewTool',
        tool: OverviewTool
    },
    {
        name: 'GraticuleTool',
        tool: GraticuleTool
    },
    {
        name: 'MagnifyTool',
        tool: MagnifyTool
    },
    {
        name: 'ResetNorthTool',
        tool: ResetNorthTool
    },
    {
        name: 'CoordinatesTool',
        tool: CoordinatesTool
    },
    {
        name: 'MyLocationTool',
        tool: MyLocationTool
    },
    {
        name: 'ImportVectorLayerTool',
        tool: ImportVectorLayerTool
    },
    {
        name: 'ScaleLineTool',
        tool: ScaleLineTool
    },
    {
        name: 'RefreshTool',
        tool: RefreshTool
    },
    {
        name: 'ThemeTool',
        tool: ThemeTool
    },
    {
        name: 'DirectionTool',
        tool: DirectionTool
    },
    {
        name: 'InfoTool',
        tool: InfoTool
    },
    {
        name: 'NotificationTool',
        tool: NotificationTool
    },
    {
        name: 'HelpTool',
        tool: HelpTool
    },
    {
        name: 'SettingsTool',
        tool: SettingsTool
    },
    {
        name: 'DebugInfoTool',
        tool: DebugInfoTool
    },
    {
        name: 'HiddenAboutTool',
        tool: HiddenAboutTool
    }
];

export default ALL_TOOLS;
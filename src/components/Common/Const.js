export const TEXT = "TEXT"
export const EMAIL = "EMAIL"
export const SWITCH = "SWITCH"
export const COUNTER = "COUNTER"
export const SELECT = "SELECT"
export const RADIO_BUTTON = "RADIO_BUTTON"
export const MULTI_SELECT = "MULTI_SELECT"
export const TEXT_AREA = "TEXT_AREA"
export const FILE_TYPE = "FILE_TYPE"
export const IMAGE = "IMAGE"
export const DATE_TIME_PICKER = "DATE_TIME_PICKER"
export const TEXT_EDITOR = "TEXT_EDITOR"
export const SAVE = "SAVE"
export const SAVE_AND_CLOSE = "SAVE_AND_CLOSE"
export const SAVE_AND_NEW = "SAVE_AND_NEW"
export const SAVE_AND_NEXT = "SAVE_AND_NEXT"
export const DIVIDER = "DIVIDER"
export const ERROR = "ERROR"
export const SUCCESS = "SUCCESS"
export const TEXT_BUTTON = "TEXT_BUTTON"
export const LABEL_PARTATION = "LABEL_PARTATION"
export const BUTTON = "BUTTON"

// Tab names
export const TAB_TABS = "Tabs"
export const TAB_ROLES = "Roles"
export const TAB_USERS = "Users"
export const TAB_EVENT_TYPES = "Event Types"
export const TAB_PLAYERS = "Players"
export const TAB_TEAMS = "Teams"
export const TAB_MATCH_TYPE = "Match Types"
export const TAB_PANELTY_RUNS = "Penalty Runs"
export const TAB_COMMENTARY = "Commentary"
export const TAB_COMPETITION = "Competition"
export const TAB_EVENT = "Events"
export const TAB_CONFIG = "Config"
export const TAB_BLOCKS = "Blocks"
export const TAB_PAGE_FORMAT = "Page Format"
export const TAB_PAGE = "Page"
export const TAB_IMPORT_MARKET = "Import Market"
export const Tab_Menu_List = "Menu List"
export const TAB_NEWS = "News"
export const TAB_SUBSCRIBERS = "Subscribers"
export const TAB_MARKET_TEMPLATE = "Market Template"
export const TAB_EVENT_MARKETS = "Event Markets"
export const TAB_SET_MARKETS_RESULT = "Set Market Result"
// Permission Type
export const PERMISSION_ADD = "isAdd"
export const PERMISSION_EDIT = "isEdit"
export const PERMISSION_DELETE = "isDelete"
export const PERMISSION_VIEW = "isView"

export const LOGOUT = "/logout"
export const REMEMBER_ME_KEY = "rememberMe"
export const USER_DATA_KEY = "userData"

// Commentary 
export const COMMENTARY_TOSS_SCREEN = "COMMENTARY_TOSS_SCREEN"
export const COMMENTARY_PLAYER_SELECTION_SCREEN = "COMMENTARY_PLAYER_SELECTION_SCREEN"
export const COMMENTARY_MAIN_SCREEN = "COMMENTARY_MAIN_SCREEN"
// export const COMMENTARY_TOSS = "COMMENTARY_TOSS"

export const BATTING_STATUS = 1
export const BALLING_STATUS = 2

export const STRING_SEPERATOR = "_##_"
export const CONTENT_IMAGE_TYPE = {
    BLOCKS: "Blocks"
}

export const ckeditor5ToolbarItems = [
    'undo', 'redo',
    '|',
    'exportPdf', 'exportWord', 'importWord',
    '|',
    'showBlocks', 'formatPainter', 'findAndReplace', 'selectAll', 'wproofreader',
    '|',
    'heading',
    '|',
    'style',
    '|',
    'fontSize', 'fontFamily',
    {
        label: 'Font color',
        icon: 'plus',
        items: ['fontColor', 'fontBackgroundColor']
    },
    '|',
    'caseChange',
    '-',
    'bold', 'italic', 'underline',
    {
        label: 'Formatting',
        icon: 'text',
        items: ['strikethrough', 'subscript', 'superscript', 'code', 'horizontalLine', '|', 'removeFormat']
    },
    'specialCharacters', 'pageBreak',
    '|',
    'link', 'insertImage', 'ckbox', 'insertTable', 'tableOfContents', 'insertTemplate',
    {
        label: 'Insert',
        icon: 'plus',
        items: ['highlight', 'blockQuote', 'mediaEmbed', 'codeBlock', 'htmlEmbed']
    },
    '|',
    'alignment',
    '|',
    'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent',
    '|',
    'sourceEditing'
]

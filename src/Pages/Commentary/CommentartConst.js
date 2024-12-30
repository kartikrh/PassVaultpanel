// Team Status
export const BAT = 1;
export const BOWL = 2;
export const TOSS_SELECTION = {
    1: "Bat",
    2: "Bowl"
}
// Ball Type
export const BALL_TYPE_OVER_COMPLETE = 0;
export const BALL_TYPE_REGULAR = 1;
export const BALL_TYPE_WIDE = 2;
export const BALL_TYPE_BYE = 3;
export const BALL_TYPE_LEG_BYE = 4;
export const BALL_TYPE_NO_BALL = 5;
export const BALL_TYPE_NO_BALL_BYE = 6;
export const BALL_TYPE_NO_BALL_LEG_BYE = 7;
export const BALL_TYPE_PANELTY_RUN = 8;
export const BALL_TYPE_RETIRED_HURT = 9;
export const BALL_TYPE_BOWLER_RETIRED_HURT = 10;

export const LATEST_BALLS_TO_FIND_BALL_HISTORY = 30
// Out Type
export const BOLD = 1;
export const BOLD_LABEL = "Bowled";
export const CATCH = 2;
export const CATCH_LABEL = "Catch";
export const STUMP = 3;
export const STUMP_LABEL = "Stump";
export const HIT_WICKET = 4;
export const HIT_WICKET_LABEL = "Hit Wicket";
export const LBW = 5;
export const LBW_LABEL = "LBW";
export const RUN_OUT = 6;
export const RUN_OUT_LABEL = "Run Out";
export const RETIRED_OUT = 7;
export const RETIRED_OUT_LABEL = "Retired Out";
export const TIMED_OUT = 8;
export const TIMED_OUT_LABEL = "Timed Out";
export const HIT_BALL_TWICE = 9;
export const HIT_BALL_TWICE_LABEL = "Hit Ball Twice";
export const OBSTRACT_THE_FIELDING = 10;
export const OBSTRACT_THE_FIELDING_LABEL = "Obstract the Fielding";

export const ON_STRIKE = "ON_STRIKE"
export const NON_STRIKE = "NON_STRIKE"
export const CURRENT_BOWLER = "CURRENT_BOWLER"
export const BATTING_TEAM = "BATTING_TEAM"
export const BOWLING_TEAM = "BOWLING_TEAM"
export const RETIRED_HURT_BATTER = "RETIRED_HURT_BATTER"
export const RETIRED_HURT = "RETIRED_HURT"
export const PLAYER_LIST = "PLAYER_LIST"
export const PREV_ON_STRIKE = "PREV_ON_STRIKE"
export const PREV_NON_STRIKE = "PREV_NON_STRIKE"

export const FOUR = "FOUR"
export const SIX = "SIX"
export const BALL_EXTRAS = "BALL_EXTRAS"
export const BALL_WIDE = "Wide Ball"
export const NO_BALL = "No Ball"
export const NO_BALL_BYE = "No Ball Bye"
export const NO_BALL_LEG_BYE = "No Ball Leg Bye"
export const BALL_BYE = "Ball Bye"
export const BALL_LEG_BYE = "Leg Bye"

export const EXTRAS = "EXTRAS"
export const OVER = "OVER"
export const OVER_ENDED = "OVER_ENDED"
export const WICKET = "WICKET"
export const RUN = "RUN"
export const ALL = "ALL"


export const SWITCH_BOWLER = "SWITCH_BOWLER"
export const CHANGE_BOWLER = "CHANGE_BOWLER"
export const BATTER_SWITCH = "BATTER_SWITCH"

export const INNINGS_CHANGED = "INNINGS_CHANGED"
export const BATTING_COMPLETED = "BATTING_COMPLETED"

export const WICKET_TYPE_LIST = [
    { label: BOLD_LABEL, value: BOLD },
    { label: CATCH_LABEL, value: CATCH },
    { label: STUMP_LABEL, value: STUMP },
    { label: HIT_WICKET_LABEL, value: HIT_WICKET },
    { label: LBW_LABEL, value: LBW },
    { label: RUN_OUT_LABEL, value: RUN_OUT },
    { label: RETIRED_OUT_LABEL, value: RETIRED_OUT },
    { label: TIMED_OUT_LABEL, value: TIMED_OUT },
    { label: HIT_BALL_TWICE_LABEL, value: HIT_BALL_TWICE },
    { label: OBSTRACT_THE_FIELDING_LABEL, value: OBSTRACT_THE_FIELDING },
]
export const LIST_TO_EXCLUDE_WICKET_FOR_BOWLER = [RUN_OUT, RETIRED_OUT, TIMED_OUT, HIT_BALL_TWICE, OBSTRACT_THE_FIELDING]
export const EXTRAS_WICKET_TYPE = [
    { label: RUN_OUT_LABEL, value: RUN_OUT },
    { label: STUMP_LABEL, value: STUMP },
]


export const BOWLER_CHANGE_DISPLAY_STATUS = "Ball Start"
export const TEAM = "TEAM"
export const PLAYER = "PLAYER"
export const PARTNERSHIP = "PARTNERSHIP"

export const MARKET_STATUS = {
    "0": "NotOpen",
    "1": "Open",
    "2": "inActive",
    "3": "Suspend",
    "4": "Close",
    "5": "Settled",
    "6": "Cancel",
}

export const OPEN_MARKET_STATUS = {
    "0": "NotOpen",
    "1": "Open",
    "2": "inActive",
    "3": "Suspend",
    "4": "Close",
}

export const INACTIVE = "InActive"
export const SUSPEND = "Suspend"
export const ALL_SUSPEND = "All Suspend"
export const ALLOW = "Allow"
export const NOT_ALLOW = "Not Allow"
export const ACTIVE = "Active"
export const DEACTIVE = "Deactive"
export const INACTIVE_VALUE = 2
export const SUSPEND_VALUE = 3
export const OPEN_VALUE = 1
export const CLOSE_VALUE = 4
export const REFRESH = "Refresh"
export const SEND_ALL = "Send all"
export const BALL_FEATURE = "Ball by Ball"
export const OVER_FEATURE = "Overs"
export const TEAM_FEATURE = "Team"
export const WICKET_FEATURE = "Wicket"
export const PARTNERSHIP_FEATURE = "Partnership"
export const PLAYER_FEATURE = "Players"
export const BALL = "BALL"

export const BALL_TYPE_LIST = [
    { label: "Over Complete", value: BALL_TYPE_OVER_COMPLETE, },
    { label: "Regular", value: BALL_TYPE_REGULAR, },
    { label: "WD", value: BALL_TYPE_WIDE, },
    { label: "B", value: BALL_TYPE_BYE, },
    { label: "LB", value: BALL_TYPE_LEG_BYE, },
    { label: "NB", value: BALL_TYPE_NO_BALL, },
    { label: "NB B", value: BALL_TYPE_NO_BALL_BYE, },
    { label: "NB LB", value: BALL_TYPE_NO_BALL_LEG_BYE, },
    { label: "Panelty", value: BALL_TYPE_PANELTY_RUN, },
]

export const getStatusColor = (status) => {
    switch (status) {
        // case 1:
        //     return "#d7eed7"; //light green (open)
        case 2:
            return "#d7d5d5"; //light gray (inActive)
        case 3:
            return "#f6ddcf"; //light orange (suspend)
        case 4:
            return "#d7ebf1"; //light blue (close)
        case 5:
            return "#fbfbdd"; //light yellow (settled)
        case 6:
            return "#f6e0e0"; //light red (cancel)
        default:
            return "";
    }
};

export const getStatusColor1 = (status) => {
    switch (status) {
        case 1:
            return ""; //white (open)
        case 2:
            return "#d7d5d5"; //light gray (inActive)
        case 3:
            return "#f6ddcf"; //light orange (suspend)
        case 4:
            return "#d7ebf1"; //light blue (close)
        case 5:
            return "#fbfbdd"; //light yellow (settled)
        case 6:
            return "#f6e0e0"; //light red (cancel)
        default:
            return "";
    }
};
// Team Status
export const BAT = 1;
export const BOWL = 2;

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

// Ball Status
export const BATTER_STATUS_NONE = 0;
export const BATTER_STATUS_ON_PITCH = 1;
export const BATTER_STATUS_WICKET = 2;
export const BATTER_STATUS_RETIRE = 3;

// Innings
export const OPEN = 1;
export const TOSSDONE = 2;
export const INPROGRESS = 3;
export const END = 4;

// Out Type
export const BOLD = 1;
export const BOLD_LABEL = "Bold";
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

export const FOUR = "FOUR"
export const SIX = "SIX"
export const BALL_EXTRAS = "BALL_EXTRAS"
export const BALL_WIDE = "BALL_WIDE"
export const NO_BALL = "NO_BALL"
export const BALL_BYE = "BALL_BYE"
export const BALL_LEG_BYE = "BALL_LEG_BYE"

export const OVER = "OVER"
export const WICKET = "WICKET"
export const RUN = "RUN"
export const ALL = "ALL"

export const EXTRAS_LIST = {
    [BALL_WIDE]: [
        { label: "No Run", value: 0 },
        { label: "1 Run", value: 1 },
        { label: "2 Runs", value: 2 },
        { label: "3 Runs", value: 3 },
        { label: "4 Runs", value: 4 },
        { label: "5 Runs", value: 5 },
        { label: "6 Runs", value: 6 },
        { label: "7 Runs", value: 7 },
        { label: "8 Runs", value: 8 },
        { label: "9 Runs", value: 9 },
    ],
    [NO_BALL]: [
        { label: "No Run", value: 0 },
        { label: "1 Run", value: 1 },
        { label: "2 Runs", value: 2 },
        { label: "3 Runs", value: 3 },
        { label: "4 Runs", value: 4 },
        { label: "5 Runs", value: 5 },
        { label: "6 Runs", value: 6 },
        { label: "7 Runs", value: 7 },
        { label: "8 Runs", value: 8 },
        { label: "9 Runs", value: 9 },
    ],
    [BALL_BYE]: [
        { label: "No Run", value: 0 },
        { label: "1 Run", value: 1 },
        { label: "2 Runs", value: 2 },
        { label: "3 Runs", value: 3 },
        { label: "4 Runs", value: 4 },
        { label: "5 Runs", value: 5 },
        { label: "6 Runs", value: 6 },
        { label: "7 Runs", value: 7 },
        { label: "8 Runs", value: 8 },
        { label: "9 Runs", value: 9 },
    ],
    [BALL_LEG_BYE]: [
        { label: "No Run", value: 0 },
        { label: "1 Run", value: 1 },
        { label: "2 Runs", value: 2 },
        { label: "3 Runs", value: 3 },
        { label: "4 Runs", value: 4 },
        { label: "5 Runs", value: 5 },
        { label: "6 Runs", value: 6 },
        { label: "7 Runs", value: 7 },
        { label: "8 Runs", value: 8 },
        { label: "9 Runs", value: 9 },
    ]
}
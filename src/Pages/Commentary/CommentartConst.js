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

export const EXTRAS_WICKET_TYPE = [
    { label: RUN_OUT_LABEL, value: RUN_OUT },
    { label: RETIRED_OUT_LABEL, value: RETIRED_OUT },
]


export const BOWLER_CHANGE_DISPLAY_STATUS = "Ball Start"
export const TEAM = "TEAM"
export const PLAYER = "PLAYER"
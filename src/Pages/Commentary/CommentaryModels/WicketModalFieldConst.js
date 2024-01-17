import { COUNTER, RADIO_BUTTON, SELECT, SWITCH } from "../../../components/Common/Const";
import { BOLD, BOLD_LABEL, CATCH, CATCH_LABEL, HIT_BALL_TWICE, HIT_BALL_TWICE_LABEL, HIT_WICKET, HIT_WICKET_LABEL, LBW, LBW_LABEL, OBSTRACT_THE_FIELDING, OBSTRACT_THE_FIELDING_LABEL, RETIRED_OUT, RETIRED_OUT_LABEL, RUN_OUT, RUN_OUT_LABEL, STUMP, STUMP_LABEL, TIMED_OUT, TIMED_OUT_LABEL } from "../CommentartConst";

export const WICKET_FIELDS = [
    {
        name: "batterId",
        label: "Batter",
        type: RADIO_BUTTON,
        defaultValue: "0",
        options: [],
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 6, lg: 6 }
    },
    {
        name: "runs",
        label: "Runs",
        type: COUNTER,
        min: 0,
        max: 100,
        step: 1,
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 6, lg: 6 }
    },
    {
        name: "wicketType",
        label: "Wicket Type",
        type: SELECT,
        defaultValue: "0",
        options: [
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
        ],
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 6, lg: 6 }
    },
    {
        name: "fielder",
        label: "Fielder",
        type: SELECT,
        defaultValue: "0",
        options: [],
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 6, lg: 6 }
    },
    {
        name: "switchBatter",
        label: "Switch position for new Batter",
        type: SWITCH,
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 6, lg: 6 }
    },
]
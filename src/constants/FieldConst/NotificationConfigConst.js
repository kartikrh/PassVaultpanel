import {
  SELECT,
  SWITCH,
  TEXT_EDITOR,
} from "../../components/Common/Const";

export const notificationConfigField = [
  {
    name: "eventName",
    label: "Event",
    options: [
      { label: "Select Event", value: "0" },
      { label: "Comming Soon", value: 1 },
      { label: "Win Toss", value: 2 },
      { label: "Event Start", value: 3 },
      { label: "Inning Completed", value: 4 },
      { label: "Boundary", value: 5 },
      { label: "Wicket", value: 6 },
      { label: "Event Completed", value: 7 },
    ],
    isRequired: true,
    type: SELECT,
    defaultValue: "0",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isActive",
    label: "Is Active",
    defaultValue: true,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "title",
    label: "Title",
    isRequired: true,
    parentclassName: "",
    type: TEXT_EDITOR,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 10, lg: 10 },
  },
  {
    name: "content",
    label: "Content",
    isRequired: true,
    parentclassName: "",
    type: TEXT_EDITOR,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 10, lg: 10 },
    note: (
      <>
        <div>
          <b><i>Note :</i></b>
        </div>
        <div>
          <span><b>eventtype:</b> - Event Type, </span>
          <span><b>competition:</b> - Competition, </span>
          <span><b>eventname:</b> - Event Name, </span>
          <span><b>eventdate:</b> - Event Date, </span>
          <span><b>location:</b> - Location, </span>
          <span><b>tosswonby:</b> - Toss Won by, </span>
          <span><b>bowlingteam:</b> - Bowling Team, </span>
          <span><b>bowlername:</b> - Bowler Name, </span>
          <span><b>battingteam:</b> - Batting Team, </span>
          <span><b>runs:</b> - Runs, </span>
          <span><b>wickets:</b> - Wickets, </span>
          <span><b>overs:</b> - Overs, </span>
          <span><b>batsmanname:</b> - Batsman Name, </span>
          <span><b>batsmanrun:</b> - Batsman Runs, </span>
          <span><b>batsmanball:</b> - Batsman Balls, </span>
          <span><b>wickettype:</b> - Wicket Type, </span>
          <span><b>teamScore:</b> - Team Score, </span>
          <span><b>wonremark:</b> - Won Remark, </span>
          <span><b>boundarytype:</b> - Boundary Type, </span>
          <span><b>result:</b> - Result, </span>
          <span><b>rmk:</b> - Remark</span>
        </div>
      </>
    ),
  },
];
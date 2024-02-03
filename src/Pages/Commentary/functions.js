import { BALL_TYPE_OVER_COMPLETE, BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, NON_STRIKE, ON_STRIKE } from "./CommentartConst";

export function mapCommentaryStatus(status) {
  switch (parseInt(status)) {
    case 1:
      return "Open";
    case 2:
      return "Toss";
    case 3:
      return "InProgress";
    case 4:
      return "Completed";
    default:
      return "-";
  }
}

export const generateBall = ({ commentaryDetails, teams, currentOver, onPitchPlayers, currentBall }) => {
  return {
    "commentaryBallByBallId": currentBall.commentaryBallByBallId || "0",
    "commentaryId": commentaryDetails.commentaryId,
    "teamId": teams?.[BATTING_TEAM].teamId,
    "overId": currentOver.overId,
    "overCount": teams?.[BATTING_TEAM].teamOver || "0",
    "currentOverBalls": currentOver.ballCount || 0,
    "bowlerId": onPitchPlayers[CURRENT_BOWLER].commentaryPlayerId || "0",
    "batStrikeId": currentBall.batStrikeId || onPitchPlayers[ON_STRIKE].commentaryPlayerId || "0",
    "batNonStrikeId": currentBall.batNonStrikeId || onPitchPlayers[NON_STRIKE].commentaryPlayerId || "0",
    "ballIsCount": currentBall.ballIsCount || false,
    "ballType": currentBall.ballType || BALL_TYPE_OVER_COMPLETE,
    "ballIsDot": currentBall.ballIsDot || false,
    "ballRun": currentBall.ballRun || 0,
    "ballExtraRun": currentBall.ballExtraRun || 0,
    "ballIsBoundry": currentBall.ballIsBoundry || false,
    "ballFour": currentBall.ballFour || 0,
    "ballSix": currentBall.ballSix || 0,
    "ballIsWicket": currentBall.ballIsWicket || false,
    "ballWicketType": currentBall.ballWicketType || "0",
    "ballPlayerId": currentBall.batStrikeId || onPitchPlayers[ON_STRIKE].commentaryPlayerId || "0",
    "ballBowlerId": onPitchPlayers[CURRENT_BOWLER].commentaryPlayerId || "0",
    "ballFielderId1": currentBall.ballFielderId1 || "0",
    "ballFielderId2": currentBall.ballFielderId2 || "0",
    "overIsMaiden": currentBall.overIsMaiden || false,
    "nextBatStrikeId": onPitchPlayers[ON_STRIKE]?.commentaryPlayerId || "0",
    "nextBatNonStrikeId": onPitchPlayers[NON_STRIKE]?.commentaryPlayerId || "0",
    "currentInnings": commentaryDetails.currentInnings
  }
}

export const generateWicket = ({ commentaryDetails, currentWicket, currentOver, teams, currentBall }) => {
  return {
    "commentaryWicketId": currentWicket.commentaryWicketId || "0",
    "commentaryId": commentaryDetails.commentaryId,
    "bowlerId": currentWicket.bowlerId,
    "bowlerName": currentWicket.bowlerName,
    "wicketType": currentWicket.wicketType,
    "batterId": currentWicket.batterId,
    "batterName": currentWicket.batterName,
    "fieldPlayerId": currentWicket.fieldPlayerId,
    "fieldPlayerName": currentWicket.fieldPlayerId,
    "overId": currentOver.overId,
    "overCount": currentOver.over,
    "commentaryBallByBallId": currentBall.commentaryBallByBallId || "0",
    "teamId": teams[BATTING_TEAM].teamId,
    "teamScore": teams[BATTING_TEAM].teamScore,
    "playerRun": currentWicket.batterRuns || 0,
    "playerBalls": currentWicket.batterBalls || 0,
    "wicketCount": (+teams[BATTING_TEAM] || 0) + 1,
    "ballCount": 0, //Change in future
    "currentInnings": commentaryDetails.currentInnings,
  }
}

export const generatePartnership = ({ currentPartnership, commentaryDetails, teams, currentBall }) => {
  return {
    "commentaryPartnershipId": currentPartnership.commentaryPartnershipId || "0",
    "commentaryId": commentaryDetails.commentaryId,
    "teamId": teams[BATTING_TEAM].teamId,
    "batter1Id": currentPartnership.batter1Id,
    "batter1Name": currentPartnership.batter1Name,
    "batter2Id": currentPartnership.batter2Id,
    "batter2Name": currentPartnership.batter2Name,
    "totalRuns": currentPartnership.totalRuns || 0,
    "totalBalls": currentPartnership.totalBalls || 0,
    "extras": currentPartnership.extras || 0,
    "commentaryBallByBallId": currentBall.commentaryBallByBallId || "0",
    "currentInnings": commentaryDetails.currentInnings,
  };
}

export const generateOver = ({ commentaryDetails, teams, onPitchPlayers }) => {
  return {
    "overId": "0",
    "commentaryId": commentaryDetails.commentaryId,
    "teamId": teams[BOWLING_TEAM].teamId,
    "bowlerId": onPitchPlayers[CURRENT_BOWLER]?.commentaryPlayerId,
    "currentInnings": commentaryDetails.currentInnings,
    "over": +teams?.[BATTING_TEAM].teamOver?.toFixed(0),
    "ballCount": 0,
    "totalRun": 0,
    "totalFour": 0,
    "totalSix": 0,
    "totalWideBall": 0,
    "totalWideRun": 0,
    "totalNoball": 0,
    "totalNoBallRun": 0,
    "totalByesRun": 0,
    "totalLegByesRun": 0,
    "totalPanelty": 0,
    "totalWicket": 0,
    "dotBall": 0,
    "isComplete": false,
    "powerplay": null,
    "isOverInPowerplay": false,
    "powerplayType": 1,
    "isMaiden": false,
    "isDelete": null,
  }
}
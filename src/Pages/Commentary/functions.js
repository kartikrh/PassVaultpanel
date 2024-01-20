import { BATTING_TEAM, CURRENT_BOWLER, NON_STRIKE, ON_STRIKE } from "./CommentartConst";

export function mapCommentaryStatus(status) {
  switch (parseInt(status)) {
    case 1:
      return "Open";
    case 2:
      return "Toss";
    case 3:
      return "Batsman Man select";
    case 4:
      return "Bowler select";
    case 5:
      return "Start Scoring";
    case 6:
      return "Innings End";
    case 7:
      return "Third Bet Running";
    case 8:
      return "Third Bet Completed";
    case 9:
      return "Fourth Bet Running";
    case 10:
      return "Fourth Bet Completed";
    case 11:
      return "Match Completed";
    default:
      return "-";
  }
}

export const generateBall = ({ commentaryDetails, teams, currentOver, onPitchPlayers, currentBall }) => {
  return {
    "commentaryBallByBallId": currentBall.commentaryBallByBallId || "0",
    "commentaryId": commentaryDetails.commentaryId,
    "teamId": teams[BATTING_TEAM].teamId,
    "overId": currentOver.overId,
    "overCount": currentOver.over,
    "currentOverBalls": currentOver.ballCount,
    "bowlerId": onPitchPlayers[CURRENT_BOWLER].playerId,
    "batStrikeId": currentBall.batStrikeId || onPitchPlayers[ON_STRIKE].playerId,
    "batNonStrikeId": currentBall.batNonStrikeId || onPitchPlayers[NON_STRIKE].playerId,
    "ballIsCount": currentBall.ballIsCount,
    "ballType": currentBall.ballType,
    "ballIsDot": currentBall.ballIsDot || false,
    "ballRun": currentBall.ballRun,
    "ballExtraRun": currentBall.ballExtraRun,
    "ballIsBoundry": currentBall.ballIsBoundry,
    "ballFour": currentBall.ballFour || 0,
    "ballSix": currentBall.ballSix || 0,
    "ballIsWicket": currentBall.ballIsWicket,
    "ballWicketType": currentBall.ballWicketType,
    "ballPlayerId": currentBall.batStrikeId || onPitchPlayers[ON_STRIKE].playerId,
    "ballBowlerId": onPitchPlayers[CURRENT_BOWLER].playerId,
    "ballFielderId1": currentBall.ballFielderId1,
    "ballFielderId2": currentBall.ballFielderId2,
    "overIsMaiden": currentBall.overIsMaiden,
    "nextBatStrikeId": onPitchPlayers[ON_STRIKE]?.playerId,
    "nextBatNonStrikeId": onPitchPlayers[NON_STRIKE]?.playerId,
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
    "ballCount": "",
    "currentInnings": commentaryDetails.currentInnings,
  }
}

export const generatePartnership = ({ currentPartnership, commentaryDetails, teams, currentBall }) => {
  console.log(currentPartnership)
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


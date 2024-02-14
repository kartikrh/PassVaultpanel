import { fixDecimal } from "../../components/Common/Reusables/reusableMethods";
import { BALL_TYPE_BYE, BALL_TYPE_LEG_BYE, BALL_TYPE_NO_BALL, BALL_TYPE_OVER_COMPLETE, BALL_TYPE_REGULAR, BALL_TYPE_WIDE, BATTER_SWITCH, BATTING_TEAM, BOLD, BOWLING_TEAM, CATCH, CHANGE_BOWLER, CURRENT_BOWLER, HIT_BALL_TWICE, HIT_WICKET, LBW, NON_STRIKE, OBSTRACT_THE_FIELDING, ON_STRIKE, RETIRED_OUT, RUN_OUT, STUMP, SWITCH_BOWLER, TIMED_OUT } from "./CommentartConst";

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
    "over": +teams?.[BATTING_TEAM]?.teamOver?.toFixed(0),
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

export const getStrikeRate = (runs, balls) => {
  return fixDecimal(((+runs / +balls) * 100), 2)
}

export const getEconomyRate = (runs, totalBalls, ballsPerOver) => {
  return fixDecimal(((+runs / +totalBalls) * ballsPerOver), 2)
}

export const getRequiredRunRate = (runs, currentOver, ballsPerOver, total, OverInInnings) => {
  runs = total - runs
  const remainingBalls = (((+OverInInnings - +currentOver?.over) * +ballsPerOver) - currentOver?.ballCount)
  return fixDecimal(((+runs / +remainingBalls) * +ballsPerOver), 2)
}

export const getRunRate = (runs, currentOver, ballsPerOver) => {
  const totalBalls = ((+currentOver?.over * +ballsPerOver) + currentOver?.ballCount)
  return fixDecimal(((+runs / totalBalls) * ballsPerOver), 2)
}

export const generateDisplayStatus = ({ currentBall, playerSwitch }) => {
  let displayStatus = ""
  // New Logic 
  const run = currentBall.ballRun
  const extraRun = currentBall.ballExtraRun
  const ballType = currentBall.ballType
  const wicketType = currentBall.ballWicketType
  if (playerSwitch) {
    if (playerSwitch === SWITCH_BOWLER) displayStatus = "Bowler Switched"
    else if (playerSwitch === CHANGE_BOWLER) displayStatus = "Bowler Changed"
    else if (playerSwitch === BATTER_SWITCH) displayStatus = "Batter Switched"
  } else {
    if (ballType === BALL_TYPE_REGULAR) {
      if (currentBall.ballIsWicket) {
        if (wicketType === BOLD) displayStatus = "Wicket!, Bowled"
        else if (wicketType === CATCH) displayStatus = "Wicket!, Catch Out"
        else if (wicketType === STUMP) displayStatus = "Wicket!, Stumped"
        else if (wicketType === HIT_WICKET) displayStatus = "Wicket!, Hit Wicket"
        else if (wicketType === LBW) displayStatus = "Wicket!, LBW"
        else if (wicketType === RUN_OUT) displayStatus = "Wicket!, Run Out"
        else if (wicketType === RETIRED_OUT) displayStatus = "Wicket!, Retired Out"
        else if (wicketType === TIMED_OUT) displayStatus = "Wicket!, Timed Out"
        else if (wicketType === HIT_BALL_TWICE) displayStatus = "Wicket!, Hit the ball twice"
        else if (wicketType === OBSTRACT_THE_FIELDING) displayStatus = "Wicket!, Obstract the fielding"
      }
      else if (currentBall.ballFour !== 0) displayStatus = "Four, Boundary"
      else if (currentBall.ballSix !== 0) displayStatus = "Six, Boundary"
      else {
        if (run === 0) displayStatus = "No Runs"
        else if (run === 1) displayStatus = "Single, Strike changed"
        else if (run === 2) displayStatus = "Double, No strike change"
        else if (run === 3) displayStatus = "Three Runs, Strike change"
        else if (run === 4) displayStatus = "Four Runs, No strike change"
        else if (run === 5) displayStatus = "Five Runs, Strike change"
      }
    }
    else if (ballType === BALL_TYPE_OVER_COMPLETE) displayStatus = "Over Ended"
    else if (ballType === BALL_TYPE_WIDE) displayStatus = `Wide ball, with ${extraRun} run`
    else if (ballType === BALL_TYPE_BYE) displayStatus = `Bye, with ${extraRun} run`
    else if (ballType === BALL_TYPE_LEG_BYE) displayStatus = `Leg Bye, with ${extraRun} run`
    else if (ballType === BALL_TYPE_NO_BALL) displayStatus = `No ball, with ${extraRun} run`
  }
  return displayStatus
}
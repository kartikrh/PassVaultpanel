import _ from "lodash";
import { STRING_SEPERATOR } from "../../components/Common/Const";
import { fixDecimal } from "../../components/Common/Reusables/reusableMethods";
import { BALL_TYPE_BOWLER_RETIRED_HURT, BALL_TYPE_BYE, BALL_TYPE_LEG_BYE, BALL_TYPE_NO_BALL, BALL_TYPE_NO_BALL_BYE, BALL_TYPE_NO_BALL_LEG_BYE, BALL_TYPE_OVER_COMPLETE, BALL_TYPE_PANELTY_RUN, BALL_TYPE_REGULAR, BALL_TYPE_RETIRED_HURT, BALL_TYPE_WIDE, BATTER_SWITCH, BATTING_TEAM, BOLD, BOWLING_TEAM, CATCH, CHANGE_BOWLER, CURRENT_BOWLER, HIT_BALL_TWICE, HIT_WICKET, LBW, LIST_TO_EXCLUDE_WICKET_FOR_BOWLER, NON_STRIKE, OBSTRACT_THE_FIELDING, ON_STRIKE, RETIRED_OUT, RUN_OUT, STUMP, SWITCH_BOWLER, TIMED_OUT } from "./CommentartConst";

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
    "commentaryBallByBallId": currentBall.commentaryBallByBallId || 0,
    "commentaryId": commentaryDetails.commentaryId,
    "teamId": teams?.[BATTING_TEAM].teamId,
    "overId": currentOver.overId,
    "overCount": teams?.[BATTING_TEAM].teamOver || "0",
    "currentOverBalls": currentOver.ballCount || 0,
    "bowlerId": currentBall.bowlerId || onPitchPlayers[CURRENT_BOWLER]?.commentaryPlayerId || 0,
    "batStrikeId": currentBall.batStrikeId || onPitchPlayers[ON_STRIKE].commentaryPlayerId || 0,
    "batNonStrikeId": currentBall.batNonStrikeId || onPitchPlayers[NON_STRIKE]?.commentaryPlayerId || 0,
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
    "ballPlayerId": currentBall.batStrikeId || onPitchPlayers[ON_STRIKE].commentaryPlayerId || 0,
    "ballBowlerId": onPitchPlayers[CURRENT_BOWLER]?.commentaryPlayerId || 0,
    "ballFielderId1": currentBall.ballFielderId1 || 0,
    "ballFielderId2": currentBall.ballFielderId2 || 0,
    "overIsMaiden": currentBall.overIsMaiden || false,
    "nextBatStrikeId": currentBall.nextBatStrikeId || onPitchPlayers[ON_STRIKE]?.commentaryPlayerId || 0,
    "nextBatNonStrikeId": currentBall.nextBatNonStrikeId || onPitchPlayers[NON_STRIKE]?.commentaryPlayerId || 0,
    "currentInnings": commentaryDetails.currentInnings,
    "autoStrikeBallCount": currentBall.autoStrikeBallCount || 0
  }
}

export const generateWicket = ({ commentaryDetails, currentWicket, currentOver, teams, currentBall }) => {
  return {
    "commentaryWicketId": currentWicket.commentaryWicketId || 0,
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
    "commentaryBallByBallId": currentBall.commentaryBallByBallId || 0,
    "teamId": teams[BATTING_TEAM].teamId,
    "teamScore": teams[BATTING_TEAM].teamScore,
    "playerRun": currentWicket.batterRuns || 0,
    "playerBalls": currentWicket.batterBalls || 0,
    "wicketCount": (currentWicket.wicketCount || 0),
    "ballCount": 0, //Change in future
    "currentInnings": commentaryDetails.currentInnings,
  }
}

export const generatePartnership = ({ currentPartnership, commentaryDetails, teams }) => {
  return {
    "commentaryPartnershipId": currentPartnership.commentaryPartnershipId || 0,
    "commentaryId": commentaryDetails.commentaryId,
    "teamId": teams[BATTING_TEAM].teamId,
    "batter1Id": currentPartnership.batter1Id,
    "batter1Name": currentPartnership.batter1Name,
    "batter2Id": currentPartnership.batter2Id,
    "batter2Name": currentPartnership.batter2Name,
    "totalRuns": currentPartnership.totalRuns || 0,
    "totalBalls": currentPartnership.totalBalls || 0,
    "extras": currentPartnership.extras || 0,
    "commentaryBallByBallId": currentPartnership.commentaryBallByBallId || 0,
    "currentInnings": commentaryDetails.currentInnings,
  };
}

export const generateOver = ({ commentaryDetails, teams, onPitchPlayers }) => {
  return {
    "overId": 0,
    "commentaryId": commentaryDetails.commentaryId,
    "teamId": teams[BOWLING_TEAM].teamId,
    "bowlerId": onPitchPlayers[CURRENT_BOWLER]?.commentaryPlayerId,
    "currentInnings": commentaryDetails.currentInnings,
    "over": Math.floor(+teams?.[BATTING_TEAM]?.teamOver),
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
  const strikeRate = fixDecimal(((+runs / +balls) * 100), 2)
  return isNaN(strikeRate) ? 0 : strikeRate
}

export const getEconomyRate = (runs, totalBalls, ballsPerOver) => {
  let economyToReturn = 0
  if (totalBalls > 0) economyToReturn = fixDecimal(((+runs / +totalBalls) * ballsPerOver), 2)
  // console.log("Economy Rates: ", { runs, totalBalls, ballsPerOver, economyToReturn });
  return isNaN(economyToReturn) ? 0 : economyToReturn
}

export const getRequiredRunRate = (runs, currentOver, ballsPerOver, total, OverInInnings) => {
  runs = total - runs
  const remainingBalls = (((+OverInInnings - +currentOver?.over) * +ballsPerOver) - currentOver?.ballCount)
  return remainingBalls > 0 ? fixDecimal(((+runs / +remainingBalls) * +ballsPerOver), 2) : 0
}

export const getRunRate = (runs, currentOver, ballsPerOver) => {
  const totalBalls = ((+currentOver?.over * +ballsPerOver) + currentOver?.ballCount)
  return totalBalls > 0 ? fixDecimal(((+runs / totalBalls) * ballsPerOver), 2) : 0
}

export const generateDisplayStatus = ({ currentBall, playerSwitch }) => {
  let displayStatus = ""
  // New Logic 
  const run = currentBall.ballRun
  const extraRun = currentBall.ballExtraRun - 1
  const ballType = currentBall.ballType
  const wicketType = currentBall.ballWicketType
  if (playerSwitch) {
    if (playerSwitch === SWITCH_BOWLER) displayStatus = "Bowler Switched"
    else if (playerSwitch === CHANGE_BOWLER) displayStatus = "Bowler Changed"
    else if (playerSwitch === BATTER_SWITCH) displayStatus = "Batter Switched"
  } else {
    if (ballType === BALL_TYPE_REGULAR) {
      if (currentBall.ballIsWicket) {
        if (wicketType === BOLD) displayStatus = "Wicket"
        else if (wicketType === CATCH) displayStatus = "Wicket"
        else if (wicketType === STUMP) displayStatus = "Wicket"
        else if (wicketType === HIT_WICKET) displayStatus = "Wicket"
        else if (wicketType === LBW) displayStatus = "Wicket"
        else if (wicketType === RUN_OUT) displayStatus = "Wicket"
        else if (wicketType === RETIRED_OUT) displayStatus = "Wicket"
        else if (wicketType === TIMED_OUT) displayStatus = "Wicket"
        else if (wicketType === HIT_BALL_TWICE) displayStatus = "Wicket"
        else if (wicketType === OBSTRACT_THE_FIELDING) displayStatus = "Wicket"
      }
      else if (currentBall.ballFour !== 0) displayStatus = "4"
      else if (currentBall.ballSix !== 0) displayStatus = "6"
      else {
        if (run === 0) displayStatus = "0"
        else if (run === 1) displayStatus = "1"
        else if (run === 2) displayStatus = "2"
        else if (run === 3) displayStatus = "3"
        else if (run === 4) displayStatus = "4"
        else if (run === 5) displayStatus = "5"
      }
    }
    // else if (ballType === BALL_TYPE_OVER_COMPLETE) displayStatus = "Over Ended"
    else if (ballType === BALL_TYPE_WIDE) displayStatus = `WD + ${run}`
    else if (ballType === BALL_TYPE_BYE) displayStatus = `${run}B`
    else if (ballType === BALL_TYPE_LEG_BYE) displayStatus = `${run}LB`
    else if (ballType === BALL_TYPE_NO_BALL) displayStatus = `NB + ${run}`
    else if (ballType === BALL_TYPE_NO_BALL_BYE) displayStatus = `NB + ${run}B`
    else if (ballType === BALL_TYPE_NO_BALL_LEG_BYE) displayStatus = `NB + ${run}LB`
  }
  return displayStatus
}


export const getBallsForAllOver = (ballHistory = []) => {
  ballHistory = _.orderBy(ballHistory, ["commentaryBallByBallId"], ["desc"])
  let toReturn = {}
  ballHistory.forEach(ball => {
    if (ball) {
      const overCount = +ball?.overCount % 1 === 0 ? (+ball?.overCount + 0.1) : +ball?.overCount
      const overToLogBallFor = ball.currentInnings + STRING_SEPERATOR + ball.teamId + STRING_SEPERATOR + Math.ceil(overCount)
      const ballsInCurrentOver = toReturn[overToLogBallFor]
      if (ball.ballType !== BALL_TYPE_OVER_COMPLETE) toReturn[overToLogBallFor] = [].concat(ballsInCurrentOver || [],
        [
          { type: ball.ballType, value: ball.ballRun, isWicket: ball.ballWicketType || false, isBoundary: ball.ballIsBoundry || false, overCount: ball?.overCount }
        ])
    }
  })
  return toReturn;
}

export const generateBallLabelFromBall = (ballType, isWicket) => {
  let toReturn = undefined
  if (ballType === BALL_TYPE_WIDE) toReturn = "WB"
  else if (ballType === BALL_TYPE_BYE) toReturn = "B"
  else if (ballType === BALL_TYPE_LEG_BYE) toReturn = "LB"
  else if (ballType === BALL_TYPE_NO_BALL) toReturn = "NB"
  else if (ballType === BALL_TYPE_NO_BALL_BYE) toReturn = "NBB"
  else if (ballType === BALL_TYPE_NO_BALL_LEG_BYE) toReturn = "NLB"
  else if (ballType === BALL_TYPE_PANELTY_RUN) toReturn = "P"
  else if (ballType === BALL_TYPE_RETIRED_HURT) toReturn = "RH"
  else if (ballType === BALL_TYPE_BOWLER_RETIRED_HURT) toReturn = "BRH"
  else if (isWicket) toReturn = "WK"
  return toReturn
}

export const fetchNextPlayerOrder = (playerType, playerList) => {
  const searchFor = playerType === CURRENT_BOWLER ? "bowlerOrder" : "batterOrder"
  let highestNumber = 1
  playerList?.map(player => {
    if (player[searchFor]) highestNumber = Math.max(+player[searchFor], +highestNumber)
  })
  return highestNumber + 1
}

export const generateOverUnder = (dataObj) => {
  const roundedLine = Math.round(parseFloat(dataObj?.line));
  const thresholdValue = Math.floor(parseFloat(dataObj?.line)) + 0.5;
  const marginAdjustment = dataObj?.margin ? ((dataObj.margin / 100) + 1) : 1;
  const dataToSend = {
    ...dataObj,
    backPrice: roundedLine + 1 || 0,
    layPrice: roundedLine || 0,
    backSize: dataObj?.backSize || 100,
    laySize: dataObj?.laySize || 100,
    overRate: dataObj?.margin && (((1 / (marginAdjustment / (1 + Math.exp(-(dataObj?.line - thresholdValue))))).toFixed(2)) || 0),
    underRate: dataObj?.margin && (((1 / (marginAdjustment / (1 + Math.exp(+(dataObj?.line - thresholdValue))))).toFixed(2)) || 0),
  }
  return dataToSend
}

export const generateOverUnderLineType = (dataObj, marketTypeObj) => {
  const roundedLine = Math.round(parseFloat(dataObj?.line));
  const thresholdValue = Math.floor(parseFloat(dataObj?.line)) + 0.5;
  const marginAdjustment = dataObj?.margin ? ((dataObj.margin / 100) + 1) : 1;
  const dataToSend = {
    ...dataObj,
    backPrice: ((parseInt(dataObj?.lineType) === 1) && (dataObj?.marketTypeId == marketTypeObj?.Fancy || dataObj?.marketTypeId == marketTypeObj?.LineMarket)) ? roundedLine + parseInt(dataObj?.rateDiff || 0) : (parseInt(dataObj?.lineType) === 1 ? roundedLine + 1 : roundedLine) || 0,
    layPrice: roundedLine || 0,
    backSize: dataObj?.backSize || 100,
    laySize: dataObj?.laySize || 100,
    overRate: dataObj?.margin && (((1 / (marginAdjustment / (1 + Math.exp(-(dataObj?.line - thresholdValue))))).toFixed(2)) || 0),
    underRate: dataObj?.margin && (((1 / (marginAdjustment / (1 + Math.exp(+(dataObj?.line - thresholdValue))))).toFixed(2)) || 0),
  }
  return dataToSend
}


export const fetchWinnerMessage = ({ team, matchTypeDetails, target, isBattingTeamWon }) => {
  const battingTeam = team[BATTING_TEAM]
  const bowlingTeam = team[BOWLING_TEAM]
  if (isBattingTeamWon) {
    const maxNoOfWicket = matchTypeDetails.noOfPlayer - (matchTypeDetails.isLastManStand ? 0 : 1);
    const wicketRemaining = maxNoOfWicket - (+battingTeam.teamWicket || 0)
    return `${battingTeam.shortName} won by ${wicketRemaining} wickets.`
  } else {
    const runsLeft = target - battingTeam.teamScore - 1
    return `${bowlingTeam.shortName} won by ${runsLeft} runs.`
  }
}

export const generateRemainingRuns = (team, ballsPerOver) => {
  const totalOverRemaining = team.teamMaxOver - Math.floor(team.teamOver || 0)
  const ballsInCurrentOver = (team.teamOve || 0) * 10 % 10
  const totalBallsRemaining = (totalOverRemaining * (ballsPerOver || 6)) - (ballsInCurrentOver || 0)
  const totalRunRemaining = (team.teamTrialRuns || 0) - (team.teamScore || 0)
  return `${team.shortName} needs ${totalRunRemaining} runs from ${totalBallsRemaining} balls.`
}

export const getNonExtraRuns = (over) => {
  const toReturn = (+over?.totalRun || 0) - (+over?.totalWideRun || 0) - (+over?.totalNoBallRun || 0) - (+over?.totalByesRun || 0) - (+over?.totalLegByesRun || 0)
  // console.log("Non-Extra Runs: ", { toReturn });
  return toReturn
}

export const getBowlerOnlyRuns = (over) => {
  const toReturn = (+over?.totalRun || 0) - (+over?.totalByesRun || 0) - (+over?.totalLegByesRun || 0)
  // console.log("Bowler only Runs: ", { toReturn });
  return toReturn
}

export const getNonNegativeValue = (value) => {
  return value > 0 ? value : 0
}

export const getBowlerRelatedWickets = (overId, ballHistory = []) => {
  let wicketCount = 0
  if (overId && ballHistory.length > 0) {
    ballHistory?.map((ball) => {
      if (ball.overId === overId) {
        if (ball?.ballIsWicket && !LIST_TO_EXCLUDE_WICKET_FOR_BOWLER.includes(ball?.ballWicketType))
          wicketCount += 1
      }
      return ball
    })
  }
  return wicketCount
}
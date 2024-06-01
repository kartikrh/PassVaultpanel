import { useEffect, useState } from "react"
import { CommentaryScreen } from "./Commentary.jsx"
import _, { isEmpty, isEqual } from "lodash"
import { BALL_BYE, BALL_LEG_BYE, BALL_TYPE_BOWLER_RETIRED_HURT, BALL_TYPE_BYE, BALL_TYPE_LEG_BYE, BALL_TYPE_NO_BALL, BALL_TYPE_NO_BALL_BYE, BALL_TYPE_NO_BALL_LEG_BYE, BALL_TYPE_OVER_COMPLETE, BALL_TYPE_PANELTY_RUN, BALL_TYPE_REGULAR, BALL_TYPE_RETIRED_HURT, BALL_TYPE_WIDE, BALL_WIDE, BAT, BATTER_TYPE, BATTING_TEAM, BOWLING_TEAM, CHANGE_BOWLER, CURRENT_BOWLER, NON_STRIKE, NO_BALL, NO_BALL_BYE, NO_BALL_LEG_BYE, ON_STRIKE, OVER, PLAYER_LIST, PREV_NON_STRIKE, PREV_ON_STRIKE, RETIRED_HURT_BATTER, RETIRED_OUT, RUN, RUN_OUT, SWITCH_BOWLER, WICKET } from "./CommentartConst.js"
import SelectPlayerModal from "./CommentaryModels/SelectPlayerModal.jsx"
import ExtrasModal from "./CommentaryModels/ExtrasModal.jsx"
import ChangeOverModal from "./CommentaryModels/ChangeOverModal.jsx"
import WicketModal from "./CommentaryModels/WicketModal.jsx"
import { fetchNextPlayerOrder, fetchWinnerMessage, generateBall, generateDisplayStatus, generateOver, generatePartnership, generateRemainingRuns, generateWicket, getBallsForAllOver, getEconomyRate, getRequiredRunRate, getRunRate, getStrikeRate } from "./functions.js"
import { useDispatch, useSelector } from "react-redux"
import { addCommentaryScreenData, changeBowlerFromCommentary, clearAddCommentaryScreenData, clearUndoFlag, updateCommentaryDisplayStatus } from "../../Features/Tabs/commentarySlice.js"
import ChangeInningsModal from "./CommentaryModels/ChangeInningsModal.jsx"
import { useNavigate } from "react-router-dom"
import UpdateInningsModal from "./CommentaryModels/UpdateInningsModal.jsx"
import { compareNumStringValues } from "../../components/Common/Reusables/reusableMethods.js"
import UpdateStrikeModal from "./CommentaryModels/UpdateStrikerModal.jsx"
import WinnerModal from "./CommentaryModels/WinnerModal.jsx"
import UndoInnnigsModal from "./CommentaryModels/UndoInningsModal.jsx"
import CompleteCurrentMatchModal from "./CommentaryModels/CompleteMatchModal.jsx"
import ChangeBowlerModal from "./CommentaryModels/ChangeBowlerModal.jsx"
import UndoOverModal from "./CommentaryModels/UndoOverModal.jsx"
import OnPitchPlayerModal from "./CommentaryModels/OnPitchPlayerModal.jsx"
import { STRING_SEPERATOR } from "../../components/Common/Const.js"
import { UndoErrorModal } from "./CommentaryModels/UndoErrorModal.jsx"
import { PenaltyModal } from "./CommentaryModels/PenaltyModal.jsx"
import RetiredHurtModal from "./CommentaryModels/RetiredHurtModal.jsx"

const Commentary = (props) => {
    const dispatch = useDispatch();
    const [isLastInnigs, setIsLastInnings] = useState(undefined)
    const [ballHistory, setBallHistory] = useState([])
    const [overHistory, setOverHistory] = useState([])
    const [wicketHistory, setWicketHistory] = useState([])
    const [partnershipHistory, setPartnershipHistory] = useState([])
    const [currentOver, setCurrentOver] = useState({})
    const [currentPartnership, setCurrentPartnership] = useState({})
    const [currentBall, setCurrentBall] = useState({})
    const [currentWicket, setCurrentWicket] = useState({})
    const [teams, setTeams] = useState(undefined)
    const [players, setPlayers] = useState(undefined)
    const [onPitchPlayers, setOnPitchPlayers] = useState({})
    const [changePlayerList, setChangePlayerList] = useState(undefined)
    const [extrasType, setExtrasType] = useState(undefined)
    const [playerToChange, setPlayerToChange] = useState(undefined)
    const [changeOverOnPopupClick, setChangeOverOnPopupClick] = useState(undefined)
    const [showChangeOverModal, setShowChangeOverModal] = useState(undefined)
    const [showWicketModal, setShowWicketModal] = useState(undefined)
    const [saveToDb, setSaveToDb] = useState(undefined)
    const [isOverChange, setIsOverChange] = useState(undefined)
    const [isPaneltyPopup, setIsPaneltyPopup] = useState(undefined)
    const [undoOverPopup, setUndoOverPopup] = useState(undefined)
    const [isWicketChange, setIsWicketChange] = useState(undefined)
    const [playerUpdateList, setPlayerUpdateList] = useState(undefined)
    const [inningsChangePopup, setShowInningsChangePopup] = useState(undefined)
    const [redirectOnScreenChange, setRedirectOnScreenChange] = useState(undefined)
    const [showUpdateInnings, setShowUpdateInnings] = useState(undefined)
    const [winnerAnnouncement, setWinnerAnnouncement] = useState(undefined)
    const [showSwitchBatterModal, setShowSwitchBatterModal] = useState(undefined)
    const [isUndoBall, setIsUndoBall] = useState(undefined)
    const [undoErrorModal, setUndoErrorModal] = useState(undefined)
    const [undoInningsPopup, setUndoInningsPopup] = useState(undefined)
    const [updateRunsFromWicket, setUpdateRunFromWicket] = useState(undefined)
    const [isSwapPlayer, setIsSwapPlayer] = useState(undefined)
    const [isChangeBowler, setIsChangeBowler] = useState({})
    const [completeMatchModal, setCompleteMatchModal] = useState(undefined)
    const [overBallByBallDisplay, setOverBallByBallDisplay] = useState([])
    const [selectMissingPlayer, setSelectMissingPlayer] = useState([])
    const [showRretiredHurt, setShowRretiredHurt] = useState(false)
    const [target, setTarget] = useState(0)
    const matchTypeDetails = props.data.commentaryData.matchTypeDetails
    const commentaryDetails = { ...props.data.commentaryData.commentaryDetails, rmk: "", displayStatus: "" }
    const { commentaryDataToUpdate, isCommentaryDataUpdated, isUndoCompleted, isCommentaryBallLoading } = useSelector(state => state.tabsData.commentary);
    let navigate = useNavigate();
    useEffect(() => {
        // console.log({ playerUpdateList })
        // console.log({ saveToDb })
        // console.log(commentaryDetails, matchTypeDetails)
        // console.log("Current things: ", { currentBall, currentOver, currentPartnership, currentWicket, onPitchPlayers })
        // console.log("Batting Team: ", teams?.[BATTING_TEAM])
        // //     // console.log(currentOver, currentBall)
        // console.log("Histories: ", { ballHistory, overHistory, wicketHistory, partnershipHistory })
        // // console.log({ onPitchPlayers, teams })
        //     // console.log(onPitchPlayers, players?.[BATTING_TEAM], players?.[BOWLING_TEAM])
    })
    const checkForOverSwitch = (ballcount) => {
        if ((ballcount || currentOver.ballCount) >= (matchTypeDetails.ballsPerOver || 6)) setShowChangeOverModal(true)
    }
    const checkInningsSwitch = (checkFor) => {
        const maxNoOfWicket = matchTypeDetails.noOfPlayer - (matchTypeDetails.isLastManStand ? 0 : 1);
        const isOverLimitReached = () => {
            return matchTypeDetails.isLimitedOvers &&
                (Math.ceil(+currentOver.over || 0) + 1) >= teams[BATTING_TEAM]?.teamMaxOver;
        };

        const isWicketLimitReached = () => {
            return teams?.[BATTING_TEAM]?.teamWicket > maxNoOfWicket - 2;
        };

        const isRunTargetAchieved = () => {
            return isLastInnigs && target !== 0 && teams?.[BATTING_TEAM]?.teamScore >= target;
        };

        let conditionsToCheck = [];
        switch (checkFor) {
            case 'ALL':
                conditionsToCheck = [isOverLimitReached(), isWicketLimitReached(), isRunTargetAchieved()]; break;
            case 'OVER':
                conditionsToCheck = [isOverLimitReached()]; break;
            case 'WICKET':
                conditionsToCheck = [isWicketLimitReached()]; break;
            case 'RUN':
                conditionsToCheck = [isRunTargetAchieved()]; break;
            default: break;
        }
        if (conditionsToCheck.some(condition => condition)) {
            if (teams?.[BOWLING_TEAM].isBattingComplete && isLastInnigs) setCompleteMatchModal(true)
            else setShowInningsChangePopup(true);
        }
    }
    const checkWinner = () => {
        const isMatchTie = teams?.[BATTING_TEAM]?.teamScore === target - 1
        const isBattingTeamWon = teams?.[BATTING_TEAM]?.teamScore >= target
        const WINNING_TEAM = isBattingTeamWon ? BATTING_TEAM : BOWLING_TEAM
        const WINNING_MESSAGE = isMatchTie ? `Match tied  between ${teams?.[BATTING_TEAM].teamName} and ${teams?.[BOWLING_TEAM].teamName}.`
            : fetchWinnerMessage({ team: teams, matchTypeDetails, target, winningTeam: WINNING_TEAM, isBattingTeamWon })
        const teamUpdates = [
            { ...teams?.[BATTING_TEAM], isBattingComplete: true, isWin: isBattingTeamWon },
            { ...teams?.[BOWLING_TEAM], isWin: !isBattingTeamWon }]
        const commentaryUpdates = {
            "commentaryStatus": 4,
            "winnerId": teams?.[WINNING_TEAM].commentaryTeamId,
            "winnerName": teams?.[WINNING_TEAM].teamName,
            "displayStatus": "",
            "result": WINNING_MESSAGE
        }
        let objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": {
                ...commentaryDetails,
                ...commentaryUpdates
            },
            "commentaryTeams": teamUpdates,
            "commentaryPlayers": [
                { ...onPitchPlayers[ON_STRIKE], isPlay: null, onStrike: null },
                { ...onPitchPlayers[NON_STRIKE], isPlay: null, },
            ],
        }
        dispatch(addCommentaryScreenData(objToSave))
        setShowInningsChangePopup(undefined)
        setCompleteMatchModal(undefined)
        setRedirectOnScreenChange(true)
        setWinnerAnnouncement(WINNING_MESSAGE)
    }
    const onInningsChange = () => {
        let teamUpdates = undefined
        let commentaryUpdates = undefined
        let playersToUpdate = []
        if (teams[BOWLING_TEAM].isBattingComplete && !isLastInnigs) {
            setShowUpdateInnings(true)
        } else {
            const runDifference = (teams[BATTING_TEAM]?.teamScore || 0) + (teams[BATTING_TEAM]?.teamLeadRuns || 0) - (teams[BATTING_TEAM]?.teamTrialRuns || 0)
            const trialRuns = Math.max(runDifference, 0)
            const leadRuns = Math.max(-runDifference, 0)
            teamUpdates = [
                { ...teams?.[BATTING_TEAM], isBattingComplete: true, teamStatus: 2 },
                { ...teams?.[BOWLING_TEAM], teamStatus: 1, teamTrialRuns: trialRuns, teamLeadRuns: leadRuns }]
            commentaryUpdates = {
                "commentaryStatus": 2,
                "displayStatus": "Batting for Current team Completed"
            }
            setRedirectOnScreenChange(true)
        }
        if (onPitchPlayers[ON_STRIKE]) playersToUpdate.push({ ...onPitchPlayers[ON_STRIKE], isPlay: null, onStrike: null })
        if (onPitchPlayers[NON_STRIKE]) playersToUpdate.push({ ...onPitchPlayers[NON_STRIKE], isPlay: null, })
        let objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": {
                ...commentaryDetails,
                ...commentaryUpdates
            },
            "commentaryTeams": teamUpdates,
            "commentaryPlayers": playersToUpdate,
        }
        dispatch(addCommentaryScreenData(objToSave))
        setShowInningsChangePopup(undefined)
    }
    const handleInningsUpdate = (battingTeamId) => {
        let updatedInningsTeam = [{ ...teams?.[BATTING_TEAM], isBattingComplete: true }]
        props.data.commentaryData?.commentaryTeams?.forEach(team => {
            if (team.currentInnings === (commentaryDetails.currentInnings + 1)) {
                // Issue check
                const updatedTeamStatus = team.teamId === battingTeamId ? 1 : 2
                updatedInningsTeam.push({ ...team, teamStatus: updatedTeamStatus, teamBattingOrder: updatedTeamStatus + (+commentaryDetails.currentInnings * 2) })
            }
        });
        let objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": {
                ...commentaryDetails,
                currentInnings: commentaryDetails.currentInnings + 1,
                commentaryStatus: 2,
                "displayStatus": "Innings Changed"
            },
            "commentaryTeams": updatedInningsTeam,
            "commentaryPlayers": [
                { ...onPitchPlayers[ON_STRIKE], isPlay: null, onStrike: null },
                { ...onPitchPlayers[NON_STRIKE], isPlay: null, }
            ],
        }
        dispatch(addCommentaryScreenData(objToSave))
        setShowUpdateInnings(undefined)
        setRedirectOnScreenChange(true)
    }
    const callWicketToDB = (currentBallByBallID) => {
        const newCurrentBall = currentBall
        newCurrentBall["commentaryBallByBallId"] = currentBallByBallID
        const updatedPartnership = generatePartnership({ commentaryDetails, currentPartnership, teams })
        const updatedBallByBall = generateBall({ currentBall: newCurrentBall, commentaryDetails, currentOver, onPitchPlayers, teams })
        const updatedWicket = generateWicket({ commentaryDetails, currentOver, teams, currentWicket, currentBall: newCurrentBall })
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": {
                ...commentaryDetails,
                "displayStatus": generateDisplayStatus({ currentBall: updatedBallByBall }),
                "rmk": teams[BATTING_TEAM].teamTrialRuns ?
                    generateRemainingRuns(teams[BATTING_TEAM], matchTypeDetails.ballsPerOver) :
                    ""
            },
            "commentaryOvers": {
                ...currentOver,
                "teamScore": `${teams[BATTING_TEAM]?.teamScore || 0}/${teams[BATTING_TEAM]?.teamWicket || 0}`
            },
            "commentaryTeams": [teams[BATTING_TEAM]],
            "commentaryPartnership": updatedPartnership,
            "commentaryBallByBall": updatedBallByBall,
            "commentaryWicket": updatedWicket,
            "commentaryPlayers": Object.values(onPitchPlayers),
        }
        dispatch(addCommentaryScreenData(objToSave))
        setSaveToDb(false)
        setOnPitchPlayers({
            ...onPitchPlayers,
            [ON_STRIKE]: onPitchPlayers[ON_STRIKE].isPlay ? onPitchPlayers[ON_STRIKE] : null,
            [NON_STRIKE]: onPitchPlayers[NON_STRIKE].isPlay ? onPitchPlayers[NON_STRIKE] : null
        })
        setUpdateRunFromWicket(undefined)
        // checkForOverSwitch(onPitchPlayers[CURRENT_BOWLER]?.bowlerOver)
    }
    const updateRuns = ({ run, ball, batter, bowler, isBoundary, freezePlayers = false }) => {
        if (!freezePlayers) setCurrentBall({})
        const updateBattingTeam = {}
        let updateBatter = {}
        let updateBowler = {}
        const updateOver = {}
        const updatePartnership = {}
        const updateBall = {}
        let isChangeStrike = undefined

        const updatedBowlerOver = ball > 0 ? ((+bowler.bowlerOver || 0) + 0.1).toFixed(1) : bowler.bowlerOver
        updateBall["ballIsCount"] = ball > 0
        updateBall["ballType"] = BALL_TYPE_REGULAR
        updateBall["ballRun"] = run
        updateBall["batStrikeId"] = onPitchPlayers[ON_STRIKE].commentaryPlayerId
        updateBall["batNonStrikeId"] = onPitchPlayers[NON_STRIKE].commentaryPlayerId
        updateBatter["batRun"] = (batter.batRun || 0) + run
        updateBatter["batBall"] = (batter.batBall || 0) + ball
        updateBatter["batsmanStrikeRate"] = getStrikeRate(updateBatter.batRun, updateBatter.batBall)
        updateBowler["bowlerRun"] = (+bowler.bowlerRun || 0) + run
        updateBowler["bowlerTotalBall"] = (+bowler.bowlerTotalBall || 0) + ball
        updateBowler["bowlerOver"] = updatedBowlerOver
        updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, updateBowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
        updatePartnership["totalRuns"] = (currentPartnership.totalRuns || 0) + run
        updatePartnership["totalBalls"] = (currentPartnership.totalBalls || 0) + ball
        updateOver["ballCount"] = (currentOver.ballCount || 0) + ball
        updateOver["totalRun"] = (currentOver.totalRun || 0) + run
        updateBattingTeam["teamWicket"] = (+teams[BATTING_TEAM].teamWicket || 0)
        updateBattingTeam["teamScore"] = (+teams[BATTING_TEAM].teamScore || 0) + run
        updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, { ...currentOver, ...updateOver }, matchTypeDetails.ballsPerOver)
        updateBattingTeam["teamOver"] = ball > 0 ?
            ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1) : teams[BATTING_TEAM].teamOver
        if (matchTypeDetails.isLimitedOvers && (target > 0)) {
            updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                currentOver, matchTypeDetails.ballsPerOver, target, teams[BATTING_TEAM]?.teamMaxOver)
        }
        if (run === 0) {
            updateBall["ballIsDot"] = true
            updateBatter["batDotBall"] = (batter.batDotBall || 0) + ball
            updateOver["dotBall"] = (currentOver.dotBall || 0) + ball
            updateBowler["bowlerDotBall"] = (bowler.bowlerDotBall || 0) + ball
        } else if (isBoundary) {
            if (run === 4) {
                updateBall["ballIsBoundry"] = true
                updateBall["ballFour"] = 1
                updateBatter["batFour"] = (batter.batFour || 0) + 1
                updateOver["totalFour"] = (currentOver.totalFour || 0) + 1
                updateBowler["bowlerFour"] = (bowler.bowlerFour || 0) + 1
            } else if (run === 6) {
                updateBall["ballIsBoundry"] = true
                updateBall["ballSix"] = 1
                updateBatter["batSix"] = (batter.batSix || 0) + 1
                updateOver["totalSix"] = (currentOver.totalSix || 0) + 1
                updateBowler["bowlerSix"] = (bowler.bowlerSix || 0) + 1
            }
        } else if (run % 2 !== 0) isChangeStrike = freezePlayers ? false : true
        updateBatter = { ...onPitchPlayers[ON_STRIKE], ...updateBatter, onStrike: isChangeStrike ? false : true }
        updateBowler = { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
        const updateNonStriker = { ...onPitchPlayers[NON_STRIKE], onStrike: isChangeStrike ? true : false }
        if (!freezePlayers) {
            updateNonStriker["onStrike"] = isChangeStrike ? true : false
            updateBatter["onStrike"] = isChangeStrike ? false : true
        }
        if (!freezePlayers) checkForOverSwitch(updateOver.ballCount)
        setPlayers({
            [BOWLING_TEAM]: players?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player),
            [BATTING_TEAM]: players?.[BATTING_TEAM].map(player => {
                if (compareNumStringValues(player.commentaryPlayerId, updateBatter.commentaryPlayerId))
                    return updateBatter
                else if (compareNumStringValues(player.commentaryPlayerId, updateNonStriker.commentaryPlayerId))
                    return updateNonStriker
                else return player
            })
        })
        setOnPitchPlayers({ [ON_STRIKE]: isChangeStrike ? updateNonStriker : updateBatter, [NON_STRIKE]: isChangeStrike ? updateBatter : updateNonStriker, [CURRENT_BOWLER]: updateBowler })
        setTeams((prevData) => { return { ...prevData, [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam } } })
        setCurrentBall((prevValue) => { return { ...prevValue, ...updateBall } })
        setCurrentOver((prevValue) => { return { ...prevValue, ...updateOver, } })
        setCurrentPartnership((prevValue) => { return { ...prevValue, ...updatePartnership, } })
        setSaveToDb(true)
    }
    const updateExtras = (type, runs, isBoundary = false) => {
        setCurrentBall({})
        const bowler = onPitchPlayers[CURRENT_BOWLER]
        const batter = onPitchPlayers[ON_STRIKE]
        const updateBattingTeam = {}
        const updateOver = {}
        const updateBall = {}
        const updatePartnership = {}
        const updateBowler = {}
        const updatedBowlerOver = ((+bowler.bowlerOver || 0) + 0.1).toFixed(1)
        updateBattingTeam["teamWicket"] = (+teams[BATTING_TEAM].teamWicket || 0)
        if (isBoundary) {
            if (+runs === 4) {
                updateBall["ballIsBoundry"] = true
                updateBall["ballFour"] = 1
                updateOver["totalFour"] = (currentOver.totalFour || 0) + 1
                updateBowler["bowlerFour"] = (bowler.bowlerFour || 0) + 1
            } else if (+runs === 6) {
                updateBall["ballIsBoundry"] = true
                updateBall["ballSix"] = 1
                updateOver["totalSix"] = (currentOver.totalSix || 0) + 1
                updateBowler["bowlerSix"] = (bowler.bowlerSix || 0) + 1
            }
        }
        if (type === BALL_WIDE) {
            const runToUpdate = (+matchTypeDetails["valueOfWideBall"] || 0) + runs
            updateBowler["bowlerWideBall"] = (bowler.bowlerWideBall || 0) + 1
            updateBowler["bowlerWideBallRun"] = (bowler.bowlerWideBallRun || 0) + runToUpdate
            updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + runToUpdate
            updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, bowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
            updateBattingTeam["teamWideRuns"] = (updateBattingTeam.teamWideRuns || 0) + runToUpdate
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
            updateOver["totalWideBall"] = (currentOver.totalWideBall || 0) + 1
            updateOver["totalWideRun"] = (currentOver.totalWideRun || 0) + runToUpdate
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runToUpdate
            updateBall["ballIsCount"] = false
            updateBall["ballRun"] = runs
            updateBall["ballExtraRun"] = (+matchTypeDetails["valueOfWideBall"] || 0)
            updateBall["ballType"] = BALL_TYPE_WIDE
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runToUpdate
            updatePartnership["extras"] = currentPartnership.extras + runToUpdate
        } else if (type === NO_BALL || type === NO_BALL_BYE || type === NO_BALL_LEG_BYE) {
            const valueOfNoBall = (+matchTypeDetails["valueOfNoBall"] || 0)
            const runToUpdate = valueOfNoBall + runs
            updateBowler["bowlerNoBall"] = (bowler.bowlerNoBall || 0) + 1
            updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) + valueOfNoBall
            updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + runToUpdate
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
            updateBattingTeam["teamNoBallRuns"] = (updateBattingTeam.teamNoBallRuns || 0) + valueOfNoBall
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runToUpdate
            updateOver["totalNoball"] = (currentOver.totalNoball || 0) + 1
            updateOver["totalNoBallRun"] = (currentOver.totalNoBallRun || 0) + valueOfNoBall
            updateBall["ballIsCount"] = false
            updateBall["ballRun"] = runs
            updateBall["ballExtraRun"] = valueOfNoBall
            if (type === NO_BALL) {
                updateBall["ballType"] = BALL_TYPE_NO_BALL
                batter["batRun"] = (batter.batRun || 0) + runs
                updatePartnership["extras"] = currentPartnership.extras + valueOfNoBall
            } else if (type === NO_BALL_BYE) {
                updateBall["ballType"] = BALL_TYPE_NO_BALL_BYE
                updateBowler["bowlerByeBallRun"] = (bowler.bowlerByeBallRun || 0) + runs
                updateOver["bowlerByeBallRun"] = (currentOver.bowlerByeBallRun || 0) + runs
                updatePartnership["extras"] = currentPartnership.extras + runToUpdate
                updateBattingTeam["teamByRuns"] = (updateBattingTeam.teamByRuns || 0) + runs
            }
            else if (type === NO_BALL_LEG_BYE) {
                updateBall["ballType"] = BALL_TYPE_NO_BALL_LEG_BYE
                updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) + runs
                updateOver["totalLegByesRun"] = (currentOver.totalNoBallRun || 0) + runs
                updatePartnership["extras"] = currentPartnership.extras + runToUpdate
                updateBattingTeam["teamLegByRuns"] = (updateBattingTeam.teamLegByRuns || 0) + runs
            }
            batter["batBall"] = (batter.batBall || 0) + 1
            batter["batsmanStrikeRate"] = getStrikeRate(batter.batRun, batter.batBall)
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runToUpdate
            updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, bowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
        }
        else {
            updateBall["ballIsCount"] = true
            updateBowler["bowlerOver"] = updatedBowlerOver
            updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) + 1
            updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, updateBowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
            updateOver["ballCount"] = (currentOver.ballCount || 0) + 1
            batter["batBall"] = (batter.batBall || 0) + 1
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runs
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runs
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runs
            updatePartnership["extras"] = currentPartnership.extras + runs
            updatePartnership["totalBalls"] = currentPartnership.totalBalls + 1
            updateBall["ballIsCount"] = false
            updateBall["ballRun"] = runs
            updateBall["ballExtraRun"] = runs
            updateBattingTeam["teamOver"] =
                ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1)
            if (type === BALL_BYE) {
                updateBowler["bowlerByeBall"] = (bowler.bowlerByeBall || 0) + 1
                updateBowler["bowlerByeBallRun"] = (bowler.bowlerByeBallRun || 0) + runs
                updateOver["totalByesBall"] = (currentOver.totalByesBall || 0) + 1
                updateOver["totalByesRun"] = (currentOver.totalByesRun || 0) + runs
                updateBall["ballType"] = BALL_TYPE_BYE
                updateBattingTeam["teamByRuns"] = (updateBattingTeam.teamByRuns || 0) + runs
            }
            else if (type === BALL_LEG_BYE) {
                updateBowler["bowlerLegByeBall"] = (bowler.bowlerLegByeBall || 0) + 1
                updateBowler["bowlerLegByeBallRun"] = (bowler.bowlerLegByeBallRun || 0) + runs
                updateOver["totalLegByesBall"] = (currentOver.totalLegByesBall || 0) + 1
                updateOver["totalLegByesRun"] = (currentOver.totalLegByesRun || 0) + runs
                updateBall["ballType"] = BALL_TYPE_LEG_BYE
                updateBattingTeam["teamLegByRuns"] = (updateBattingTeam.teamLegByRuns || 0) + runs
            }
            checkForOverSwitch(updateOver.ballCount)
        }
        if (matchTypeDetails.isLimitedOvers && (target > 0)) {
            updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                currentOver, matchTypeDetails.ballsPerOver, target, teams[BATTING_TEAM]?.teamMaxOver)
        }
        const isStrikeChange = runs % 2 !== 0
        updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, { ...currentOver, ...updateOver }, matchTypeDetails.ballsPerOver)
        updateBall["batStrikeId"] = onPitchPlayers[ON_STRIKE].commentaryPlayerId
        updateBall["batNonStrikeId"] = onPitchPlayers[NON_STRIKE].commentaryPlayerId
        const updatedOnStrike = { ...onPitchPlayers[ON_STRIKE], ...batter }
        const updateBatter = isStrikeChange ? onPitchPlayers[NON_STRIKE] : updatedOnStrike
        const updateNonStriker = !isStrikeChange ? onPitchPlayers[NON_STRIKE] : updatedOnStrike
        updateBatter["onStrike"] = true
        updateNonStriker["onStrike"] = false
        setOnPitchPlayers((prevData) => {
            return { [ON_STRIKE]: updateBatter, [NON_STRIKE]: updateNonStriker, [CURRENT_BOWLER]: { ...prevData[CURRENT_BOWLER], ...updateBowler } }
        })
        setPlayers({
            [BOWLING_TEAM]: players?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player),
            [BATTING_TEAM]: players?.[BATTING_TEAM].map(player => {
                if (compareNumStringValues(player.commentaryPlayerId, updateBatter.commentaryPlayerId))
                    return updateBatter
                else if (compareNumStringValues(player.commentaryPlayerId, updateNonStriker.commentaryPlayerId))
                    return updateNonStriker
                else return player
            })
        })
        setTeams((prevData) => { return { ...prevData, [BATTING_TEAM]: { ...prevData[BATTING_TEAM], ...updateBattingTeam } } })
        setCurrentOver((prevOver) => { return { ...prevOver, ...updateOver } })
        setCurrentBall((prevValue) => { return { ...prevValue, ...updateBall } })
        setCurrentPartnership((prevValue) => { return { ...prevValue, ...updatePartnership } })
        setSaveToDb(true)
    }
    const updatePanelty = (runs) => {
        const updateBall = {}
        const updateBattingTeam = teams[BATTING_TEAM]
        updateBattingTeam["teamScore"] = (+teams[BATTING_TEAM].teamScore || 0) + runs
        updateBattingTeam["teamPenaltyRuns"] = (+teams[BATTING_TEAM].teamPenaltyRuns || 0) + runs
        updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, { ...currentOver }, matchTypeDetails.ballsPerOver)
        if (matchTypeDetails.isLimitedOvers && (target > 0)) {
            updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                currentOver, matchTypeDetails.ballsPerOver, target, teams[BATTING_TEAM]?.teamMaxOver)
        }
        updateBall["commentaryBallByBallId"] = "0"
        updateBall["ballIsCount"] = false
        updateBall["ballRun"] = runs
        updateBall["ballExtraRun"] = runs
        updateBall["ballType"] = BALL_TYPE_PANELTY_RUN
        setCurrentBall(updateBall)
        setTeams({ ...teams, [BATTING_TEAM]: updateBattingTeam })
        const generatedBallByBall = generateBall({ currentBall: updateBall, commentaryDetails, currentOver, onPitchPlayers, teams })
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryBallByBall": generatedBallByBall,
            "commentaryDetails": { ...commentaryDetails, "displayStatus": `Penalty ${runs} runs` },
            "commentaryTeams": [updateBattingTeam],
        }
        dispatch(addCommentaryScreenData(objToSave))
        checkInningsSwitch(RUN)
    }
    const changeOver = () => {
        let updateBattingTeam = {
            ...teams[BATTING_TEAM],
            "teamOver": Math.ceil(+teams[BATTING_TEAM].teamOver || 0)
        }
        const updateBowler = {
            ...onPitchPlayers[CURRENT_BOWLER],
            "isPlay": null,
            "bowlerOver": Math.ceil(+onPitchPlayers[CURRENT_BOWLER].bowlerOver || 0),
            "bowlerMaidenOver": currentOver.totalRun < 1 ? 1 : 0
        }
        const newOnStrikePlayer = { ...onPitchPlayers[NON_STRIKE], onStrike: true }
        const newNonStrikePlayer = { ...onPitchPlayers[ON_STRIKE], onStrike: false }
        const updatedOnPitchPlayer = {
            [ON_STRIKE]: newOnStrikePlayer,
            [NON_STRIKE]: newNonStrikePlayer,
        }
        const updatedOver = { ...currentOver, "teamScore": `${teams[BATTING_TEAM]?.teamScore || 0}/${teams[BATTING_TEAM]?.teamWicket || 0}`, "isComplete": true }
        setPlayerUpdateList([].concat([updateBowler], playerUpdateList || []))
        setTeams({ ...teams, [BATTING_TEAM]: updateBattingTeam })
        setOnPitchPlayers(updatedOnPitchPlayer)
        setPlayers((prevValue) => {
            return {
                [BOWLING_TEAM]: prevValue?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player),
                [BATTING_TEAM]: prevValue?.[BATTING_TEAM].map(player => {
                    if (compareNumStringValues(player.commentaryPlayerId, newOnStrikePlayer.commentaryPlayerId))
                        return newOnStrikePlayer
                    else if (compareNumStringValues(player.commentaryPlayerId, newNonStrikePlayer.commentaryPlayerId))
                        return newNonStrikePlayer
                    else return player
                })
            }
        })
        setCurrentOver(updatedOver)
        dispatch(addCommentaryScreenData({
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": {
                ...commentaryDetails,
                "displayStatus": "Over Completed"
            },
            "commentaryOvers": updatedOver,
            "commentaryPlayers": [newOnStrikePlayer, newNonStrikePlayer, updateBowler],
            "commentaryTeams": [updateBattingTeam],
        }))
    }
    const handleMissingPlayerChange = (playerType, player) => {
        const updatedOnPitchPlyer = { ...onPitchPlayers, [playerType]: { ...player, "isPlay": true } }
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": {
                ...commentaryDetails,
                "displayStatus": "Player Changed"
            },
            "commentaryPlayers": Object.values(updatedOnPitchPlyer),
        }
        if (playerType === CURRENT_BOWLER) {
            if (!currentOver || currentOver.isComplete)
                objToSave["commentaryOvers"] = generateOver({ commentaryDetails, onPitchPlayers: updatedOnPitchPlyer, teams })
        }
        setOnPitchPlayers(updatedOnPitchPlyer)
        dispatch(addCommentaryScreenData(objToSave))
        setSelectMissingPlayer(false)
    }
    const handleWicket = (wicketData) => {
        // if (!wicketData.isExtraWicket) 
        setCurrentBall({})
        const ballToUpdateOnWicket = (wicketData.isExtraWicket || (wicketData.wicketType === RETIRED_OUT)) ? 0 : 1
        setIsWicketChange(true)
        const updateBattingTeam = {}
        const updateBall = {}
        const updateWicket = {}
        let updateBowler = {}
        let updateOver = {}
        let updatedBatter = {}
        updateBall["ballIsWicket"] = true
        updateBall["ballWicketType"] = wicketData.wicketType
        updateBall["ballFielderId1"] = wicketData.fielder1
        updateBall["ballFielderId2"] = wicketData.fielder2
        updateBall["batStrikeId"] = onPitchPlayers[ON_STRIKE].commentaryPlayerId
        updateBall["batNonStrikeId"] = onPitchPlayers[NON_STRIKE].commentaryPlayerId
        updateWicket["bowlerId"] = onPitchPlayers[CURRENT_BOWLER].commentaryPlayerId
        updateWicket["bowlerName"] = onPitchPlayers[CURRENT_BOWLER].playerName
        updateWicket["wicketType"] = wicketData.wicketType
        updateWicket["fieldPlayerId"] = wicketData.fielder1
        const isOnStrikeWicket = isEqual(wicketData.batterId, onPitchPlayers[ON_STRIKE].commentaryPlayerId)
        const wicketPlayerDetails = onPitchPlayers[isOnStrikeWicket ? ON_STRIKE : NON_STRIKE]
        updateOver["totalWicket"] = (currentOver.totalWicket || 0) + 1
        updateBattingTeam["teamWicket"] = (teams[BATTING_TEAM].teamWicket || 0) + 1
        if ((wicketData.wicketType !== RUN_OUT) && (wicketData.wicketType !== RETIRED_OUT)) {
            updateBowler["bowlerTotalWicket"] = (onPitchPlayers[CURRENT_BOWLER].bowlerTotalWicket || 0) + 1
        }
        updateBall["ballPlayerId"] = wicketPlayerDetails.commentaryPlayerId
        updateWicket["batterId"] = wicketPlayerDetails.commentaryPlayerId
        updateWicket["batterName"] = wicketPlayerDetails.playerName
        updateWicket["wicketCount"] = updateBattingTeam.teamWicket
        updateWicket["batterRuns"] = wicketPlayerDetails.batRun + (isOnStrikeWicket ? +wicketData.runs : 0)
        updateWicket["batterBalls"] = wicketPlayerDetails.batBall + isOnStrikeWicket ? ballToUpdateOnWicket : 0
        const updatedBattingPlayers = players[BATTING_TEAM]?.map((player) => {
            if (isEqual(player.commentaryPlayerId, wicketData.batterId)) {
                const playerDataToList = {
                    ...player,
                    "isBatterOut": true,
                    "isBatterRetir": wicketData.wicketType === RETIRED_OUT,
                    "wicketType": wicketData.wicketType,
                    "bowlerId": onPitchPlayers[CURRENT_BOWLER].commentaryPlayerId,
                    "fielderId1": wicketData.fielder1,
                    "fielderId2": wicketData.fielder2,
                    "isPlay": null,
                    "onStrike": null
                }
                updatedBatter = playerDataToList
                return playerDataToList
            }
            return player
        })
        setPlayers((prevData) => { return { ...prevData, [BATTING_TEAM]: updatedBattingPlayers } })
        setOnPitchPlayers((prevValue) => {
            return {
                [ON_STRIKE]: isOnStrikeWicket ? updatedBatter : prevValue[ON_STRIKE],
                [NON_STRIKE]: !isOnStrikeWicket ? updatedBatter : prevValue[NON_STRIKE],
                [CURRENT_BOWLER]: { ...prevValue[CURRENT_BOWLER], ...updateBowler }
            }
        })
        setTeams((prevValue) => {
            return { ...teams, [BATTING_TEAM]: { ...prevValue[BATTING_TEAM], ...updateBattingTeam } }
        })
        setCurrentOver((prevValue) => { return { ...prevValue, ...updateOver } })
        setCurrentBall((prevValue) => { return { ...prevValue, ...updateBall, } })
        changePlayer(isOnStrikeWicket ? ON_STRIKE : NON_STRIKE)
        setCurrentWicket(updateWicket)
        setShowWicketModal(undefined)
        checkInningsSwitch(WICKET)
        setExtrasType(undefined)
        setUpdateRunFromWicket({ run: +wicketData.runs, ball: ballToUpdateOnWicket, batter: onPitchPlayers[ON_STRIKE], bowler: onPitchPlayers[CURRENT_BOWLER], type: "", freezePlayers: true })
    }
    const onExtrasChange = (dataFromModal) => {
        updateExtras(extrasType, +dataFromModal.run, dataFromModal.isBoundary)
        if (dataFromModal.type === WICKET) setShowWicketModal(true)
        else setExtrasType(undefined)
    }
    const onPlayerChange = (newPlayerId) => {
        const teamType = playerToChange === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM
        const updateOrderKey = playerToChange === CURRENT_BOWLER ? "bowlerOrder" : "batterOrder"
        let newPlayer = undefined
        // const playerToChangeId = onPitchPlayers[playerToChange]?.commentaryPlayerId
        const allPlayersToUpdate = []
        const playerToUpdate = {
            ...players,
            [teamType]: players[teamType]?.map((player) => {
                if (player.isPlay || player.onStrike) {
                    const playerToUpdate = { ...player, "isPlay": null, "onStrike": null }
                    allPlayersToUpdate.push(playerToUpdate)
                    return playerToUpdate
                }
                if (isEqual(player.commentaryPlayerId, newPlayerId)) {
                    newPlayer = player
                    const updatedPlayer = {
                        ...player,
                        "isPlay": true,
                        "onStrike": playerToChange === ON_STRIKE ? true : playerToChange === NON_STRIKE ? false : null,
                        [updateOrderKey]: player[updateOrderKey] || fetchNextPlayerOrder(playerToChange, players[teamType])
                    }
                    newPlayer = updatedPlayer
                    return updatedPlayer
                }
                return player
            })
        }
        setPlayers(playerToUpdate)
        const updatedOnPitchPlayer = { ...onPitchPlayers, [playerToChange]: newPlayer }
        setOnPitchPlayers(updatedOnPitchPlayer)
        setPlayerUpdateList([].concat(allPlayersToUpdate, playerUpdateList || []))
        if (playerToChange === CURRENT_BOWLER) setIsOverChange(true)
        if (isWicketChange) {
            const partnershipDetails = {
                "batter1Id": updatedOnPitchPlayer[ON_STRIKE]?.commentaryPlayerId,
                "batter1Name": updatedOnPitchPlayer[ON_STRIKE]?.playerName,
                "batter2Id": updatedOnPitchPlayer[NON_STRIKE]?.commentaryPlayerId,
                "batter2Name": updatedOnPitchPlayer[NON_STRIKE]?.playerName,
            }
            const updatedPartnership = generatePartnership({ commentaryDetails, currentPartnership: partnershipDetails, teams })
            const objToSave = {
                "commentaryId": commentaryDetails.commentaryId,
                "commentaryPartnership": updatedPartnership,
                "commentaryDetails": commentaryDetails,
                "commentaryPlayers": Object.values(updatedOnPitchPlayer),
            }
            checkForOverSwitch()
            // Player Changed
            dispatch(addCommentaryScreenData(objToSave))
            setIsWicketChange(undefined)
            setCurrentPartnership({})
            setShowSwitchBatterModal(true)
        }
        setChangePlayerList(undefined)
        setPlayerToChange(undefined)
    }
    const changePlayer = (type) => {
        setPlayerToChange(type)
        setChangePlayerList(players[type === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM]
            ?.filter((player) => {
                if (type === CURRENT_BOWLER)
                    return player.isPlay === null
                else return player.isPlay === null && player.isBatterOut !== true
            }))
    }
    const swapPlayer = (newPlayerId) => {
        const oldPlayer = onPitchPlayers[playerToChange] || {}
        const teamType = playerToChange === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM
        let newPlayer = undefined
        players[teamType]?.forEach((player) => {
            if (isEqual(player.commentaryPlayerId, newPlayerId)) newPlayer = player
        })
        let updatedNewPlayer = {
            ...newPlayer,
            "playerId": oldPlayer["playerId"],
            "playerName": oldPlayer["playerName"],
            "batsmanAverage": oldPlayer["batsmanAverage"],
            "batsmanStrikeRate": oldPlayer["batsmanStrikeRate"],
            "bowlerAverage": oldPlayer["bowlerAverage"],
        }
        let updatedOldPlayer = {
            ...oldPlayer,
            "playerId": newPlayer["playerId"],
            "playerName": newPlayer["playerName"],
            "batsmanAverage": newPlayer["batsmanAverage"],
            "batsmanStrikeRate": newPlayer["batsmanStrikeRate"],
            "bowlerAverage": newPlayer["bowlerAverage"],
        }

        const listToUpdate = players[teamType]?.map((player) => {
            if (isEqual(player.commentaryPlayerId, oldPlayer.commentaryPlayerId)) return updatedOldPlayer
            else if (isEqual(player.commentaryPlayerId, newPlayer.commentaryPlayerId)) return updatedNewPlayer
            return player
        })
        const updatedOnPitchPlayer = { ...onPitchPlayers, [playerToChange]: updatedOldPlayer }
        setOnPitchPlayers(updatedOnPitchPlayer)
        updatedOnPitchPlayer["EXTRA_PLAYER"] = updatedNewPlayer
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryPlayers": Object.values(updatedOnPitchPlayer),
            "commentaryDetails": {
                ...commentaryDetails,
                "displayStatus": "Batter Switched"
            },
        }
        dispatch(addCommentaryScreenData(objToSave))
        setPlayers({ ...players, [teamType]: listToUpdate })
        setIsSwapPlayer(undefined)
        setChangePlayerList(undefined)
        setPlayerToChange(undefined)
    }
    const switchBowler = (newPlayerId) => {
        const currentBowler = onPitchPlayers[CURRENT_BOWLER]
        let newBowler = undefined
        players[BOWLING_TEAM]?.forEach((player) => {
            if (isEqual(player.commentaryPlayerId, newPlayerId)) newBowler = player
        })
        const updatedPerviousBowler = {
            ...currentBowler,
            "bowlerOver": +(currentBowler.bowlerOver || 0) - +(currentOver.ballCount / 10),
            "bowlerTotalBall": +currentBowler.bowlerTotalBall - +currentOver.ballCount,
            "bowlerRun": +currentBowler.bowlerRun - +currentOver.totalRun,
            "bowlerEconomy": getEconomyRate(+currentBowler.bowlerRun - +currentOver.totalRun, +currentBowler.bowlerTotalBall - +currentOver.ballCount, matchTypeDetails.ballsPerOver),
            "bowlerDotBall": +currentBowler.bowlerDotBall - +currentOver.dotBall,
            "bowlerFour": +currentBowler.bowlerFour - +currentOver.totalFour,
            "bowlerSix": +currentBowler.bowlerSix - +currentOver.totalSix,
            "bowlerWideBall": +currentBowler.bowlerWideBall - +currentOver.totalWideBall,
            "bowlerNoBall": +currentBowler.bowlerNoBall - +currentOver.totalNoball,
            "bowlerWideBallRun": +currentBowler.bowlerWideBallRun - +currentOver.totalWideRun,
            "bowlerNoBallRun": +currentBowler.bowlerNoBallRun - +currentOver.totalNoBallRun,
            "bowlerByeBallRun": +currentBowler.bowlerByeBallRun - +currentOver.totalByesRun,
            "bowlerLegByeBallRun": +currentBowler.bowlerLegByeBallRun - +currentOver.totalLegByesRun,
            "bowlerTotalWicket": +currentBowler.bowlerTotalWicket - +currentOver.totalWicket,
            "isPlay": null
        }
        const updatedNewBowler = {
            ...newBowler,
            "bowlerOver": +(newBowler.bowlerOver || 0) + +(currentOver.ballCount / 10),
            "bowlerTotalBall": +(newBowler.bowlerTotalBall || 0) + +(currentOver.ballCount || 0),
            "bowlerRun": +(newBowler.bowlerRun || 0) + +(currentOver.totalRun || 0),
            "bowlerEconomy": getEconomyRate(+currentBowler.bowlerRun + +currentOver.totalRun, currentOver, matchTypeDetails.ballsPerOver),
            "bowlerDotBall": +(newBowler.bowlerDotBall || 0) + +(currentOver.dotBall || 0),
            "bowlerFour": +(newBowler.bowlerFour || 0) + +(currentOver.totalFour || 0),
            "bowlerSix": +(newBowler.bowlerSix || 0) + +(currentOver.totalSix || 0),
            "bowlerWideBall": +(newBowler.bowlerWideBall || 0) + +(currentOver.totalWideBall || 0),
            "bowlerNoBall": +(newBowler.bowlerNoBall || 0) + +(currentOver.totalNoball || 0),
            "bowlerWideBallRun": +(newBowler.bowlerWideBallRun || 0) + +(currentOver.totalWideRun || 0),
            "bowlerNoBallRun": +(newBowler.bowlerNoBallRun || 0) + +(currentOver.totalNoBallRun || 0),
            "bowlerByeBallRun": +(newBowler.bowlerByeBallRun || 0) + +(currentOver.totalByesRun || 0),
            "bowlerLegByeBallRun": +(newBowler.bowlerLegByeBallRun || 0) + +(currentOver.totalLegByesRun || 0),
            "bowlerTotalWicket": +(newBowler.bowlerTotalWicket || 0) + +(currentOver.totalWicket || 0),
            "isPlay": true
        }
        const UpdatedOver = {
            ...currentOver,
            "bowlerId": newPlayerId
        }
        const updatedPlayerList = players[BOWLING_TEAM].map(player => {
            if (isEqual(player.commentaryPlayerId, currentBowler.commentaryPlayerId)) return updatedPerviousBowler
            else if (isEqual(player.commentaryPlayerId, newBowler.commentaryPlayerId)) return updatedNewBowler
            else return player
        })
        const objForChangeBowler = {
            "commentaryId": commentaryDetails.commentaryId,
            "bowlerId": newPlayerId,
            "currentInnings": commentaryDetails.currentInnings,
            "overId": currentOver.overId
        }
        dispatch(addCommentaryScreenData({
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryPlayers": [updatedPerviousBowler, updatedNewBowler],
        }))
        dispatch(changeBowlerFromCommentary(objForChangeBowler))
        setCurrentOver(UpdatedOver)
        setPlayers({ ...players, [BOWLING_TEAM]: updatedPlayerList })
        setOnPitchPlayers({ ...onPitchPlayers, [CURRENT_BOWLER]: updatedNewBowler })
        setChangePlayerList(undefined)
        setPlayerToChange(undefined)
        setIsChangeBowler({ isChange: null, isChangePopup: null, popupOption: null })
    }
    const sameOverNewBaller = (newPlayerId) => {
        const playersToChangeList = []
        const updateBall = {
            "commentaryBallByBallId": "0",
            "ballIsCount": false,
            "ballRun": 0,
            "ballExtraRun": 0,
            "bowlerId": onPitchPlayers[CURRENT_BOWLER]?.commentaryPlayerId,
            "batStrikeId": onPitchPlayers[ON_STRIKE]?.commentaryPlayerId,
            "batNonStrikeId": onPitchPlayers[NON_STRIKE]?.commentaryPlayerId,
            "ballType": BALL_TYPE_BOWLER_RETIRED_HURT
        }
        let updatedOnPitchPlayer = onPitchPlayers
        const updatedPlayerList = players[BOWLING_TEAM]?.map(player => {
            const updatedPlayer = player
            if (player.isPlay || player.onStrike) {
                updatedPlayer["isPlay"] = null
                updatedPlayer["onStrike"] = null
                playersToChangeList.push(updatedPlayer)
            }
            if (updatedPlayer.commentaryPlayerId === newPlayerId) {
                updatedPlayer["isPlay"] = true
                playersToChangeList.push(updatedPlayer)
                updatedOnPitchPlayer[CURRENT_BOWLER] = updatedPlayer
            }
            return updatedPlayer
        })
        const generatedBallByBall = generateBall({ currentBall: updateBall, commentaryDetails, currentOver, onPitchPlayers: { ...onPitchPlayers }, teams })
        const objToSave = {
            "commentaryBallByBall": generatedBallByBall,
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryPlayers": playersToChangeList,
        }
        dispatch(addCommentaryScreenData(objToSave))
        setCurrentBall(updateBall)
        setPlayers({ ...players, [BOWLING_TEAM]: updatedPlayerList })
        setOnPitchPlayers(updatedOnPitchPlayer)
        setChangePlayerList(undefined)
        setPlayerToChange(undefined)
        setIsChangeBowler({ isChange: null, isChangePopup: null, popupOption: null })
    }
    const undoSameOverNewBaller = () => {
        const playersToChangeList = []
        let updatedOnPitchPlayer = onPitchPlayers
        const updatedPlayerList = players[BOWLING_TEAM]?.map(player => {
            const updatedPlayer = player
            if (player.isPlay || player.onStrike) {
                updatedPlayer["isPlay"] = null
                updatedPlayer["onStrike"] = null
                playersToChangeList.push(updatedPlayer)
            }
            if (updatedPlayer.commentaryPlayerId === currentBall.bowlerId) {
                updatedPlayer["isPlay"] = true
                playersToChangeList.push(updatedPlayer)
                updatedOnPitchPlayer[CURRENT_BOWLER] = updatedPlayer
            }
            return updatedPlayer
        })
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryPlayers": playersToChangeList,
            "deleteCommentaryBallByBallId": currentBall.commentaryBallByBallId
        }
        dispatch(addCommentaryScreenData(objToSave))
        setPlayers({ ...players, [BOWLING_TEAM]: updatedPlayerList })
        setOnPitchPlayers(updatedOnPitchPlayer)
    }
    const onBowlerChange = (newPlayerId) => {
        if (isChangeBowler.popupOption === SWITCH_BOWLER) switchBowler(newPlayerId)
        else if (isChangeBowler.popupOption === CHANGE_BOWLER) sameOverNewBaller(newPlayerId)
    }
    const changeOnStrikePlayer = (commentaryPlayerId) => {
        const isPlayerOnNonstrike = compareNumStringValues(onPitchPlayers[NON_STRIKE].commentaryPlayerId, commentaryPlayerId)
        if (isPlayerOnNonstrike) {
            const updatedOnStrikePlayer = { ...onPitchPlayers[NON_STRIKE], onStrike: true }
            const updatedNonStrikePlayer = { ...onPitchPlayers[ON_STRIKE], onStrike: false }
            setOnPitchPlayers({ ...onPitchPlayers, [ON_STRIKE]: updatedOnStrikePlayer, [NON_STRIKE]: updatedNonStrikePlayer })
            const objToSave = {
                "commentaryId": commentaryDetails.commentaryId,
                "commentaryDetails": { ...commentaryDetails, "displayStatus": `${updatedOnStrikePlayer.playerName} on Strike` },
                "commentaryBallByBall": generateBall({
                    currentBall, commentaryDetails, currentOver,
                    onPitchPlayers: { ...onPitchPlayers, [ON_STRIKE]: updatedOnStrikePlayer, [NON_STRIKE]: updatedNonStrikePlayer }, teams
                }),
                "commentaryPlayers": [updatedOnStrikePlayer, updatedNonStrikePlayer, onPitchPlayers[CURRENT_BOWLER]]
            }
            dispatch(addCommentaryScreenData(objToSave))
        }
        setCurrentWicket(undefined)
        setShowSwitchBatterModal(undefined)
    }
    const handleUndoClick = () => {
        console.log(currentBall.commentaryBallByBallId && (+currentBall.overCount === +teams[BATTING_TEAM].teamOver))
        console.log(currentBall.commentaryBallByBallId, +currentBall.overCount, +teams[BATTING_TEAM].teamOver)
        console.log(currentOver, currentBall, players[BATTING_TEAM])
        if (currentBall.commentaryBallByBallId && (+currentBall.overCount === +teams[BATTING_TEAM].teamOver)) {
            if (((currentOver.over || 0) === 0) && ((currentOver.ballCount || 0) === 0) && (currentBall.ballType === BALL_TYPE_OVER_COMPLETE)
                && ((currentBall.ballRun || 0) === 0) && ((currentBall.ballExtraRun || 0) === 0)) {
                setUndoInningsPopup(true)
            } else if ((currentBall.ballType === BALL_TYPE_OVER_COMPLETE)
                && (currentBall.currentOverBalls === 0) && (currentBall.ballRun === 0)) setUndoOverPopup(true)
            else if (currentBall.ballType === BALL_TYPE_RETIRED_HURT) undoRetiredHurt()
            else if (currentBall.ballType === BALL_TYPE_BOWLER_RETIRED_HURT) undoSameOverNewBaller()
            else if (currentBall.ballType === BALL_TYPE_PANELTY_RUN) {
                const updateBattingTeam = teams[BATTING_TEAM]
                const run = currentBall.ballExtraRun
                updateBattingTeam["teamScore"] = (+teams[BATTING_TEAM].teamScore || 0) - run
                updateBattingTeam["teamPenaltyRuns"] = (+teams[BATTING_TEAM].teamPenaltyRuns || 0) - run
                updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, { ...currentOver }, matchTypeDetails.ballsPerOver)
                if (matchTypeDetails.isLimitedOvers && (target > 0)) {
                    updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                        currentOver, matchTypeDetails.ballsPerOver, target, teams[BATTING_TEAM]?.teamMaxOver)
                }
                setTeams({ ...teams, [BATTING_TEAM]: updateBattingTeam })
                const objToSave = {
                    "commentaryId": commentaryDetails.commentaryId,
                    "commentaryTeams": [updateBattingTeam],
                    "deleteCommentaryBallByBallId": currentBall.commentaryBallByBallId
                }
                dispatch(addCommentaryScreenData(objToSave))
            }
            else {
                const isBallCount = currentBall.ballIsCount
                const updateBattingTeam = {}
                let updateBowler = {}
                let undoType = RUN
                const updateOver = {}
                let updatePartnership = { ...currentPartnership }
                let playersOnPitch = onPitchPlayers
                if (currentBall.ballIsWicket) {
                    undoType = WICKET
                    updateOver["totalWicket"] = (currentOver.totalWicket || 0) - 1
                    updateBattingTeam["teamWicket"] = (teams[BATTING_TEAM].teamWicket || 0) - 1
                    if ((currentBall.ballWicketType !== RUN_OUT) && (currentBall.ballWicketType !== RETIRED_OUT)) {
                        updateBowler["bowlerTotalWicket"] = (onPitchPlayers[CURRENT_BOWLER].bowlerTotalWicket || 0) - 1
                    }
                    updatePartnership = { ...partnershipHistory[partnershipHistory.length - 2] }
                    playersOnPitch = updatePlayerAfterUndoWicket()
                }
                const bowler = playersOnPitch[CURRENT_BOWLER]
                const type = currentBall.ballType
                const isOnStrikeSame = compareNumStringValues(playersOnPitch[ON_STRIKE].commentaryPlayerId, currentBall.batStrikeId)
                const batter = isOnStrikeSame ? playersOnPitch[ON_STRIKE] : playersOnPitch[NON_STRIKE]
                const run = currentBall.ballRun
                const totalRun = currentBall.ballExtraRun + currentBall.ballRun
                let updateBatter = {}
                const updatedBowlerOver = isBallCount ? ((+bowler.bowlerOver || 0) - 0.1).toFixed(1) : +bowler.bowlerOver
                if (type === BALL_TYPE_REGULAR) {
                    if (isBallCount) {
                        updateBatter["batBall"] = (batter.batBall || 0) - (currentBall.ballIsCount ? 1 : 0)
                        updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) - 1
                        updateOver["ballCount"] = (currentOver.ballCount || 0) - 1
                        updatePartnership["totalBalls"] = (updatePartnership?.totalBalls || 0) - 1
                        updateBowler["bowlerOver"] = updatedBowlerOver
                        updateBattingTeam["teamOver"] =
                            ((+teams[BATTING_TEAM].teamOver || 0) - 0.1).toFixed(1)
                        if (run === 0) {
                            updateBatter["batDotBall"] = (batter.batDotBall || 0) - 1
                            updateOver["dotBall"] = (currentOver.dotBall || 0) - 1
                            updateBowler["bowlerDotBall"] = (bowler.bowlerDotBall || 0) - 1
                        }
                    }
                    updateBatter["batRun"] = (batter.batRun || 0) - run
                    updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) - run
                    updatePartnership["totalRuns"] = (updatePartnership?.totalRuns || 0) - run
                    updateOver["totalRun"] = (currentOver.totalRun || 0) - run
                    updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - run
                    if (matchTypeDetails.isLimitedOvers && (target > 0)) {
                        updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                            currentOver, matchTypeDetails.ballsPerOver, target, teams[BATTING_TEAM]?.teamMaxOver)
                    }
                    if (currentBall.ballFour === 1 && currentBall.ballIsBoundry) {
                        updateBatter["batFour"] = (batter.batFour || 0) - 1
                        updateOver["totalFour"] = (currentOver.totalFour || 0) - 1
                        updateBowler["bowlerFour"] = (bowler.bowlerFour || 0) - 1

                    } else if (currentBall.ballSix === 1 && currentBall.ballIsBoundry) {
                        updateBatter["batSix"] = (batter.batSix || 0) - 1
                        updateOver["totalSix"] = (currentOver.totalSix || 0) - 1
                        updateBowler["bowlerSix"] = (bowler.bowlerSix || 0) - 1
                    }
                    updateBatter = { ...playersOnPitch[isOnStrikeSame ? ON_STRIKE : NON_STRIKE], ...updateBatter, onStrike: isOnStrikeSame ? false : true }
                    updateBowler = { ...playersOnPitch[CURRENT_BOWLER], ...updateBowler }
                    const updateNonStriker = { ...playersOnPitch[isOnStrikeSame ? NON_STRIKE : ON_STRIKE], onStrike: isOnStrikeSame ? true : false }
                    updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, { ...currentOver, ...updateOver }, matchTypeDetails.ballsPerOver)
                    setOnPitchPlayers({ [ON_STRIKE]: updateBatter, [NON_STRIKE]: updateNonStriker, [CURRENT_BOWLER]: updateBowler })
                    setPlayers((prevValue) => {
                        return {
                            [BOWLING_TEAM]: prevValue?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player),
                            [BATTING_TEAM]: prevValue?.[BATTING_TEAM].map(player => {
                                if (compareNumStringValues(player.commentaryPlayerId, updateBatter.commentaryPlayerId))
                                    return updateBatter
                                else if (compareNumStringValues(player.commentaryPlayerId, updateNonStriker.commentaryPlayerId))
                                    return updateNonStriker
                                else return player
                            })
                        }
                    })
                    setCurrentPartnership((prevValue) => { return { ...prevValue, ...updatePartnership, } })
                    setTeams((prevData) => { return { ...prevData, [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam } } })
                    setCurrentOver((prevValue) => { return { ...prevValue, ...updateOver, } })
                } else {
                    if (type === BALL_TYPE_WIDE) {
                        updateBowler["bowlerWideBall"] = (bowler.bowlerWideBall || 0) - 1
                        updateBowler["bowlerWideBallRun"] = (bowler.bowlerWideBallRun || 0) - totalRun
                        updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) - totalRun
                        updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, bowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
                        updateBattingTeam["teamWideRuns"] = (updateBattingTeam.teamWideRuns || 0) - totalRun
                        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - totalRun
                        updateOver["totalWideBall"] = (currentOver.totalWideBall || 0) - 1
                        updateOver["totalWideRun"] = (currentOver.totalWideRun || 0) - totalRun
                        updateOver["totalRun"] = (currentOver.totalRun || 0) - totalRun
                        updatePartnership["totalRuns"] = updatePartnership.totalRuns - totalRun
                        updatePartnership["extras"] = updatePartnership.extras - totalRun
                    } else if (type === BALL_TYPE_NO_BALL || type === BALL_TYPE_NO_BALL_BYE || type === BALL_TYPE_NO_BALL_LEG_BYE) {
                        const noBallValue = +currentBall.ballExtraRun
                        const UpdatedBallRun = +currentBall.ballRun
                        const totalRunToDelete = UpdatedBallRun + noBallValue
                        batter["batBall"] = (batter.batBall || 0) - 1
                        updateBowler["bowlerNoBall"] = (bowler.bowlerNoBall || 0) - 1
                        updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) - noBallValue
                        updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) - totalRunToDelete
                        updateBattingTeam["teamNoBallRuns"] = (updateBattingTeam.teamWideRuns || 0) - noBallValue
                        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - totalRun
                        updateOver["totalNoball"] = (currentOver.totalNoball || 0) - 1
                        updateOver["totalNoBallRun"] = (currentOver.totalNoBallRun || 0) - noBallValue
                        updateOver["totalRun"] = (currentOver.totalRun || 0) - totalRunToDelete
                        updatePartnership["totalRuns"] = updatePartnership.totalRuns - totalRunToDelete
                        // updatePartnership["extras"] = currentPartnership.extras - currentBall.ballExtraRun
                        if (type === BALL_TYPE_NO_BALL) {
                            batter["batRun"] = (batter.batRun || 0) - run
                            updatePartnership["extras"] = updatePartnership.extras - noBallValue
                        } else if (type === BALL_TYPE_NO_BALL_BYE) {
                            updateBowler["bowlerByeBallRun"] = (bowler.bowlerByeBallRun || 0) - UpdatedBallRun
                            updateOver["bowlerByeBallRun"] = (currentOver.bowlerByeBallRun || 0) - UpdatedBallRun
                            updatePartnership["extras"] = updatePartnership.extras - totalRunToDelete
                            updateBattingTeam["teamByRuns"] = (updateBattingTeam.teamByRuns || 0) - UpdatedBallRun
                        }
                        else if (type === BALL_TYPE_NO_BALL_LEG_BYE) {
                            updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) - UpdatedBallRun
                            updateOver["totalLegByesRun"] = (currentOver.totalNoBallRun || 0) - UpdatedBallRun
                            updatePartnership["extras"] = updatePartnership.extras - totalRunToDelete
                            updateBattingTeam["teamLegByRuns"] = (updateBattingTeam.teamLegByRuns || 0) - UpdatedBallRun
                        }
                    }
                    else {
                        batter["batBall"] = (batter.batBall || 0) - 1
                        updateBowler["bowlerOver"] = ((+bowler.bowlerOver || 0) - 0.1).toFixed(1)
                        updateBattingTeam["teamOver"] =
                            ((+teams[BATTING_TEAM].teamOver || 0) - 0.1).toFixed(1)
                        updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) - 1
                        updateOver["ballCount"] = (currentOver.ballCount || 0) - 1
                        updateOver["totalRun"] = (currentOver.totalRun || 0) - run
                        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - run
                        updatePartnership["totalRuns"] = updatePartnership.totalRuns - run
                        updatePartnership["extras"] = updatePartnership.extras - run
                        updatePartnership["totalBalls"] = updatePartnership.totalBalls - 1
                        if (type === BALL_TYPE_BYE) {
                            updateBowler["bowlerByeBall"] = (bowler.bowlerByeBall || 0) - 1
                            updateBowler["bowlerByeBallRun"] = (bowler.bowlerByeBallRun || 0) - run
                            updateOver["totalByesBall"] = (currentOver.totalByesBall || 0) - 1
                            updateOver["totalByesRun"] = (currentOver.totalByesRun || 0) - run
                            updateBattingTeam["teamByRuns"] = (updateBattingTeam.teamByRuns || 0) - run
                        }
                        else if (type === BALL_TYPE_LEG_BYE) {
                            updateBowler["bowlerLegByeBall"] = (bowler.bowlerLegByeBall || 0) - 1
                            updateBowler["bowlerLegByeBallRun"] = (bowler.bowlerLegByeBallRun || 0) - run
                            updateOver["totalLegByesBall"] = (currentOver.totalLegByesBall || 0) - 1
                            updateOver["totalLegByesRun"] = (currentOver.totalLegByesRun || 0) - run
                            updateBattingTeam["teamLegByRuns"] = (updateBattingTeam.teamLegByRuns || 0) - run
                        }
                    }
                    if (matchTypeDetails.isLimitedOvers && (target > 0)) {
                        updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                            currentOver, matchTypeDetails.ballsPerOver, target, teams[BATTING_TEAM]?.teamMaxOver)
                    }
                    updateBatter["batsmanStrikeRate"] = getStrikeRate(updateBatter.batRun, updateBatter.batBall)
                    updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, updateBowler.totalBalls, matchTypeDetails.ballsPerOver)
                    updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, { ...currentOver, ...updateOver }, matchTypeDetails.ballsPerOver)
                    updateBatter = { ...playersOnPitch[isOnStrikeSame ? ON_STRIKE : NON_STRIKE], ...updateBatter, onStrike: isOnStrikeSame ? true : false }
                    const updateNonStriker = { ...playersOnPitch[isOnStrikeSame ? NON_STRIKE : ON_STRIKE], onStrike: isOnStrikeSame ? false : true }
                    updateBowler = { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
                    setOnPitchPlayers({ [ON_STRIKE]: updateBatter, [NON_STRIKE]: updateNonStriker, [CURRENT_BOWLER]: updateBowler })
                    setPlayers((prevValue) => {
                        return {
                            [BOWLING_TEAM]: prevValue?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player),
                            [BATTING_TEAM]: prevValue?.[BATTING_TEAM].map(player => {
                                if (compareNumStringValues(player.commentaryPlayerId, updateBatter.commentaryPlayerId))
                                    return updateBatter
                                else if (compareNumStringValues(player.commentaryPlayerId, updateNonStriker.commentaryPlayerId))
                                    return updateNonStriker
                                else return player
                            })
                        }
                    })
                    setTeams((prevData) => { return { ...prevData, [BATTING_TEAM]: { ...prevData[BATTING_TEAM], ...updateBattingTeam } } })
                    setCurrentOver((prevOver) => { return { ...prevOver, ...updateOver } })
                    setCurrentPartnership((prevValue) => { return { ...prevValue, ...updatePartnership } })
                }
                setIsUndoBall(undoType)
                setSaveToDb(true)
            }
        } else {
            setUndoErrorModal(`OverCount in ball: ${+currentBall.overCount} is not equal to teamOver : ${+teams[BATTING_TEAM].teamOver}. please correct it from update feature screen`)
        }
    }
    const updatePlayerAfterUndoWicket = () => {
        const isbatterWicket = (player) => {
            const updatedPlayerToSend = {}
            if (player.isBatterOut) {
                updatedPlayerToSend["isBatterOut"] = null
                updatedPlayerToSend["bowlerId"] = "0"
                updatedPlayerToSend["fielderId1"] = "0"
                updatedPlayerToSend["fielderId2"] = "0"
                updatedPlayerToSend["wicketType"] = null
            }
            return updatedPlayerToSend
        }
        const updatedOnPitchPlayer = {}
        const playerListToSendToDb = []
        const updatedBattingPlayerList = players[BATTING_TEAM].map(player => {
            let forNewPlayers = {}
            if (compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[ON_STRIKE].commentaryPlayerId) || compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[NON_STRIKE].commentaryPlayerId)) {
                forNewPlayers = { isPlay: null, onStrike: null, isBatterOut: false }
                playerListToSendToDb.push({ ...player, ...forNewPlayers })
            }
            let updatedPlayer = { ...player, ...forNewPlayers }
            let wicketDetails = {}
            if (compareNumStringValues(player.commentaryPlayerId, currentBall.batStrikeId)) {
                wicketDetails = isbatterWicket(player)
                updatedPlayer = { ...updatedPlayer, ...wicketDetails, isPlay: true, onStrike: true }
                updatedOnPitchPlayer[ON_STRIKE] = updatedPlayer
            }
            else if (compareNumStringValues(player.commentaryPlayerId, currentBall.batNonStrikeId)) {
                wicketDetails = isbatterWicket(player)
                updatedPlayer = { ...updatedPlayer, ...wicketDetails, isPlay: true, }
                updatedOnPitchPlayer[NON_STRIKE] = updatedPlayer
            }
            return updatedPlayer
        })
        setPlayers({ ...players, [BATTING_TEAM]: updatedBattingPlayerList })
        updatedOnPitchPlayer[CURRENT_BOWLER] = onPitchPlayers[CURRENT_BOWLER]
        setPlayerUpdateList([].concat(playerListToSendToDb, playerUpdateList || []))
        return updatedOnPitchPlayer
    }
    const updateAfterOverUndo = () => {
        // removing 2 becaus length and index difference
        const previousBall = ballHistory[ballHistory.length - 2]
        const previousOver = overHistory[overHistory.length - 2]
        const previousOnPitchPlayer = {}
        const updatedBattingTeam = teams[BATTING_TEAM]
        const updatedBowlingPlayerList = players[BOWLING_TEAM].map(player => {
            const updatedPlayer = player
            if (compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[CURRENT_BOWLER].commentaryPlayerId)) {
                updatedPlayer["isPlay"] = null
                setPlayerUpdateList([].concat([updatedPlayer], playerUpdateList || []))
            }
            else if (compareNumStringValues(player.commentaryPlayerId, previousBall.bowlerId)) {
                updatedPlayer["isPlay"] = true
                const bowlToAdd = ((+previousOver.ballCount || 0) / 10)
                updatedPlayer["bowlerOver"] = (((+player.bowlerOver || 0) - 1) + bowlToAdd)?.toFixed(1)
                updatedBattingTeam["teamOver"] = (((+updatedBattingTeam.teamOver || 0) - 1) + bowlToAdd)?.toFixed(1)
                previousOnPitchPlayer[CURRENT_BOWLER] = updatedPlayer
            }
            return updatedPlayer
        })
        const updatedBattingPlayerList = players[BATTING_TEAM].map(player => {
            const updatedPlayer = player
            if (compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[ON_STRIKE].commentaryPlayerId) ||
                compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[NON_STRIKE].commentaryPlayerId)) {
                updatedPlayer["isPlay"] = null
                updatedPlayer["onStrike"] = null
            }
            if (compareNumStringValues(player.commentaryPlayerId, previousBall.batStrikeId)) {
                updatedPlayer["isPlay"] = true
                updatedPlayer["onStrike"] = true
                previousOnPitchPlayer[ON_STRIKE] = updatedPlayer
            }
            if (compareNumStringValues(player.commentaryPlayerId, previousBall.batNonStrikeId)) {
                // console.log("Inside change no strike")
                updatedPlayer["isPlay"] = true
                previousOnPitchPlayer[NON_STRIKE] = updatedPlayer
            }
            return updatedPlayer
        })
        setTeams({ ...teams, [BATTING_TEAM]: updatedBattingTeam })
        setPlayers({ [BATTING_TEAM]: updatedBattingPlayerList, [BOWLING_TEAM]: updatedBowlingPlayerList })
        setOnPitchPlayers(previousOnPitchPlayer)
        // dispatch(undoBallFromCommentary({ "commentaryBallByBallId": currentBall.commentaryBallByBallId }))
        setSaveToDb(true)
        setIsUndoBall(OVER)
    }
    const onUndoPlayerSelection = () => {
        let teamUpdates = undefined
        let commentaryUpdates = undefined

        teamUpdates = [
            { ...teams?.[BATTING_TEAM], isBattingComplete: false, teamStatus: 1 },
            { ...teams?.[BOWLING_TEAM], teamStatus: 2 }]
        commentaryUpdates = {
            "commentaryStatus": 2,
            "target": 0,
            "displayStatus": "Innings Break"
        }
        let objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": {
                ...commentaryDetails,
                ...commentaryUpdates
            },
            "commentaryTeams": teamUpdates,
            "commentaryPlayers": [
                { ...onPitchPlayers[ON_STRIKE], isPlay: null, onStrike: null },
                { ...onPitchPlayers[NON_STRIKE], isPlay: null, },
                { ...onPitchPlayers[CURRENT_BOWLER], isPlay: null, }
            ],
        }
        setRedirectOnScreenChange(true)
        dispatch(addCommentaryScreenData(objToSave))
    }
    const onUndoLastInningsClick = () => {
        let commentaryUpdates = undefined

        let teamUpdates = [
            { ...teams?.[BATTING_TEAM], isBattingComplete: false, teamStatus: 2 },
            { ...teams?.[BOWLING_TEAM], isBattingComplete: false, teamStatus: 1 }]
        commentaryUpdates = {
            "target": 0,
            "displayStatus": "Previous Innings"
        }
        let objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": { ...commentaryDetails, ...commentaryUpdates },
            "commentaryTeams": teamUpdates,
            "commentaryPlayers": [
                { ...onPitchPlayers[ON_STRIKE], isPlay: null, onStrike: null },
                { ...onPitchPlayers[NON_STRIKE], isPlay: null, },
                { ...onPitchPlayers[CURRENT_BOWLER], isPlay: null, }
            ],
        }
        setRedirectOnScreenChange(true)
        dispatch(addCommentaryScreenData(objToSave))
    }
    const onRetiredHurtClick = (retiredHurtData) => {
        const updateBall = {
            "commentaryBallByBallId": "0",
            "ballIsCount": false,
            "ballRun": 0,
            "ballExtraRun": 0,
            "batStrikeId": retiredHurtData[PREV_ON_STRIKE]?.commentaryPlayerId,
            "batNonStrikeId": retiredHurtData[PREV_NON_STRIKE]?.commentaryPlayerId,
            "ballType": BALL_TYPE_RETIRED_HURT
        }
        const generatedBallByBall = generateBall({ currentBall: updateBall, commentaryDetails, currentOver, onPitchPlayers: retiredHurtData, teams })
        const objToSave = {
            "commentaryBallByBall": generatedBallByBall,
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryPlayers": [retiredHurtData[ON_STRIKE], retiredHurtData[NON_STRIKE], retiredHurtData[RETIRED_HURT_BATTER]],
        }
        dispatch(addCommentaryScreenData(objToSave))
        setCurrentBall(updateBall)
        setOnPitchPlayers({ ...onPitchPlayers, [ON_STRIKE]: retiredHurtData[ON_STRIKE], [NON_STRIKE]: retiredHurtData[NON_STRIKE] })
        setPlayers({ ...players, [BATTING_TEAM]: retiredHurtData[PLAYER_LIST] })
        setShowRretiredHurt(false)
    }

    const undoRetiredHurt = () => {
        let updatedPlayerList = players[BATTING_TEAM] || []
        const playersToChange = {}
        let updatedOnPitchPlayer = {}
        updatedPlayerList = updatedPlayerList.map(player => {
            let updatedPlayer = player
            if (player.isPlay || player.onStrike) {
                updatedPlayer = { ...updatedPlayer, isPlay: null, onStrike: null }
                playersToChange[updatedPlayer.commentaryPlayerId] = updatedPlayer
            }

            if (player.commentaryPlayerId === currentBall.batStrikeId) {
                updatedPlayer = { ...updatedPlayer, isPlay: true, onStrike: true }
                updatedOnPitchPlayer[ON_STRIKE] = updatedPlayer
                playersToChange[updatedPlayer.commentaryPlayerId] = updatedPlayer
            } else if (player.commentaryPlayerId === currentBall.batNonStrikeId) {
                updatedPlayer = { ...updatedPlayer, isPlay: true, onStrike: null }
                updatedOnPitchPlayer[NON_STRIKE] = updatedPlayer
                playersToChange[updatedPlayer.commentaryPlayerId] = updatedPlayer
            }
            return updatedPlayer
        })
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryPlayers": Object.values(playersToChange),
            "deleteCommentaryBallByBallId": currentBall.commentaryBallByBallId
        }
        dispatch(addCommentaryScreenData(objToSave))
        setPlayers({ ...players, [BATTING_TEAM]: updatedPlayerList })
        setOnPitchPlayers({ ...onPitchPlayers, ...updatedOnPitchPlayer })
    }

    useEffect(() => {
        if (updateRunsFromWicket) {
            updateRuns(updateRunsFromWicket)
        }
    }, [updateRunsFromWicket])
    useEffect(() => {
        if (isUndoCompleted) {
            if (isUndoBall === WICKET) {
                const updatedWicketHistory = wicketHistory.slice(0, -1)
                const updaterPartnershipHistory = partnershipHistory.slice(0, -1)
                setWicketHistory(updatedWicketHistory)
                setPartnershipHistory(updaterPartnershipHistory)
                setCurrentPartnership(updaterPartnershipHistory[updaterPartnershipHistory.length - 1])
            }
            else if (isUndoBall === OVER) {
                const updatedOverHistory = overHistory.slice(0, -1)
                const newCurrentOver = updatedOverHistory[updatedOverHistory.length - 1]
                newCurrentOver["teamScore"] = { ...currentOver, "teamScore": `${teams[BATTING_TEAM]?.teamScore || 0}/${teams[BATTING_TEAM]?.teamWicket || 0}`, "isComplete": true }
                newCurrentOver["isComplete"] = false
                setOverHistory(updatedOverHistory)
                setCurrentOver(newCurrentOver)
            }
            // else {
            //     updatedBallHistory = overBallByBallDisplay.slice(0, -1)
            // }
            const updatedBallHistoryList = ballHistory.slice(0, -1)
            dispatch(clearUndoFlag())
            // setOverBallByBallDisplay(updatedBallHistory)
            setBallHistory(updatedBallHistoryList)
            setCurrentBall(updatedBallHistoryList[updatedBallHistoryList.length - 1])
            setIsUndoBall(undefined)
        }
    }, [isUndoCompleted])
    useEffect(() => {
        if (redirectOnScreenChange && isCommentaryDataUpdated) {
            props.onInningsChange()
            // dispatch(clearAddCommentaryScreenData())
        }
    }, [redirectOnScreenChange, isCommentaryDataUpdated])
    useEffect(() => {
        if (changeOverOnPopupClick) {
            // setOverBallByBallDisplay([])
            // TODO add check
            checkInningsSwitch(OVER)
            changePlayer(CURRENT_BOWLER)
            changeOver()
            setChangeOverOnPopupClick(undefined)
        }
    }, [changeOverOnPopupClick])
    useEffect(() => {
        if (saveToDb) {
            if (updateRunsFromWicket) callWicketToDB()
            else {
                let newCurrentBall = undefined
                let objToSave = {}
                if (isUndoBall) {
                    newCurrentBall = currentBall
                    objToSave["deleteCommentaryBallByBallId"] = currentBall.commentaryBallByBallId
                    if (isUndoBall === OVER) objToSave["deleteOverId"] = currentOver.overId
                }
                else newCurrentBall = { ...currentBall, commentaryBallByBallId: "0" }
                const generatedBallByBall = generateBall({ currentBall: newCurrentBall, commentaryDetails, currentOver, onPitchPlayers, teams })
                objToSave = {
                    ...objToSave,
                    "commentaryId": commentaryDetails.commentaryId,
                    "commentaryBallByBall": generatedBallByBall,
                    "commentaryOvers": {
                        ...currentOver,
                        "teamScore": `${teams[BATTING_TEAM]?.teamScore || 0}/${teams[BATTING_TEAM]?.teamWicket || 0}`
                    },
                    "commentaryPlayers": [].concat(playerUpdateList, [onPitchPlayers[CURRENT_BOWLER], onPitchPlayers[ON_STRIKE], onPitchPlayers[NON_STRIKE]]).filter(x => x),
                    "commentaryPartnership": generatePartnership({ commentaryDetails, currentBall: {}, currentPartnership, teams }),
                    "commentaryDetails": {
                        ...commentaryDetails,
                        "displayStatus": generateDisplayStatus({ currentBall: generatedBallByBall }),
                        "rmk": teams[BATTING_TEAM].teamTrialRuns ?
                            generateRemainingRuns(teams[BATTING_TEAM], matchTypeDetails.ballsPerOver) :
                            ""
                    },
                    "commentaryTeams": [teams[BATTING_TEAM]],
                }
                if (objToSave.deleteCommentaryBallByBallId) delete objToSave.commentaryBallByBall
                if (objToSave.deleteOverId) delete objToSave.commentaryOvers
                dispatch(addCommentaryScreenData(objToSave))
                checkInningsSwitch(RUN)
                setSaveToDb(false)
            }
        }
    }, [saveToDb])
    useEffect(() => {
        if (isOverChange) {
            const objToSave = {
                "commentaryId": commentaryDetails.commentaryId,
                "commentaryDetails": { ...commentaryDetails, "displayStatus": `${onPitchPlayers[CURRENT_BOWLER]?.playerName} with new Over` },
                "commentaryOvers": generateOver({ commentaryDetails, onPitchPlayers, teams }),
                "commentaryPlayers": [].concat(Object.values(onPitchPlayers), playerUpdateList).filter(x => x),
                "commentaryTeams": [teams[BATTING_TEAM]],
            }
            dispatch(addCommentaryScreenData(objToSave))
            setIsOverChange(undefined)
            setPlayerUpdateList([])
        }
    }, [isOverChange])
    useEffect(() => {
        if (props.data) {
            const currentInningsTeams = {}
            const battingTeam = []
            const bowlingTeam = []
            const onPitchPlayers = {}
            let currentPartnership = {}
            const apiCallObj = {}
            let currentOver = 0
            let currentOverToUpdate = 0
            props.data.commentaryData.commentaryTeams.forEach(teamDetails => {
                if (isEqual(teamDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = teamDetails.teamStatus === BAT
                    currentInningsTeams[isBattingTeam ? BATTING_TEAM : BOWLING_TEAM] = teamDetails
                    if (isBattingTeam) {
                        currentOver = Math.floor(teamDetails?.teamOver)
                        const trail = (+teamDetails?.teamTrialRuns || 0)
                        if (trail > 0) setTarget(trail + 1)
                    }
                }
            });
            props.data.commentaryData.commentaryPlayers.forEach(playerDetails => {
                if (isEqual(playerDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = playerDetails.teamId === currentInningsTeams[BATTING_TEAM].teamId
                    // If player is from batting team, add them to the batting object list
                    if (isBattingTeam) {
                        if (playerDetails.isPlay === true) {
                            if (!playerDetails.batterOrder) {
                                playerDetails = { ...playerDetails, batterOrder: playerDetails.onStrike === true ? 1 : 2 }
                                apiCallObj["commentaryPlayers"] = [].concat((apiCallObj.commentaryPlayers || []), [playerDetails])
                            }
                            onPitchPlayers[playerDetails.onStrike === true ? ON_STRIKE : NON_STRIKE] = playerDetails
                        }
                        battingTeam.push(playerDetails)
                    }
                    else {
                        if (playerDetails.isPlay === true) {
                            if (!playerDetails.bowlerOrder) {
                                playerDetails = { ...playerDetails, bowlerOrder: 1 }
                                apiCallObj["commentaryPlayers"] = [].concat((apiCallObj.commentaryPlayers || []), [playerDetails])
                            }
                            onPitchPlayers[CURRENT_BOWLER] = playerDetails
                        }
                        bowlingTeam.push(playerDetails)
                    }
                }
            });
            props.data.commentaryData.commentaryPartnership.forEach(partnershipDetails => {
                if (
                    (isEqual(partnershipDetails.batter1Id, onPitchPlayers[ON_STRIKE]?.commentaryPlayerId) &&
                        isEqual(partnershipDetails.batter2Id, onPitchPlayers[NON_STRIKE]?.commentaryPlayerId)) ||
                    (
                        isEqual(partnershipDetails.batter1Id, onPitchPlayers[NON_STRIKE]?.commentaryPlayerId) &&
                        isEqual(partnershipDetails.batter2Id, onPitchPlayers[ON_STRIKE]?.commentaryPlayerId)
                    )) {
                    currentPartnership = partnershipDetails
                }
            });
            // console.log(props.data.commentaryData.commentaryOvers)
            props.data.commentaryData.commentaryOvers.forEach(overDetails => {
                if (isEqual(+overDetails.teamId, currentInningsTeams?.[BOWLING_TEAM]?.teamId) && isEqual(+overDetails.over, +currentOver)) {
                    // if (isEqual(+overDetails.over, +currentOver)) {
                    currentOverToUpdate = overDetails
                }
            });
            const partnershipDetails = {
                "batter1Id": onPitchPlayers[ON_STRIKE]?.commentaryPlayerId,
                "batter1Name": onPitchPlayers[ON_STRIKE]?.playerName,
                "batter2Id": onPitchPlayers[NON_STRIKE]?.commentaryPlayerId,
                "batter2Name": onPitchPlayers[NON_STRIKE]?.playerName,
            }
            const ballData = props.data.commentaryData.commentaryBallByBall || []
            let ballByBallHistoryData = ballData?.commentaryBallByBallId ? [ballData] : ballData
            ballByBallHistoryData = _.orderBy(ballByBallHistoryData, ["commentaryBallByBallId"], ["asc"])
            const overData = props.data.commentaryData.commentaryOvers || []
            let overHistoryData = overData.overId ? [overData] : overData
            overHistoryData = _.orderBy(overHistoryData, ["overId"], ["asc"])
            const partnershipData = props.data.commentaryData.commentaryPartnership || []
            let partnershipHistoryData = partnershipData.commentaryPartnershipId ? [partnershipData] : partnershipData
            partnershipHistoryData = _.orderBy(partnershipHistoryData, ["commentaryPartnershipId"], ["asc"])
            setTeams(currentInningsTeams)
            setPlayers({ [BATTING_TEAM]: battingTeam, [BOWLING_TEAM]: bowlingTeam })
            setOnPitchPlayers(onPitchPlayers)
            setOverBallByBallDisplay(getBallsForAllOver(ballByBallHistoryData))
            setBallHistory(ballByBallHistoryData)
            setOverHistory(overHistoryData)
            setPartnershipHistory(partnershipHistoryData)
            setWicketHistory(props.data.commentaryData.commentaryWicket)
            setCurrentPartnership({ ...partnershipDetails, ...currentPartnership })
            setCurrentOver(currentOverToUpdate)
            setCurrentBall(_.isArray(ballByBallHistoryData) ? ballByBallHistoryData[ballByBallHistoryData.length - 1] : undefined)
            // checkInningsSwitch(ALL)
            setIsLastInnings(commentaryDetails.currentInnings >= matchTypeDetails.noOfIningsPerSide)
            if (isEmpty(currentPartnership) && onPitchPlayers[ON_STRIKE]?.commentaryPlayerId
                && onPitchPlayers[NON_STRIKE]?.commentaryPlayerId)
                apiCallObj["commentaryPartnership"] = generatePartnership({ commentaryDetails, currentBall: {}, currentPartnership: partnershipDetails, teams: currentInningsTeams })
            if (!currentOverToUpdate && onPitchPlayers[CURRENT_BOWLER]?.commentaryPlayerId) {
                apiCallObj["commentaryOvers"] = generateOver({
                    commentaryDetails, onPitchPlayers, teams: currentInningsTeams
                })
            }
            if (!isEmpty(apiCallObj)) {
                dispatch(addCommentaryScreenData({
                    ...apiCallObj,
                    "commentaryId": commentaryDetails.commentaryId,
                }))
            }

        }
    }, [])
    useEffect(() => {
        if (!isEmpty(commentaryDataToUpdate)) {
            // if (isUndoBall) dispatch(undoBallFromCommentary({ "commentaryBallByBallId": currentBall.commentaryBallByBallId }))
            // else {
            // Update Over history on over change
            if (!isEmpty(commentaryDataToUpdate.overdetails) && !isEqual(commentaryDataToUpdate.overdetails.overId, currentOver.overId)) {
                const updatedOverHistory = overHistory.slice(0, -1)
                setOverHistory([].concat(updatedOverHistory || [], [currentOver, commentaryDataToUpdate.overdetails]))
                const generatedBall = generateBall({ currentBall: { commentaryBallByBallId: "0", }, commentaryDetails, currentOver: { overId: commentaryDataToUpdate.overdetails.overId }, onPitchPlayers, teams })
                dispatch(addCommentaryScreenData({
                    "commentaryId": commentaryDetails.commentaryId,
                    "commentaryDetails": { ...commentaryDetails, "displayStatus": generateDisplayStatus({ currentBall: generatedBall }) },
                    "commentaryBallByBall": generatedBall,
                }))
                setCurrentOver(commentaryDataToUpdate.overdetails)
            }
            // Update ball history on ball change
            if (!isEmpty(commentaryDataToUpdate.commentaryBallByBallDetails) &&
                !compareNumStringValues(
                    currentBall?.commentaryBallByBallId,
                    commentaryDataToUpdate.commentaryBallByBallDetails.commentaryBallByBallId
                )) {
                const commentartBallByBallIdToUpdate = commentaryDataToUpdate.commentaryBallByBallDetails.commentaryBallByBallId
                // If Partnership Ball By ball Id is not correct, then update it
                if (!currentPartnership.commentaryBallByBallId || (+currentPartnership.commentaryBallByBallId === 0))
                    setCurrentPartnership({ ...currentPartnership, "commentaryBallByBallId": commentartBallByBallIdToUpdate })
                setBallHistory([].concat(ballHistory || [], [commentaryDataToUpdate.commentaryBallByBallDetails]))
                setCurrentBall(commentaryDataToUpdate.commentaryBallByBallDetails)
                // if (commentaryDataToUpdate.commentaryBallByBallDetails.ballType !== BALL_TYPE_OVER_COMPLETE)
                //     setOverBallByBallDisplay([].concat(overBallByBallDisplay, [{
                //         type: commentaryDataToUpdate.commentaryBallByBallDetails.ballType,
                //         value: commentaryDataToUpdate.commentaryBallByBallDetails.ballRun,
                //         isWicket: commentaryDataToUpdate.commentaryBallByBallDetails.ballWicketType || false
                //     }]))
            }
            // Add partnershot to the partnership history when new Partnershi created
            if (!isEmpty(commentaryDataToUpdate.commentaryPartnershipDetails) && currentPartnership.commentaryPartnershipId
                && !isEqual(currentPartnership?.commentaryPartnershipId, currentPartnership?.commentaryPartnershipId)) {
                const updatedPartnershipHistory = partnershipHistory.slice(0, -1)
                setPartnershipHistory([].concat(updatedPartnershipHistory || [], [currentPartnership, commentaryDataToUpdate.commentaryPartnershipDetails]))
                setCurrentPartnership(commentaryDataToUpdate.commentaryPartnershipDetails)
            }
            // update current Partnership when new Partnership created
            if (!isEmpty(commentaryDataToUpdate.commentaryPartnershipDetails)
                && (!currentPartnership || !currentPartnership.commentaryPartnershipId || currentPartnership.commentaryPartnershipId === "0")) {
                setCurrentPartnership(commentaryDataToUpdate.commentaryPartnershipDetails)
                setPartnershipHistory([].concat(partnershipHistory || [], [commentaryDataToUpdate.commentaryPartnershipDetails]))
            }
            // Update Current Wicket on Wicket change
            if (!isEmpty(commentaryDataToUpdate.commentaryWicketDetails) && !currentWicket?.commentaryWicketId) {
                setWicketHistory([].concat(wicketHistory || [], [commentaryDataToUpdate.commentaryWicketDetails]))
                setCurrentWicket(commentaryDataToUpdate.commentaryWicketDetails)
            }
            // }
            setPlayerUpdateList(undefined)
            dispatch(clearAddCommentaryScreenData())
        }
    }, [commentaryDataToUpdate])

    useEffect(() => {
        if (!onPitchPlayers[ON_STRIKE] || !onPitchPlayers[NON_STRIKE] || !onPitchPlayers[CURRENT_BOWLER]) {
            setSelectMissingPlayer(true)
        } else if (selectMissingPlayer) setSelectMissingPlayer(false)
    }, [onPitchPlayers])

    useEffect(() => {
        if (currentOver.overId) {
            let getCurrentOverToBallStatus = getBallsForAllOver(ballHistory)
            const overToCheckFor = currentOver.currentInnings + STRING_SEPERATOR + teams[BATTING_TEAM].teamId + STRING_SEPERATOR + (+currentOver.over + 1)
            if (!getCurrentOverToBallStatus[overToCheckFor]) getCurrentOverToBallStatus = { [overToCheckFor]: [], ...getCurrentOverToBallStatus }
            setOverBallByBallDisplay(getCurrentOverToBallStatus)
        }
    }, [currentOver, ballHistory])

    return <>
        <CommentaryScreen
            teamDetails={teams}
            onPitchPlayers={onPitchPlayers}
            updateRuns={updateRuns}
            changePlayer={(type) => {
                setIsSwapPlayer(true)
                changePlayer(type)
            }}
            changeOver={() => { setShowChangeOverModal(true) }}
            updateExtras={(extraType) => {
                setExtrasType(extraType)
            }}
            onWicketClick={() => { setShowWicketModal(true) }}
            changeStrike={changeOnStrikePlayer}
            endInnings={() => setShowInningsChangePopup(true)}
            onUndoClick={handleUndoClick}
            isLoading={isCommentaryBallLoading}
            changeBowler={() => {
                setIsChangeBowler({ isChange: null, isChangePopup: true, popupOption: null })
            }}
            updateDisplayStatus={(displayStatus) => {
                dispatch(updateCommentaryDisplayStatus({
                    "commentaryId": commentaryDetails.commentaryId,
                    "displayStatus": displayStatus
                }))
            }}
            handleRetiredHurt={() => setShowRretiredHurt(true)}
            overBalls={overBallByBallDisplay}
            showPaneltyRuns={setIsPaneltyPopup}
            anyPopup={inningsChangePopup || extrasType || showChangeOverModal || inningsChangePopup || showWicketModal || showUpdateInnings
                || showSwitchBatterModal || undoInningsPopup || completeMatchModal || winnerAnnouncement || isChangeBowler.isChangePopup || (changePlayerList ? true : false)}
        />
        {!(inningsChangePopup || props.isDataLoading || winnerAnnouncement || showUpdateInnings) &&
            <SelectPlayerModal isOpen={changePlayerList ? true : false}
                toggle={() => { setChangePlayerList(undefined) }}
                playerList={changePlayerList}
                selectPlayer={(newPlayerId) => {
                    if (isSwapPlayer) swapPlayer(newPlayerId)
                    else if (isChangeBowler.isChange) onBowlerChange(newPlayerId)
                    else onPlayerChange(newPlayerId)
                }}
            />}
        {extrasType && < ExtrasModal
            isOpen={true}
            toggle={() => { setExtrasType(undefined) }}
            extraType={extrasType}
            updateExtras={onExtrasChange} />}
        {showChangeOverModal && < ChangeOverModal
            isOpen={showChangeOverModal}
            toggle={() => { setShowChangeOverModal(undefined) }}
            onNoClick={() => { setShowChangeOverModal(undefined) }}
            onYesClick={() => {
                setShowChangeOverModal(undefined);
                setChangeOverOnPopupClick(true)
            }} />}
        {inningsChangePopup && <ChangeInningsModal
            isOpen={inningsChangePopup}
            toggle={() => { setShowInningsChangePopup(undefined) }}
            onNoClick={() => { setShowInningsChangePopup(undefined) }}
            onYesClick={onInningsChange} />}
        {showWicketModal &&
            <WicketModal
                isOpen={showWicketModal}
                toggle={() => { setShowWicketModal(undefined) }}
                onSubmit={handleWicket}
                bowlingTeam={players[BOWLING_TEAM]}
                bowlingTeamDetails={teams[BOWLING_TEAM]}
                onPitchPlayers={onPitchPlayers}
                extraType={extrasType}
            />}
        {showUpdateInnings && <UpdateInningsModal
            isOpen={showUpdateInnings}
            toggle={() => { setShowUpdateInnings(undefined) }}
            onsubmit={handleInningsUpdate}
            currentInningTeams={props.data.commentaryData?.commentaryTeams?.filter(team => team.currentInnings === (commentaryDetails.currentInnings + 1))}
        />}
        {showSwitchBatterModal && <UpdateStrikeModal
            isOpen={showSwitchBatterModal}
            toggle={() => { setShowSwitchBatterModal(undefined) }}
            onsubmit={changeOnStrikePlayer}
            players={onPitchPlayers}
        />}
        {undoInningsPopup && <UndoInnnigsModal isOpen={undoInningsPopup}
            toggle={() => { setUndoInningsPopup(undefined) }}
            onLastInnigsClick={() => { }}
            onPlayerSelectionClick={onUndoPlayerSelection}
        />}
        {completeMatchModal && <CompleteCurrentMatchModal
            isOpen={completeMatchModal}
            toggle={() => { setCompleteMatchModal(undefined) }}
            onNoClick={() => { setCompleteMatchModal(undefined) }}
            onYesClick={checkWinner}
        />}
        {winnerAnnouncement && <WinnerModal
            isOpen={winnerAnnouncement ? true : false}
            winnerAnnouncement={winnerAnnouncement}
            toggle={() => { setWinnerAnnouncement(undefined) }}
            onExitClick={() => {
                setWinnerAnnouncement(undefined)
                navigate("/commentary")
            }}
        />}
        {isChangeBowler.isChangePopup && <ChangeBowlerModal
            toggle={() => { setIsChangeBowler({ isChange: null, isChangePopup: null, popupOption: null }) }}
            onBowlerChange={(selectedOption) => {
                setIsChangeBowler({ isChange: true, isChangePopup: null, popupOption: selectedOption })
                changePlayer(CURRENT_BOWLER)
            }}
        />}
        {undoOverPopup && <UndoOverModal
            isOpen={true}
            toggle={() => { setUndoOverPopup(undefined) }}
            onChangebowlerClick={() => {
                setUndoOverPopup(undefined)
                setIsChangeBowler({ isChange: true, isChangePopup: null, popupOption: SWITCH_BOWLER })
                changePlayer(CURRENT_BOWLER)
            }}
            onLastOverClick={() => {
                setUndoOverPopup(undefined)
                updateAfterOverUndo()
            }}
        />}
        {selectMissingPlayer && !changePlayerList &&
            <OnPitchPlayerModal
                onPitchPlayers={onPitchPlayers}
                players={players}
                updatePlayerOnParent={handleMissingPlayerChange}
                toggle={() => setSelectMissingPlayer(false)}
            />
        }
        {undoErrorModal && <UndoErrorModal
            toggle={() => { setUndoErrorModal(null) }}
            undoError={undoErrorModal}
        />}
        {isPaneltyPopup && <PenaltyModal
            toggle={() => { setIsPaneltyPopup(null) }}
            isOpen={true}
            selectedPenalty={(selectedPenalty) => {
                updatePanelty(selectedPenalty)
                setIsPaneltyPopup(null)
            }}
        />}
        {showRretiredHurt && <RetiredHurtModal
            toggle={() => setShowRretiredHurt(false)}
            onsubmit={onRetiredHurtClick}
            onPitchplayers={onPitchPlayers}
            playerList={players[BATTING_TEAM]}
        />}
    </>
}

export default Commentary

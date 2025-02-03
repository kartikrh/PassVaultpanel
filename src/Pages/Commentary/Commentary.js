import { useEffect, useState } from "react"
import { CommentaryScreen } from "./Commentary.jsx"
import _, { isEmpty, isEqual } from "lodash"
import { BALL_BYE, BALL_LEG_BYE, BALL_START_STATUS, BALL_TYPE_BOWLER_RETIRED_HURT, BALL_TYPE_BYE, BALL_TYPE_LEG_BYE, BALL_TYPE_NO_BALL, BALL_TYPE_NO_BALL_BYE, BALL_TYPE_NO_BALL_LEG_BYE, BALL_TYPE_OVER_COMPLETE, BALL_TYPE_PANELTY_RUN, BALL_TYPE_REGULAR, BALL_TYPE_RETIRED_HURT, BALL_TYPE_WIDE, BALL_WIDE, BAT, BATTING_TEAM, BOWLING_TEAM, CHANGE_BOWLER, CURRENT_BOWLER, LIST_TO_EXCLUDE_WICKET_FOR_BOWLER, NON_STRIKE, NO_BALL, NO_BALL_BYE, NO_BALL_LEG_BYE, ON_STRIKE, OVER, PLAYER_LIST, PREV_NON_STRIKE, PREV_ON_STRIKE, RETIRED_HURT, RETIRED_HURT_BATTER, RETIRED_OUT, RUN, SCORING_STATUS, SWITCH_BOWLER, TIMED_OUT, WICKET } from "./CommentartConst.js"
import SelectPlayerModal from "./CommentaryModels/SelectPlayerModal.jsx"
import ExtrasModal from "./CommentaryModels/ExtrasModal.jsx"
import ChangeOverModal from "./CommentaryModels/ChangeOverModal.jsx"
import WicketModal from "./CommentaryModels/WicketModal.jsx"
import { fetchNextPlayerOrder, fetchWinnerMessage, generateBall, generateDisplayStatus, generateOver, generatePartnership, generateRemainingRuns, generateWicket, getBallsForAllOver, getBowlerOnlyRuns, getBowlerRelatedWickets, getEconomyRate, getNonNegativeValue, getPlayerNameById, getRequiredRunRate, getRunRate, getStrikeRate } from "./functions.js"
import { useDispatch, useSelector } from "react-redux"
import { addCommentaryScreenData, addSuperOverCall, changeBowlerFromCommentary, clearAddCommentaryScreenData, clearLoadingAndError, clearUndoFlag, updateCommentaryDisplayStatus } from "../../Features/Tabs/commentarySlice.js"
import ChangeInningsModal from "./CommentaryModels/ChangeInningsModal.jsx"
import { useNavigate } from "react-router-dom"
import UpdateInningsModal from "./CommentaryModels/UpdateInningsModal.jsx"
import { compareNumStringValues } from "../../components/Common/Reusables/reusableMethods.js"
import WinnerModal from "./CommentaryModels/WinnerModal.jsx"
import UndoInnnigsModal from "./CommentaryModels/UndoInningsModal.jsx"
import CompleteCurrentMatchModal from "./CommentaryModels/CompleteMatchModal.jsx"
import ChangeBowlerModal from "./CommentaryModels/ChangeBowlerModal.jsx"
import UndoOverModal from "./CommentaryModels/UndoOverModal.jsx"
import OnPitchPlayerModal from "./CommentaryModels/OnPitchPlayerModal.jsx"
import { BATTING_STATUS, BOWLING_STATUS, COMMENTARY_UPDATE, ERROR, STRING_SEPERATOR, SUCCESS } from "../../components/Common/Const.js"
import { UndoErrorModal } from "./CommentaryModels/UndoErrorModal.jsx"
import { PenaltyModal } from "./CommentaryModels/PenaltyModal.jsx"
import RetiredHurtModal from "./CommentaryModels/RetiredHurtModal.jsx"
import SuperOverModal from "./CommentaryModels/SuperOverModal.jsx"
import { RetryModel } from "./CommentaryModels/RetryModel.jsx"
import axiosInstance from "../../Features/axios.js"
import CricketFieldModal from "./CommentaryModels/CricketFieldModal.jsx"
import { updateToastData } from "../../Features/toasterSlice.js"
import createSocket from "../../Features/socket.js"
import NewCommentaryScreen from "./NewCommentaryScreen.jsx"

const Commentary = (props) => {
    const dispatch = useDispatch();
    const [propsData, setPropsData] = useState(undefined)
    const [commentaryDetails, setCommentaryDetails] = useState(undefined)
    const [matchTypeDetails, setMatchTypeDetails] = useState(undefined)
    const [isLastInnigs, setIsLastInnings] = useState(undefined)
    const [ballHistory, setBallHistory] = useState([])
    const [overHistory, setOverHistory] = useState([])
    const [wicketHistory, setWicketHistory] = useState([])
    const [partnershipHistory, setPartnershipHistory] = useState([])
    const [currentOver, setCurrentOver] = useState({})
    const [_currentOver, _setCurrentOver] = useState({})
    const [currentPartnership, setCurrentPartnership] = useState({})
    const [_currentPartnership, _setCurrentPartnership] = useState({})
    const [currentBall, setCurrentBall] = useState({})
    const [currentWicket, setCurrentWicket] = useState({})
    const [teams, setTeams] = useState(undefined)
    const [_teams, _setTeams] = useState(undefined)
    const [players, setPlayers] = useState(undefined)
    const [_players, _setPlayers] = useState(undefined)
    const [onPitchPlayers, setOnPitchPlayers] = useState({})
    const [_onPitchPlayers, _setOnPitchPlayers] = useState({})
    const [changePlayerList, setChangePlayerList] = useState(undefined)
    const [extrasType, setExtrasType] = useState(undefined)
    const [playerToChange, setPlayerToChange] = useState(undefined)
    const [changeOverOnPopupClick, setChangeOverOnPopupClick] = useState(undefined)
    const [overPopUpForBowler, setOverPopUpForBowler] = useState(undefined)
    const [showChangeOverModal, setShowChangeOverModal] = useState(undefined)
    const [showWicketModal, setShowWicketModal] = useState(undefined)
    const [isBowlerrChange, setIsBowlerrChange] = useState(undefined)
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
    const [superOverModal, setSuperOverModal] = useState(0)
    const [ballCountForStrike, setBallCountForStrike] = useState(1)
    const [retryModel, setRetryModel] = useState(undefined)
    const [isWonByInnings, setIsWonByInnings] = useState(undefined)
    const [isMatchCompleted, setIsMatchCompleted] = useState(undefined)
    const [showCricketFieldModal, setShowCricketFieldModal] = useState(undefined);
    const [cricketFieldData, setCricketFieldData] = useState(null);
    const [isWheelShow, setIsWheelShow] = useState(undefined);
    const [isWheelShowComplete, setIsWheelShowComplete] = useState(undefined);
    const [isUndoingLastOver, setIsUndoingLastOver] = useState(false);
    const [ballStatus, setBallStatus] = useState(null);
    const [isShotType, setIsShotType] = useState(undefined);
    const {
        commentaryDataToUpdate,
        isCommentaryDataUpdated,
        isUndoCompleted,
        isCommentaryBallLoading,
        superOverApiData, error
    } = useSelector(state => state.tabsData.commentary);
    let navigate = useNavigate();
    const socket = createSocket();
    // console.log({ "Current Over Ball count": currentOver.ballCount, "OverHistory": overHistory });

    // const handleCommentaryConsole = async (temp, main) => {
    //     const currentState = {
    //         over: main?.over,
    //         ballCount: main?.ballCount,
    //         teamScore: `${teams[BATTING_TEAM]?.teamScore || 0}/${teams[BATTING_TEAM]?.teamWicket || 0}`,
    //     }
    //     const temporaryState = {
    //         over: temp?.over,
    //         ballCount: temp?.ballCount,
    //         teamScore: typeof BATTING_TEAM !== 'undefined' && _teams?.[BATTING_TEAM]
    //             ? `${_teams[BATTING_TEAM]?.teamScore || 0}/${_teams[BATTING_TEAM]?.teamWicket || 0}`
    //             : '0/0',
    //     }
    //     const payload = {
    //         currentState: JSON.stringify(currentState),
    //         temporaryState: JSON.stringify(temporaryState),
    //         ballCount: main?.ballCount,
    //         over: main?.over,
    //         teamScore: `${teams[BATTING_TEAM]?.teamScore || 0}/${teams[BATTING_TEAM]?.teamWicket || 0}`,
    //         commentaryId: main?.commentaryId,
    //     }
    //     try {
    //         await axiosInstance.post(`/admin/score/commentaryConsoleFe`, payload);
    //     } catch (error) {
    //         console.error("Error updating commentary console:", error);
    //     }
    // };


    useEffect(() => {
        checkForOverSwitch(); // Trigger check whenever currentOver or ball count changes
    }, [currentOver.ballCount, isWheelShowComplete, isWheelShow]);

    const checkForOverSwitch = () => {
        const isBallCountExceeded = currentOver.ballCount >= (matchTypeDetails?.ballsPerOver || 6);
        const shouldShowWheel = isWheelShowComplete || !isWheelShow;
        const isNotUndoing = !isUndoingLastOver;
        const isOverNotComplete = !currentOver.isComplete;

        if (isNotUndoing && isBallCountExceeded && shouldShowWheel && isOverNotComplete) {
            setShowChangeOverModal(true);
        }
    };

    const checkInningsSwitch = (checkFor) => {
        const teamToCheck = _teams || teams
        const maxNoOfWicket = matchTypeDetails?.noOfPlayer - (matchTypeDetails?.isLastManStand ? 0 : 1);
        const isOverLimitReached = () => {
            return matchTypeDetails.isLimitedOvers &&
                (Math.ceil(+currentOver.over || 0) + 1) >= teamToCheck[BATTING_TEAM]?.teamMaxOver;
        };

        const isWicketLimitReached = () => {
            return teamToCheck?.[BATTING_TEAM]?.teamWicket > maxNoOfWicket - 2;
        };

        const isRunTargetAchieved = () => {
            return isLastInnigs && target !== 0 && teamToCheck?.[BATTING_TEAM]?.teamScore >= target;
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
            const runDifference = (teams[BATTING_TEAM]?.teamScore || 0) + (teams[BATTING_TEAM]?.teamLeadRuns || 0) - (teams[BATTING_TEAM]?.teamTrialRuns || 0)
            if (teamToCheck?.[BOWLING_TEAM].isBattingComplete && isLastInnigs) setCompleteMatchModal(true)
            else if (!teams[BOWLING_TEAM].isBattingComplete && isLastInnigs && runDifference < 0) {
                setIsWonByInnings(runDifference * -1)
                setCompleteMatchModal(true)
            }
            else setShowInningsChangePopup(true);
        }
    }
    const completeMatch = () => {
        const isMatchTie = teams?.[BATTING_TEAM]?.teamScore === target - 1;
        if (isMatchTie) setSuperOverModal(true);
        else checkWinner();
        setCompleteMatchModal(undefined);
        setChangePlayerList(undefined);
        setIsMatchCompleted(true)
    }
    const handleSuperOver = (superOverData) => {
        const objToSend = {
            commentaryId: commentaryDetails.commentaryId,
            teamMaxOver: superOverData?.overs,
            battingTeamId: superOverData?.battingTeamId
        }
        dispatch(addSuperOverCall(objToSend));
        setSuperOverModal(false);
    }
    const checkWinner = () => {
        let WINNING_MESSAGE = ""
        let WINNING_TEAM = ""
        let isBattingTeamWon = undefined
        if (isWonByInnings) {
            isBattingTeamWon = false
            WINNING_TEAM = BOWLING_TEAM
            WINNING_MESSAGE = `${teams?.[BOWLING_TEAM]?.shortName} won by innings and ${isWonByInnings} runs.`
        } else {
            const isMatchTie = teams?.[BATTING_TEAM]?.teamScore === target - 1
            isBattingTeamWon = teams?.[BATTING_TEAM]?.teamScore >= target
            WINNING_TEAM = isBattingTeamWon ? BATTING_TEAM : BOWLING_TEAM
            WINNING_MESSAGE = isMatchTie ? `Match tied  between ${teams?.[BATTING_TEAM].teamName} and ${teams?.[BOWLING_TEAM].teamName}.`
                : fetchWinnerMessage({ team: teams, matchTypeDetails, target, winningTeam: WINNING_TEAM, isBattingTeamWon })
        }
        const teamUpdates = [
            { ...teams?.[BATTING_TEAM], isBattingComplete: true, isWin: isBattingTeamWon },
            { ...teams?.[BOWLING_TEAM], isWin: !isBattingTeamWon }]
        const commentaryUpdates = {
            "commentaryStatus": 4,
            "winnerId": teams?.[WINNING_TEAM].teamId,
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
            "commentaryPlayers": Object.values(onPitchPlayers).filter(x => x),
        }
        //  console.log("Called from : 1");
        dispatch(addCommentaryScreenData(objToSave))
        setIsWonByInnings(undefined)
        setShowInningsChangePopup(undefined)
        setCompleteMatchModal(undefined)
        setWinnerAnnouncement(WINNING_MESSAGE)
    }
    const onInningsChange = () => {
        let teamUpdates = undefined
        let commentaryUpdates = undefined
        if (teams[BOWLING_TEAM].isBattingComplete && !isLastInnigs) {
            setShowUpdateInnings(true)
        }
        else {
            const runDifference = (teams[BATTING_TEAM]?.teamScore || 0) + (teams[BATTING_TEAM]?.teamLeadRuns || 0) - (teams[BATTING_TEAM]?.teamTrialRuns || 0)
            const trialRuns = Math.max(runDifference, 0)
            const leadRuns = Math.max(runDifference * -1, 0)
            teamUpdates = [
                { ...teams?.[BATTING_TEAM], isBattingComplete: true, teamStatus: 2 },
                { ...teams?.[BOWLING_TEAM], teamStatus: 1, teamTrialRuns: trialRuns, teamLeadRuns: leadRuns }]
            commentaryUpdates = {
                "commentaryStatus": 2,
                "displayStatus": "Batting for Current team Completed"
            }
            setRedirectOnScreenChange(true)
        }
        const partnershipDetails = {
            ...currentPartnership,
            "isActive": false,
        }
        const updatedPartnership = generatePartnership({ commentaryDetails, currentPartnership: partnershipDetails, teams })
        let objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": {
                ...commentaryDetails,
                ...commentaryUpdates
            },
            "commentaryTeams": teamUpdates,
            "commentaryPartnership": updatedPartnership,
            "commentaryPlayers": setAllPlayerToNull(),
            "isEndInnings": true
        }
        // console.log("Called from : 2")
        dispatch(addCommentaryScreenData(objToSave))
        setShowInningsChangePopup(undefined)
    }
    const handleInningsUpdate = (battingTeamId) => {
        let updatedInningsTeam = [{ ...teams?.[BATTING_TEAM], isBattingComplete: true }]
        const runDifference = (teams[BATTING_TEAM]?.teamScore || 0) + (teams[BATTING_TEAM]?.teamLeadRuns || 0) - (teams[BATTING_TEAM]?.teamTrialRuns || 0)
        propsData.commentaryData?.commentaryTeams?.forEach(team => {
            if (team.currentInnings === (commentaryDetails.currentInnings + 1)) {
                let updatedTeam = team
                if (team.teamId === battingTeamId) {
                    updatedTeam["teamStatus"] = BATTING_STATUS
                    updatedTeam["teamBattingOrder"] = BATTING_STATUS + (+commentaryDetails.currentInnings * 2)
                    if (runDifference > 0) {
                        if (isEqual(+teams[BATTING_TEAM]?.teamId, +battingTeamId)) updatedTeam["teamLeadRuns"] = runDifference
                        else if (isEqual(+teams[BOWLING_TEAM]?.teamId, +battingTeamId)) updatedTeam["teamTrialRuns"] = runDifference
                    } else {
                        if (isEqual(+teams[BATTING_TEAM]?.teamId, +battingTeamId)) updatedTeam["teamTrialRuns"] = runDifference * -1
                        else if (isEqual(+teams[BOWLING_TEAM]?.teamId, +battingTeamId)) updatedTeam["teamLeadRuns"] = runDifference * -1
                    }
                } else {
                    updatedTeam["teamStatus"] = BOWLING_STATUS
                    updatedTeam["teamBattingOrder"] = BOWLING_STATUS + (+commentaryDetails.currentInnings * 2)
                }
                updatedInningsTeam.push(updatedTeam)
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
            "commentaryPlayers": setAllPlayerToNull(),
            "isEndInnings": true
        }
        // console.log("Called from : 3")
        dispatch(addCommentaryScreenData(objToSave))
        setShowUpdateInnings(undefined)
        setRedirectOnScreenChange(true)
    }
    const setAllPlayerToNull = () => {
        const playersToChange = []
        players[BATTING_TEAM].map((player) => {
            if (player.commentaryPlayerId === onPitchPlayers[ON_STRIKE]?.commentaryPlayerId) {
                playersToChange.push({ ...onPitchPlayers[ON_STRIKE], "isPlay": null, "onStrike": null })
                return player
            }
            if (player.commentaryPlayerId === onPitchPlayers[NON_STRIKE]?.commentaryPlayerId) {
                playersToChange.push({ ...onPitchPlayers[NON_STRIKE], "isPlay": null, "onStrike": null })
                return player
            }
            else if (player.isPlay || player.onStrike) {
                playersToChange.push({ ...player, "isPlay": null, "onStrike": null })
                return player
            }
            return player
        })
        players[BOWLING_TEAM].map((player) => {
            if (player.commentaryPlayerId === onPitchPlayers[CURRENT_BOWLER]?.commentaryPlayerId) {
                playersToChange.push({ ...onPitchPlayers[CURRENT_BOWLER], "isPlay": null, "onStrike": null })
                return player
            }
            else if (player.isPlay || player.onStrike) {
                playersToChange.push({ ...player, "isPlay": null, "onStrike": null })
                return player
            }
            return player
        })
        return playersToChange
    }
    const callWicketToDB = (currentBallByBallID) => {
        const newCurrentBall = currentBall
        newCurrentBall["commentaryBallByBallId"] = currentBallByBallID
        const updatedPartnership = generatePartnership({ commentaryDetails, currentPartnership: _currentPartnership || currentPartnership, teams: _teams || teams })
        const updatedBallByBall = generateBall({
            currentBall: newCurrentBall, commentaryDetails,
            currentOver: _currentOver || currentOver, onPitchPlayers: _onPitchPlayers || onPitchPlayers, teams: _teams || teams, currentPartnership
        })
        const updatedWicket = generateWicket({
            commentaryDetails, currentOver: _currentOver || currentOver,
            teams: _teams || teams, currentWicket, currentBall: newCurrentBall
        })
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
                ..._currentOver,
                "teamScore": `${_teams[BATTING_TEAM]?.teamScore || 0}/${_teams[BATTING_TEAM]?.teamWicket || 0}`
            },
            "commentaryTeams": [_teams[BATTING_TEAM]],
            "commentaryPartnership": updatedPartnership,
            "commentaryBallByBall": updatedBallByBall,
            "commentaryWicket": updatedWicket,
            "commentaryPlayers": Object.values(_onPitchPlayers),
        }
        // console.log("Called from : 4")
        dispatch(addCommentaryScreenData(objToSave))
        _setOnPitchPlayers((prevValue) => {
            return {
                ...prevValue,
                [ON_STRIKE]: prevValue[ON_STRIKE].isPlay ? prevValue[ON_STRIKE] : null,
                [NON_STRIKE]: prevValue[NON_STRIKE].isPlay ? prevValue[NON_STRIKE] : null
            }
        })
        const updaterPartnershipHistory = partnershipHistory.slice(0, -1)
        setPartnershipHistory([].concat((updaterPartnershipHistory || []), [updatedPartnership]))
        setUpdateRunFromWicket(undefined)
        // checkForOverSwitch(onPitchPlayers[CURRENT_BOWLER]?.bowlerOver)
        setSaveToDb(false)
    }
    const updateRuns = ({ run, ball, batter, bowler, isBoundary, freezePlayers = false }) => {
        setBallStatus(SCORING_STATUS);
        setIsUndoingLastOver(false);
        if (!freezePlayers) setCurrentBall({})
        const syncTeam = isEmpty(_teams) ? teams : _teams
        const syncOver = isEmpty(_currentOver) ? currentOver : _currentOver
        const syncPartnership = isEmpty(_currentPartnership) ? currentPartnership : _currentPartnership
        const syncOnPitchPlayer = isEmpty(_onPitchPlayers) ? onPitchPlayers : _onPitchPlayers
        const updateBattingTeam = {}
        let updateBatter = {}
        let updateBowler = {}
        const updateOver = {}
        const updatePartnership = {}
        const updateBall = {}
        let isChangeStrike = undefined
        // if (syncOver.ballCount < (+matchTypeDetails?.ballsPerOver || 6)) {
        const updatedBowlerOver = ball > 0 ? ((+bowler.bowlerOver || 0) + 0.1).toFixed(1) : bowler.bowlerOver
        updateBall["ballIsCount"] = ball > 0
        if (matchTypeDetails.isAutoChangeStriker && ball > 0) {
            updateBall["autoStrikeBallCount"] = ballCountForStrike
            setBallCountForStrike(ballCountForStrike + 1)
        }
        updateBall["ballType"] = BALL_TYPE_REGULAR
        updateBall["ballRun"] = run
        updateBall["batStrikeId"] = onPitchPlayers[ON_STRIKE].commentaryPlayerId
        updateBall["batNonStrikeId"] = onPitchPlayers[NON_STRIKE].commentaryPlayerId
        updateBatter["batRun"] = getNonNegativeValue((batter.batRun || 0) + run)
        updateBatter["batBall"] = getNonNegativeValue((batter.batBall || 0) + ball)
        updateBatter["batsmanStrikeRate"] = getStrikeRate(updateBatter.batRun, updateBatter.batBall)
        updateBowler["bowlerRun"] = getNonNegativeValue((+bowler.bowlerRun || 0) + run)
        updateBowler["bowlerTotalBall"] = getNonNegativeValue((+bowler.bowlerTotalBall || 0) + ball)
        updateBowler["bowlerOver"] = updatedBowlerOver
        updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, updateBowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
        updatePartnership["totalRuns"] = getNonNegativeValue((syncPartnership.totalRuns || 0) + run)
        updatePartnership["totalBalls"] = getNonNegativeValue((syncPartnership.totalBalls || 0) + ball)
        // In updateRuns function where you update partnership data
        updatePartnership["batter1Runs"] = isEqual(onPitchPlayers[ON_STRIKE].commentaryPlayerId, currentPartnership.batter1Id)
            ? (currentPartnership.batter1Runs || 0) + run
            : (currentPartnership.batter1Runs || 0);
        updatePartnership["batter2Runs"] = isEqual(onPitchPlayers[ON_STRIKE].commentaryPlayerId, currentPartnership.batter2Id)
            ? (currentPartnership.batter2Runs || 0) + run
            : (currentPartnership.batter2Runs || 0);
        updatePartnership["batter1Balls"] = isEqual(onPitchPlayers[ON_STRIKE].commentaryPlayerId, currentPartnership.batter1Id)
            ? (currentPartnership.batter1Balls || 0) + ball
            : (currentPartnership.batter1Balls || 0);
        updatePartnership["batter2Balls"] = isEqual(onPitchPlayers[ON_STRIKE].commentaryPlayerId, currentPartnership.batter2Id)
            ? (currentPartnership.batter2Balls || 0) + ball
            : (currentPartnership.batter2Balls || 0);
        updateOver["ballCount"] = (syncOver.ballCount || 0) + ball
        updateOver["totalRun"] = (syncOver.totalRun || 0) + run
        updateBattingTeam["teamWicket"] = (+syncTeam[BATTING_TEAM].teamWicket || 0)
        updateBattingTeam["teamScore"] = (+syncTeam[BATTING_TEAM].teamScore || 0) + run
        updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, { ...syncOver, ...updateOver }, matchTypeDetails.ballsPerOver)
        updateBattingTeam["teamOver"] = ball > 0 ?
            ((+syncTeam[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1) : syncTeam[BATTING_TEAM].teamOver
        if (matchTypeDetails.isLimitedOvers && (target > 0)) {
            updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                syncOver, matchTypeDetails.ballsPerOver, target, teams[BATTING_TEAM]?.teamMaxOver)
        }
        if (run === 0) {
            updateBall["ballIsDot"] = true
            updateBatter["batDotBall"] = (batter.batDotBall || 0) + ball
            updateOver["dotBall"] = (syncOver.dotBall || 0) + ball
            updateBowler["bowlerDotBall"] = (bowler.bowlerDotBall || 0) + ball
        } else if (isBoundary) {
            if (run === 4) {
                updateBall["ballIsBoundry"] = true
                updateBall["ballFour"] = 1
                updateBatter["batFour"] = (batter.batFour || 0) + 1
                updateOver["totalFour"] = (syncOver.totalFour || 0) + 1
                updatePartnership["totalFour"] = (currentPartnership.totalFour || 0) + 1
                updateBowler["bowlerFour"] = (bowler.bowlerFour || 0) + 1
            } else if (run === 6) {
                updateBall["ballIsBoundry"] = true
                updateBall["ballSix"] = 1
                updateBatter["batSix"] = (batter.batSix || 0) + 1
                updateOver["totalSix"] = (syncOver.totalSix || 0) + 1
                updatePartnership["totalSix"] = (currentPartnership.totalSix || 0) + 1
                updateBowler["bowlerSix"] = (bowler.bowlerSix || 0) + 1
            }
        } else if (run % 2 !== 0) isChangeStrike = freezePlayers ? false : true
        updateBatter = { ...syncOnPitchPlayer[ON_STRIKE], ...updateBatter, onStrike: isChangeStrike ? false : true }
        updateBowler = { ...syncOnPitchPlayer[CURRENT_BOWLER], ...updateBowler }
        const updateNonStriker = { ...syncOnPitchPlayer[NON_STRIKE], onStrike: isChangeStrike ? true : false }
        if (!freezePlayers) {
            updateNonStriker["onStrike"] = isChangeStrike ? true : false
            updateBatter["onStrike"] = isChangeStrike ? false : true
        }
        _setPlayers((prevValue) => {
            const actualPrevData = isEmpty(prevValue) ? players : prevValue
            return {
                [BOWLING_TEAM]: actualPrevData?.[BOWLING_TEAM]?.map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player),
                [BATTING_TEAM]: actualPrevData?.[BATTING_TEAM]?.map(player => {
                    if (compareNumStringValues(player.commentaryPlayerId, updateBatter.commentaryPlayerId))
                        return updateBatter
                    else if (compareNumStringValues(player.commentaryPlayerId, updateNonStriker.commentaryPlayerId))
                        return updateNonStriker
                    else return player
                })
            }
        })
        _setOnPitchPlayers({ [ON_STRIKE]: isChangeStrike ? updateNonStriker : updateBatter, [NON_STRIKE]: isChangeStrike ? updateBatter : updateNonStriker, [CURRENT_BOWLER]: updateBowler })
        _setTeams((prevValue) => {
            const actualPrevData = isEmpty(prevValue) ? teams : prevValue
            return { ...actualPrevData, [BATTING_TEAM]: { ...actualPrevData[BATTING_TEAM], ...updateBattingTeam } }
        })
        setCurrentBall((prevValue) => { return { ...prevValue, ...updateBall } })
        _setCurrentOver((prevValue) => {
            const actualPrevData = isEmpty(prevValue) ? currentOver : prevValue
            return { ...actualPrevData, ...updateOver, }
        })
        _setCurrentPartnership((prevValue) => {
            const actualPrevData = isEmpty(prevValue) ? currentPartnership : prevValue
            return { ...actualPrevData, ...updatePartnership, isActive: freezePlayers ? false : true }
        })
        setSaveToDb(true)
        // }
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
                batter["batFour"] = (batter.batFour || 0) + 1
                updateOver["totalFour"] = (currentOver.totalFour || 0) + 1
                updatePartnership["totalFour"] = (currentPartnership.totalFour || 0) + 1
                updateBowler["bowlerFour"] = (bowler.bowlerFour || 0) + 1
            } else if (+runs === 6) {
                updateBall["ballIsBoundry"] = true
                updateBall["ballSix"] = 1
                batter["batSix"] = (batter.batSix || 0) + 1
                updateOver["totalSix"] = (currentOver.totalSix || 0) + 1
                updatePartnership["totalSix"] = (currentPartnership.totalSix || 0) + 1
                updateBowler["bowlerSix"] = (bowler.bowlerSix || 0) + 1
            }
        }
        if (type === BALL_WIDE) {
            const runToUpdate = (+matchTypeDetails["valueOfWideBall"] || 0) + runs
            updateBowler["bowlerWideBall"] = (bowler.bowlerWideBall || 0) + 1
            updateBowler["bowlerWideBallRun"] = (bowler.bowlerWideBallRun || 0) + runToUpdate
            updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + runToUpdate
            updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, bowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
            updateBattingTeam["teamWideRuns"] = (teams[BATTING_TEAM].teamWideRuns || 0) + runToUpdate
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
            updateOver["totalWideBall"] = (currentOver.totalWideBall || 0) + 1
            updateOver["totalWideRun"] = (currentOver.totalWideRun || 0) + runToUpdate
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runToUpdate
            updateBall["ballIsCount"] = false
            updateBall["ballRun"] = 0
            updateBall["ballExtraRun"] = runToUpdate
            updateBall["ballType"] = BALL_TYPE_WIDE
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runToUpdate
            updatePartnership["extras"] = currentPartnership.extras + runToUpdate
        } else if (type === NO_BALL || type === NO_BALL_BYE || type === NO_BALL_LEG_BYE) {
            const valueOfNoBall = (+matchTypeDetails["valueOfNoBall"] || 0)
            const runToUpdate = valueOfNoBall + runs
            updateBowler["bowlerNoBall"] = (bowler.bowlerNoBall || 0) + 1
            updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) + valueOfNoBall
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
            updateBattingTeam["teamNoBallRuns"] = (teams[BATTING_TEAM].teamNoBallRuns || 0) + valueOfNoBall
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runToUpdate
            updateOver["totalNoball"] = (currentOver.totalNoball || 0) + 1
            updateOver["totalNoBallRun"] = (currentOver.totalNoBallRun || 0) + valueOfNoBall
            updateBall["ballIsCount"] = false
            updateBall["ballRun"] = runs
            updateBall["ballExtraRun"] = valueOfNoBall
            if (type === NO_BALL) {
                updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + runToUpdate
                updateBall["ballType"] = BALL_TYPE_NO_BALL
                batter["batRun"] = (batter.batRun || 0) + runs
                updatePartnership["extras"] = currentPartnership.extras + valueOfNoBall
                updatePartnership["batter1Runs"] = currentPartnership.batter1Runs +
                    (compareNumStringValues(onPitchPlayers[ON_STRIKE].commentaryPlayerId, currentPartnership.batter1Id) ? runs : 0);
                updatePartnership["batter2Runs"] = currentPartnership.batter2Runs +
                    (compareNumStringValues(onPitchPlayers[ON_STRIKE].commentaryPlayerId, currentPartnership.batter2Id) ? runs : 0);
            } else if (type === NO_BALL_BYE) {
                updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + valueOfNoBall
                updateBall["ballType"] = BALL_TYPE_NO_BALL_BYE
                updateBowler["bowlerByeBallRun"] = (bowler.bowlerByeBallRun || 0) + runs
                updateOver["totalByesRun"] = (currentOver.totalByesRun || 0) + runs
                updatePartnership["extras"] = currentPartnership.extras + runToUpdate
                updateBattingTeam["teamByRuns"] = (teams[BATTING_TEAM].teamByRuns || 0) + runs
            }
            else if (type === NO_BALL_LEG_BYE) {
                updateBall["ballType"] = BALL_TYPE_NO_BALL_LEG_BYE
                updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + valueOfNoBall
                updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) + runs
                updateOver["totalLegByesRun"] = (currentOver.totalLegByesRun || 0) + runs
                updatePartnership["extras"] = currentPartnership.extras + runToUpdate
                updateBattingTeam["teamLegByRuns"] = (teams[BATTING_TEAM].teamLegByRuns || 0) + runs
            }
            batter["batBall"] = (batter.batBall || 0) + 1
            batter["batsmanStrikeRate"] = getStrikeRate(batter.batRun, batter.batBall)
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runToUpdate
            updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, bowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
        }
        else {
            updateBowler["bowlerOver"] = updatedBowlerOver
            updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) + 1
            updateBowler["bowlerRun"] = (bowler.bowlerRun || 0)
            updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, updateBowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
            updateOver["ballCount"] = (currentOver.ballCount || 0) + 1
            batter["batBall"] = (batter.batBall || 0) + 1
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runs
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runs
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runs
            updatePartnership["extras"] = currentPartnership.extras + runs
            updatePartnership["totalBalls"] = currentPartnership.totalBalls + 1
            updateBall["ballIsCount"] = true
            updateBall["autoStrikeBallCount"] = ballCountForStrike
            updateBall["ballRun"] = runs
            updateBall["ballExtraRun"] = runs
            updateBattingTeam["teamOver"] =
                ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1)
            batter["batsmanStrikeRate"] = getStrikeRate(batter.batRun, batter.batBall)
            updatePartnership["batter1Balls"] = currentPartnership.batter1Balls +
                (compareNumStringValues(onPitchPlayers[ON_STRIKE].commentaryPlayerId, currentPartnership.batter1Id) ? 1 : 0);
            updatePartnership["batter2Balls"] = currentPartnership.batter2Balls +
                (compareNumStringValues(onPitchPlayers[ON_STRIKE].commentaryPlayerId, currentPartnership.batter2Id) ? 1 : 0);
            if (type === BALL_BYE) {
                updateBowler["bowlerByeBall"] = (bowler.bowlerByeBall || 0) + 1
                updateBowler["bowlerByeBallRun"] = (bowler.bowlerByeBallRun || 0) + runs
                updateOver["totalByesBall"] = (currentOver.totalByesBall || 0) + 1
                updateOver["totalByesRun"] = (currentOver.totalByesRun || 0) + runs
                updateBall["ballType"] = BALL_TYPE_BYE
                updateBattingTeam["teamByRuns"] = (teams[BATTING_TEAM].teamByRuns || 0) + runs
            }
            else if (type === BALL_LEG_BYE) {
                updateBowler["bowlerLegByeBall"] = (bowler.bowlerLegByeBall || 0) + 1
                updateBowler["bowlerLegByeBallRun"] = (bowler.bowlerLegByeBallRun || 0) + runs
                updateOver["totalLegByesBall"] = (currentOver.totalLegByesBall || 0) + 1
                updateOver["totalLegByesRun"] = (currentOver.totalLegByesRun || 0) + runs
                updateBall["ballType"] = BALL_TYPE_LEG_BYE
                updateBattingTeam["teamLegByRuns"] = (teams[BATTING_TEAM].teamLegByRuns || 0) + runs
            }
            setBallCountForStrike(ballCountForStrike + 1)
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
        _setOnPitchPlayers({ [ON_STRIKE]: updateBatter, [NON_STRIKE]: updateNonStriker, [CURRENT_BOWLER]: { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler } })
        _setPlayers({
            [BOWLING_TEAM]: players?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player),
            [BATTING_TEAM]: players?.[BATTING_TEAM].map(player => {
                if (compareNumStringValues(player.commentaryPlayerId, updateBatter.commentaryPlayerId))
                    return updateBatter
                else if (compareNumStringValues(player.commentaryPlayerId, updateNonStriker.commentaryPlayerId))
                    return updateNonStriker
                else return player
            })
        })
        _setTeams({ ...teams, [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam } })
        _setCurrentOver({ ...currentOver, ...updateOver })
        _setCurrentPartnership({ ...currentPartnership, ...updatePartnership })
        setCurrentBall((prevValue) => { return { ...prevValue, ...updateBall } })
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
        const generatedBallByBall = generateBall({ currentBall: updateBall, commentaryDetails, currentOver, onPitchPlayers, teams, currentPartnership })
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryBallByBall": generatedBallByBall,
            "commentaryDetails": { ...commentaryDetails, "displayStatus": `Penalty ${runs} runs` },
            "commentaryTeams": [updateBattingTeam],
        }
        // console.log("Called from : 5")
        dispatch(addCommentaryScreenData(objToSave))
        checkInningsSwitch(RUN)
    }
    const changeOver = () => {
        // console.log("Starting changeOver - Initial states:", { currentTeamOver: teams[BATTING_TEAM].teamOver });
        let updateBattingTeam = {
            ...teams[BATTING_TEAM],
            "teamOver": Math.ceil(+teams[BATTING_TEAM].teamOver || 0)
        }
        // console.log("Updated batting team:", updateBattingTeam);

        const updateBowler = {
            ...onPitchPlayers[CURRENT_BOWLER],
            "isPlay": null,
            "bowlerOver": Math.ceil(+onPitchPlayers[CURRENT_BOWLER].bowlerOver || 0),
            "bowlerMaidenOver": currentOver.totalRun < 1 ? 1 : 0
        }
        // console.log("Updated bowler details:", updateBowler);

        const updatedOver = {
            ...currentOver,
            "teamScore": `${teams[BATTING_TEAM]?.teamScore || 0}/${teams[BATTING_TEAM]?.teamWicket || 0}`,
            "isMaiden": getBowlerOnlyRuns(currentOver) < 1,
            "isComplete": true
        }
        // console.log("Updated over details:", updatedOver);

        setPlayerUpdateList([].concat([updateBowler], playerUpdateList || []))
        setTeams({ ...teams, [BATTING_TEAM]: updateBattingTeam })
        setPlayers((prevValue) => { return { ...prevValue, [BOWLING_TEAM]: prevValue?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player), } })
        setCurrentOver(updatedOver)
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryDetails": {
                ...commentaryDetails,
                "displayStatus": "Over Completed"
            },
            "commentaryOvers": updatedOver,
            "commentaryPlayers": [updateBowler],
            "commentaryTeams": [updateBattingTeam],
        }
        // console.log("Final dispatch object:", objToSave);
        dispatch(addCommentaryScreenData(objToSave))
    }
    const changeStrike = () => {
        _setOnPitchPlayers((prevValue) => {
            const syncOnPitchPlayer = isEmpty(prevValue) ? onPitchPlayers : prevValue
            return {
                ...syncOnPitchPlayer,
                [ON_STRIKE]: { ...syncOnPitchPlayer[NON_STRIKE], onStrike: true },
                [NON_STRIKE]: { ...syncOnPitchPlayer[ON_STRIKE], onStrike: false }
            }
        })
        _setOnPitchPlayers((prevValue) => {
            const syncOnPitchPlayer = isEmpty(prevValue) ? onPitchPlayers : prevValue
            const objToSave = {
                "commentaryId": commentaryDetails.commentaryId,
                "commentaryDetails": {
                    ...commentaryDetails,
                    "displayStatus": "Strike Changed"
                },
                "commentaryPlayers": Object.values(syncOnPitchPlayer),
            }
            // console.log("Called from : 7");
            dispatch(addCommentaryScreenData(objToSave))
            _setPlayers((prevValue) => {
                const syncPlayers = isEmpty(prevValue) ? players : prevValue
                const updatedList = {
                    ...syncPlayers,
                    [BATTING_TEAM]: syncPlayers?.[BATTING_TEAM].map(player => {
                        if (compareNumStringValues(player.commentaryPlayerId, syncOnPitchPlayer[ON_STRIKE].commentaryPlayerId))
                            return syncOnPitchPlayer[ON_STRIKE]
                        else if (compareNumStringValues(player.commentaryPlayerId, syncOnPitchPlayer[NON_STRIKE].commentaryPlayerId))
                            return syncOnPitchPlayer[NON_STRIKE]
                        else return player
                    })
                }
                return updatedList

            })
            return prevValue
        })

    }
    const handleMissingPlayerChange = (playerType, player) => {
        const order = props.data.commentaryData.commentaryTeams.filter((t) => t.teamBattingOrder === 1)
        const commentaryDetailsobj = props.data.commentaryData.commentaryDetails
        const onPitchPlayersobj = { ...onPitchPlayers, [playerType]: player }
        const updatedOnPitchPlyer = { ...onPitchPlayers, [playerType]: { ...player, "isPlay": true } }
        const partnershipDetails = {
            "batter1Id": onPitchPlayersobj[ON_STRIKE]?.commentaryPlayerId,
            "batter1Name": onPitchPlayersobj[ON_STRIKE]?.playerName,
            "batter2Id": onPitchPlayersobj[NON_STRIKE]?.commentaryPlayerId,
            "batter2Name": onPitchPlayersobj[NON_STRIKE]?.playerName,
            "order": order[0].teamWicket + 1,
            "isActive": true,
            "commentaryBallByBallId": (currentBall.commentaryBallByBallId || "0"),
        }
        const updatedPartnership = generatePartnership({ commentaryDetails: commentaryDetailsobj, currentPartnership: partnershipDetails, teams })
        let objToSave = {}
        if (isEmpty(currentPartnership)) {
            objToSave = {
                "commentaryId": commentaryDetails.commentaryId,
                "commentaryDetails": {
                    ...commentaryDetails,
                    "displayStatus": "Player Changed"
                },
                "commentaryPartnership": updatedPartnership,
                "commentaryPlayers": Object.values(updatedOnPitchPlyer),
            }
        } else {
            objToSave = {
                "commentaryId": commentaryDetails.commentaryId,
                "commentaryDetails": {
                    ...commentaryDetails,
                    "displayStatus": "Player Changed"
                },
                "commentaryPlayers": Object.values(updatedOnPitchPlyer),
            }
        }
        if (playerType === CURRENT_BOWLER) {
            if (!currentOver || currentOver.isComplete) {
                setCurrentOver(overHistory[overHistory.length - 1])
                objToSave["commentaryOvers"] = generateOver({ commentaryDetails, onPitchPlayers: updatedOnPitchPlyer, teams })
            }
        }
        setOnPitchPlayers(updatedOnPitchPlyer)
        // console.log("Called from : 8")
        dispatch(addCommentaryScreenData(objToSave))
        setSelectMissingPlayer(false)
        setIsBowlerrChange(false)
    }
    const handleWicket = (wicketData) => {
        // if (!wicketData.isExtraWicket)
        if (isWheelShow) {
            setShowCricketFieldModal(true);
            setCricketFieldData({ commentaryId: commentaryDetails.commentaryId, commentaryBallByBallId: currentBall?.commentaryBallByBallId, run: currentBall?.ballRun, isBoundary: currentBall?.ballIsBoundry, batter: onPitchPlayers[ON_STRIKE]?.playerName, bowler: onPitchPlayers[CURRENT_BOWLER]?.playerName, overCount: currentBall?.overCount });
        }
        setCurrentBall({})
        const ballToUpdateOnWicket = (wicketData.isExtraWicket || (wicketData.wicketType === RETIRED_OUT) || (wicketData.wicketType === TIMED_OUT)) ? 0 : 1
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
        if (!LIST_TO_EXCLUDE_WICKET_FOR_BOWLER.includes(wicketData.wicketType))
            updateBowler["bowlerTotalWicket"] = (onPitchPlayers[CURRENT_BOWLER].bowlerTotalWicket || 0) + 1
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
                    "onStrike": null,
                }
                updatedBatter = playerDataToList
                return playerDataToList
            }
            return player
        })
        _setPlayers({ ...players, [BATTING_TEAM]: updatedBattingPlayers })
        _setOnPitchPlayers({
            [ON_STRIKE]: isOnStrikeWicket ? updatedBatter : onPitchPlayers[ON_STRIKE],
            [NON_STRIKE]: !isOnStrikeWicket ? updatedBatter : onPitchPlayers[NON_STRIKE],
            [CURRENT_BOWLER]: { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
        })
        _setTeams({ ...teams, [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam } })
        _setCurrentOver({ ...currentOver, ...updateOver })
        setCurrentBall((prevValue) => { return { ...prevValue, ...updateBall } })
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
        let updatedOnPitchPlayer = { ...onPitchPlayers }
        let secondPitchPlayerId
        if (onPitchPlayers[ON_STRIKE]?.commentaryPlayerId) {
            if (isEqual(onPitchPlayers[ON_STRIKE]?.commentaryPlayerId, currentWicket?.batterId)) {
                secondPitchPlayerId = onPitchPlayers[NON_STRIKE]?.commentaryPlayerId
            } else secondPitchPlayerId = onPitchPlayers[ON_STRIKE]?.commentaryPlayerId
        } else secondPitchPlayerId = onPitchPlayers[NON_STRIKE]?.commentaryPlayerId
        // const playerToChangeId = onPitchPlayers[playerToChange]?.commentaryPlayerId
        const allPlayersToUpdate = []
        const playerToUpdate = {
            ...players,
            [teamType]: players[teamType]?.map((player) => {
                // condition to set for new selected player for both batter and bowler
                if (isEqual(player.commentaryPlayerId, newPlayerId)) {
                    const updatedPlayer = {
                        ...player, "isPlay": true, "onStrike": playerToChange === ON_STRIKE ? true : false,
                        [updateOrderKey]: player[updateOrderKey] || fetchNextPlayerOrder(playerToChange, players[teamType])
                    }
                    updatedOnPitchPlayer[playerToChange] = updatedPlayer
                    return updatedPlayer
                }
                else if (!isEqual(player.commentaryPlayerId, secondPitchPlayerId) && (player.isPlay || player.onStrike)) {
                    const playerToUpdate = { ...player, "isPlay": null, "onStrike": null }
                    allPlayersToUpdate.push(playerToUpdate)
                    return playerToUpdate
                }
                return player
            })
        }
        setPlayers(playerToUpdate)
        setOnPitchPlayers(updatedOnPitchPlayer)
        setPlayerUpdateList([].concat(allPlayersToUpdate, playerUpdateList || []))
        if (playerToChange === CURRENT_BOWLER) setIsOverChange(true)
        if (isWicketChange) {
            const currentBallDetails = { ...currentBall }
            currentBallDetails["nextBatStrikeId"] = updatedOnPitchPlayer[ON_STRIKE]?.commentaryPlayerId
            currentBallDetails["nextBatNonStrikeId"] = updatedOnPitchPlayer[NON_STRIKE]?.commentaryPlayerId
            const partnershipDetails = {
                "batter1Id": updatedOnPitchPlayer[ON_STRIKE]?.commentaryPlayerId,
                "batter1Name": updatedOnPitchPlayer[ON_STRIKE]?.playerName,
                "batter2Id": updatedOnPitchPlayer[NON_STRIKE]?.commentaryPlayerId,
                "batter2Name": updatedOnPitchPlayer[NON_STRIKE]?.playerName,
                "order": teams?.[BATTING_TEAM]?.teamWicket + 1,
                "isActive": true,
                "commentaryBallByBallId": (currentBall.commentaryBallByBallId || "0"),

            }
            const updatedPartnership = generatePartnership({ commentaryDetails, currentPartnership: partnershipDetails, teams })
            const objToSave = {
                "commentaryId": commentaryDetails.commentaryId,
                "commentaryPartnership": updatedPartnership,
                "commentaryDetails": commentaryDetails,
                "commentaryPlayers": [].concat(allPlayersToUpdate, Object.values(updatedOnPitchPlayer)),
                "commentaryBallByBall": currentBallDetails
            }
            checkForOverSwitch()
            // console.log("Called from : 9");
            dispatch(addCommentaryScreenData(objToSave))
            setIsWicketChange(undefined)
            setCurrentPartnership({})
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
        // let updatedNewPlayer = {
        //     ...newPlayer,
        //     "playerId": oldPlayer["playerId"],
        //     "playerName": oldPlayer["playerName"],
        //     "batsmanAverage": oldPlayer["batsmanAverage"],
        //     "bowlerAverage": oldPlayer["bowlerAverage"],
        //     "batterOrder": null,
        //     "bowlerOrder": null,
        // }
        // let updatedOldPlayer = {
        //     ...oldPlayer,
        //     "playerId": newPlayer["playerId"],
        //     "playerName": newPlayer["playerName"],
        //     "batsmanAverage": newPlayer["batsmanAverage"],
        //     "bowlerAverage": newPlayer["bowlerAverage"],
        //     "batterOrder": newPlayer["batterOrder"],
        //     "bowlerOrder": newPlayer["bowlerOrder"],
        // }
        let updatedNewPlayer = {}
        let updatedOldPlayer = {}
        if (oldPlayer?.batBall || oldPlayer?.batRun) {
            updatedNewPlayer = {
                ...newPlayer,
                "playerId": oldPlayer["playerId"],
                "playerName": oldPlayer["playerName"],
                "batsmanAverage": oldPlayer["batsmanAverage"],
                "bowlerAverage": oldPlayer["bowlerAverage"],
                "batterOrder": null,
                "bowlerOrder": null,
            }
            updatedOldPlayer = {
                ...oldPlayer,
                "playerId": newPlayer["playerId"],
                "playerName": newPlayer["playerName"],
                "batsmanAverage": newPlayer["batsmanAverage"],
                "bowlerAverage": newPlayer["bowlerAverage"],
                "batterOrder": newPlayer["batterOrder"],
                "bowlerOrder": newPlayer["bowlerOrder"],
            }
        } else {
            updatedNewPlayer = {
                ...oldPlayer,
                "isPlay": newPlayer?.isPlay,
                "onStrike": newPlayer?.onStrike,
            }
            updatedOldPlayer = {
                ...newPlayer,
                "isPlay": oldPlayer?.isPlay,
                "onStrike": oldPlayer?.onStrike,
            }
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
            }
        }
        if (currentPartnership?.commentaryPartnershipId && +currentPartnership?.commentaryPartnershipId !== 0) {
            const updatedPartnership = {
                ...currentPartnership,
                batter1Name: updatedOnPitchPlayer?.[ON_STRIKE]?.playerName,
                batter1Id: updatedOnPitchPlayer?.[ON_STRIKE]?.commentaryPlayerId,
                batter2Name: updatedOnPitchPlayer?.[NON_STRIKE]?.playerName,
                batter2Id: updatedOnPitchPlayer?.[NON_STRIKE]?.commentaryPlayerId,
            }
            objToSave["commentaryPartnership"] = updatedPartnership
            _setCurrentPartnership(updatedPartnership)
        }
        // console.log("Called from : 10")
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
            "bowlerRun": +currentBowler.bowlerRun - getBowlerOnlyRuns(currentOver),
            "bowlerEconomy": getEconomyRate(+currentBowler.bowlerRun - getBowlerOnlyRuns(currentOver), +currentBowler.bowlerTotalBall - +currentOver.ballCount, matchTypeDetails.ballsPerOver),
            "bowlerDotBall": +currentBowler.bowlerDotBall - +currentOver.dotBall,
            "bowlerFour": +currentBowler.bowlerFour - +currentOver.totalFour,
            "bowlerSix": +currentBowler.bowlerSix - +currentOver.totalSix,
            "bowlerWideBall": +currentBowler.bowlerWideBall - +currentOver.totalWideBall,
            "bowlerNoBall": +currentBowler.bowlerNoBall - +currentOver.totalNoball,
            "bowlerWideBallRun": +currentBowler.bowlerWideBallRun - +currentOver.totalWideRun,
            "bowlerNoBallRun": +currentBowler.bowlerNoBallRun - +currentOver.totalNoBallRun,
            "bowlerByeBallRun": +currentBowler.bowlerByeBallRun - +currentOver.totalByesRun,
            "bowlerLegByeBallRun": +currentBowler.bowlerLegByeBallRun - +currentOver.totalLegByesRun,
            "bowlerTotalWicket": +currentBowler.bowlerTotalWicket - getBowlerRelatedWickets(currentOver?.overId, ballHistory),
            "isPlay": null
        }
        const updatedNewBowler = {
            ...newBowler,
            "bowlerOver": +(newBowler.bowlerOver || 0) + +(currentOver.ballCount / 10),
            "bowlerTotalBall": +(newBowler.bowlerTotalBall || 0) + +(currentOver.ballCount || 0),
            "bowlerRun": +(newBowler.bowlerRun || 0) + getBowlerOnlyRuns(currentOver),
            "bowlerEconomy": getEconomyRate(getBowlerOnlyRuns(currentOver), +currentOver.ballCount, matchTypeDetails.ballsPerOver),
            "bowlerDotBall": +(newBowler.bowlerDotBall || 0) + +(currentOver.dotBall || 0),
            "bowlerFour": +(newBowler.bowlerFour || 0) + +(currentOver.totalFour || 0),
            "bowlerSix": +(newBowler.bowlerSix || 0) + +(currentOver.totalSix || 0),
            "bowlerWideBall": +(newBowler.bowlerWideBall || 0) + +(currentOver.totalWideBall || 0),
            "bowlerNoBall": +(newBowler.bowlerNoBall || 0) + +(currentOver.totalNoball || 0),
            "bowlerWideBallRun": +(newBowler.bowlerWideBallRun || 0) + +(currentOver.totalWideRun || 0),
            "bowlerNoBallRun": +(newBowler.bowlerNoBallRun || 0) + +(currentOver.totalNoBallRun || 0),
            "bowlerByeBallRun": +(newBowler.bowlerByeBallRun || 0) + +(currentOver.totalByesRun || 0),
            "bowlerLegByeBallRun": +(newBowler.bowlerLegByeBallRun || 0) + +(currentOver.totalLegByesRun || 0),
            "bowlerTotalWicket": +(newBowler.bowlerTotalWicket || 0) + getBowlerRelatedWickets(currentOver?.overId, ballHistory),
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
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryPlayers": [updatedPerviousBowler, updatedNewBowler],
        }
        // console.log("Called from : 12")
        dispatch(addCommentaryScreenData(objToSave))
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
        const generatedBallByBall = generateBall({ currentBall: updateBall, commentaryDetails, currentOver, onPitchPlayers: { ...onPitchPlayers }, teams, currentPartnership })
        const objToSave = {
            "commentaryBallByBall": generatedBallByBall,
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryPlayers": playersToChangeList,
        }
        // console.log("Called from : 13")
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
        // console.log("Called from : 14")
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
                    onPitchPlayers: { ...onPitchPlayers, [ON_STRIKE]: updatedOnStrikePlayer, [NON_STRIKE]: updatedNonStrikePlayer }, teams,
                    currentPartnership
                }),
                "commentaryPlayers": [updatedOnStrikePlayer, updatedNonStrikePlayer, onPitchPlayers[CURRENT_BOWLER]]
            }
            // console.log("Called from : 15");
            dispatch(addCommentaryScreenData(objToSave))
        }
        setCurrentWicket(undefined)
    }
    const handleUndoClick = () => {
        if (currentBall?.commentaryBallByBallId && (+currentBall?.overCount === +teams[BATTING_TEAM].teamOver)) {
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
                updateBattingTeam["teamScore"] = getNonNegativeValue((+teams[BATTING_TEAM].teamScore || 0) - run)
                updateBattingTeam["teamPenaltyRuns"] = getNonNegativeValue((+teams[BATTING_TEAM].teamPenaltyRuns || 0) - run)
                updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, { ...currentOver }, matchTypeDetails.ballsPerOver)
                if (matchTypeDetails.isLimitedOvers && (target > 0)) {
                    updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                        currentOver, matchTypeDetails.ballsPerOver, target, teams[BATTING_TEAM]?.teamMaxOver)
                }
                _setTeams({ ...(_teams || teams), [BATTING_TEAM]: updateBattingTeam })
                const objToSave = {
                    "commentaryId": commentaryDetails.commentaryId,
                    "commentaryTeams": [updateBattingTeam],
                    "deleteCommentaryBallByBallId": currentBall.commentaryBallByBallId
                }
                // console.log("Called from : 16");
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
                    if (!LIST_TO_EXCLUDE_WICKET_FOR_BOWLER.includes(currentBall.ballWicketType))
                        updateBowler["bowlerTotalWicket"] = (onPitchPlayers[CURRENT_BOWLER].bowlerTotalWicket || 0) - 1
                    updatePartnership = { ...partnershipHistory[partnershipHistory.length - 2], isActive: true }
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
                        updatePartnership["batter1Balls"] = getNonNegativeValue((updatePartnership.batter1Balls || 0) -
                            (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter1Id) ? 1 : 0));
                        updatePartnership["batter2Balls"] = getNonNegativeValue((updatePartnership.batter2Balls || 0) -
                            (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter2Id) ? 1 : 0));
                        updateBowler["bowlerOver"] = updatedBowlerOver
                        updateBattingTeam["teamOver"] =
                            ((+teams[BATTING_TEAM].teamOver || 0) - 0.1).toFixed(1)
                        if (run === 0) {
                            updateBatter["batDotBall"] = (batter.batDotBall || 0) - 1
                            updateOver["dotBall"] = (currentOver.dotBall || 0) - 1
                            updateBowler["bowlerDotBall"] = (bowler.bowlerDotBall || 0) - 1
                        }
                    }
                    updateBatter["batRun"] = getNonNegativeValue((batter.batRun || 0) - run)
                    updateBowler["bowlerRun"] = getNonNegativeValue((bowler.bowlerRun || 0) - run)
                    updatePartnership["totalRuns"] = getNonNegativeValue((updatePartnership?.totalRuns || 0) - run)
                    updatePartnership["batter1Runs"] = getNonNegativeValue((updatePartnership.batter1Runs || 0) -
                        (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter1Id) ? run : 0));
                    updatePartnership["batter2Runs"] = getNonNegativeValue((updatePartnership.batter2Runs || 0) -
                        (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter2Id) ? run : 0));
                    updateOver["totalRun"] = getNonNegativeValue((currentOver.totalRun || 0) - run)
                    updateBattingTeam["teamScore"] = getNonNegativeValue((teams[BATTING_TEAM].teamScore || 0) - run)
                    if (matchTypeDetails.isLimitedOvers && (target > 0)) {
                        updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                            currentOver, matchTypeDetails.ballsPerOver, target, teams[BATTING_TEAM]?.teamMaxOver)
                    }
                    if (currentBall.ballFour === 1 && currentBall.ballIsBoundry) {
                        updateBatter["batFour"] = getNonNegativeValue((batter.batFour || 0) - 1)
                        updateOver["totalFour"] = getNonNegativeValue((currentOver.totalFour || 0) - 1)
                        updatePartnership["totalFour"] = (currentPartnership.totalFour || 0) - 1
                        updateBowler["bowlerFour"] = getNonNegativeValue((bowler.bowlerFour || 0) - 1)

                    } else if (currentBall.ballSix === 1 && currentBall.ballIsBoundry) {
                        updateBatter["batSix"] = getNonNegativeValue((batter.batSix || 0) - 1)
                        updateOver["totalSix"] = getNonNegativeValue((currentOver.totalSix || 0) - 1)
                        updatePartnership["totalSix"] = (currentPartnership.totalSix || 0) - 1
                        updateBowler["bowlerSix"] = getNonNegativeValue((bowler.bowlerSix || 0) - 1)
                    }
                    updateBatter = { ...playersOnPitch[isOnStrikeSame ? ON_STRIKE : NON_STRIKE], ...updateBatter, onStrike: isOnStrikeSame ? false : true }
                    updateBowler = { ...playersOnPitch[CURRENT_BOWLER], ...updateBowler }
                    const updateNonStriker = { ...playersOnPitch[isOnStrikeSame ? NON_STRIKE : ON_STRIKE], onStrike: isOnStrikeSame ? true : false }
                    updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, { ...currentOver, ...updateOver }, matchTypeDetails.ballsPerOver)
                    updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, updateBowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
                    updateBowler["bowlerMaidenOver"] = 0
                    updateBatter["batsmanStrikeRate"] = getStrikeRate(updateBatter.batRun, updateBatter.batBall)
                    updateOver["isMaiden"] = false
                    _setOnPitchPlayers({ [ON_STRIKE]: updateBatter, [NON_STRIKE]: updateNonStriker, [CURRENT_BOWLER]: updateBowler })
                    _setPlayers((prevValue) => {
                        const actualPlayerValue = prevValue || players
                        return {
                            [BOWLING_TEAM]: actualPlayerValue?.[BOWLING_TEAM]?.map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player),
                            [BATTING_TEAM]: actualPlayerValue?.[BATTING_TEAM]?.map(player => {
                                if (compareNumStringValues(player.commentaryPlayerId, updateBatter.commentaryPlayerId))
                                    return updateBatter
                                else if (compareNumStringValues(player.commentaryPlayerId, updateNonStriker.commentaryPlayerId))
                                    return updateNonStriker
                                else return player
                            })
                        }
                    })
                    _setCurrentPartnership({ ...currentPartnership, ...updatePartnership, })
                    _setTeams({ ...teams, [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam } })
                    _setCurrentOver({ ...currentOver, ...updateOver, })
                } else {
                    if (type === BALL_TYPE_WIDE) {
                        updateBowler["bowlerWideBall"] = getNonNegativeValue((bowler.bowlerWideBall || 0) - 1)
                        updateBowler["bowlerWideBallRun"] = getNonNegativeValue((bowler.bowlerWideBallRun || 0) - totalRun)
                        updateBowler["bowlerRun"] = getNonNegativeValue((bowler.bowlerRun || 0) - totalRun)
                        updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, bowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
                        updateBattingTeam["teamWideRuns"] = getNonNegativeValue((updateBattingTeam.teamWideRuns || 0) - totalRun)
                        updateBattingTeam["teamScore"] = getNonNegativeValue((teams[BATTING_TEAM].teamScore || 0) - totalRun)
                        updateOver["totalWideBall"] = getNonNegativeValue((currentOver.totalWideBall || 0) - 1)
                        updateOver["totalWideRun"] = getNonNegativeValue((currentOver.totalWideRun || 0) - totalRun)
                        updateOver["totalRun"] = getNonNegativeValue((currentOver.totalRun || 0) - totalRun)
                        updatePartnership["totalRuns"] = getNonNegativeValue(updatePartnership.totalRuns - totalRun)
                        updatePartnership["extras"] = getNonNegativeValue(updatePartnership.extras - totalRun)
                        updatePartnership["batter1Balls"] = updatePartnership.batter1Balls || 0;
                        updatePartnership["batter2Balls"] = updatePartnership.batter2Balls || 0;
                        updatePartnership["batter1Runs"] = updatePartnership.batter1Runs || 0;
                        updatePartnership["batter2Runs"] = updatePartnership.batter2Runs || 0;
                    } else if (type === BALL_TYPE_NO_BALL || type === BALL_TYPE_NO_BALL_BYE || type === BALL_TYPE_NO_BALL_LEG_BYE) {
                        const noBallValue = +currentBall.ballExtraRun
                        const UpdatedBallRun = +currentBall.ballRun
                        const totalRunToDelete = UpdatedBallRun + noBallValue
                        batter["batBall"] = getNonNegativeValue((batter.batBall || 0) - 1)
                        updateBowler["bowlerNoBall"] = getNonNegativeValue((bowler.bowlerNoBall || 0) - 1)
                        updateBowler["bowlerNoBallRun"] = getNonNegativeValue((bowler.bowlerNoBallRun || 0) - noBallValue)
                        updateBattingTeam["teamNoBallRuns"] = getNonNegativeValue((updateBattingTeam.teamWideRuns || 0) - noBallValue)
                        updateBattingTeam["teamScore"] = getNonNegativeValue((teams[BATTING_TEAM].teamScore || 0) - totalRun)
                        updateOver["totalNoball"] = getNonNegativeValue((currentOver.totalNoball || 0) - 1)
                        updateOver["totalNoBallRun"] = getNonNegativeValue((currentOver.totalNoBallRun || 0) - noBallValue)
                        updateOver["totalRun"] = getNonNegativeValue((currentOver.totalRun || 0) - totalRunToDelete)
                        updatePartnership["totalRuns"] = getNonNegativeValue(updatePartnership.totalRuns - totalRunToDelete)
                        updatePartnership["batter1Balls"] = updatePartnership.batter1Balls || 0;
                        updatePartnership["batter2Balls"] = updatePartnership.batter2Balls || 0;
                        // updatePartnership["extras"] = currentPartnership.extras - currentBall.ballExtraRun
                        if (type === BALL_TYPE_NO_BALL) {
                            updateBowler["bowlerRun"] = getNonNegativeValue((bowler.bowlerRun || 0) - totalRunToDelete)
                            batter["batRun"] = getNonNegativeValue((batter.batRun || 0) - run)
                            updatePartnership["extras"] = getNonNegativeValue(updatePartnership.extras - noBallValue)
                            updatePartnership["batter1Runs"] = getNonNegativeValue((updatePartnership.batter1Runs || 0) -
                                (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter1Id) ? run : 0));
                            updatePartnership["batter2Runs"] = getNonNegativeValue((updatePartnership.batter2Runs || 0) -
                                (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter2Id) ? run : 0));
                        } else if (type === BALL_TYPE_NO_BALL_BYE) {
                            updateBowler["bowlerRun"] = getNonNegativeValue((bowler.bowlerRun || 0) - noBallValue)
                            updateBowler["bowlerByeBallRun"] = getNonNegativeValue((bowler.bowlerByeBallRun || 0) - UpdatedBallRun)
                            updateOver["totalByesRun"] = getNonNegativeValue((currentOver.totalByesRun || 0) - UpdatedBallRun)
                            updatePartnership["extras"] = getNonNegativeValue(updatePartnership.extras - totalRunToDelete)
                            updateBattingTeam["teamByRuns"] = getNonNegativeValue((updateBattingTeam.teamByRuns || 0) - UpdatedBallRun)
                            updatePartnership["batter1Balls"] = getNonNegativeValue((updatePartnership.batter1Balls || 0) -
                                (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter1Id) ? 1 : 0));
                            updatePartnership["batter2Balls"] = getNonNegativeValue((updatePartnership.batter2Balls || 0) -
                                (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter2Id) ? 1 : 0));
                        }
                        else if (type === BALL_TYPE_NO_BALL_LEG_BYE) {
                            updateBowler["bowlerRun"] = getNonNegativeValue((bowler.bowlerRun || 0) - noBallValue)
                            updateBowler["bowlerNoBallRun"] = getNonNegativeValue((bowler.bowlerNoBallRun || 0) - UpdatedBallRun)
                            updateOver["totalLegByesRun"] = getNonNegativeValue((currentOver.totalNoBallRun || 0) - UpdatedBallRun)
                            updatePartnership["extras"] = getNonNegativeValue(updatePartnership.extras - totalRunToDelete)
                            updateBattingTeam["teamLegByRuns"] = getNonNegativeValue((updateBattingTeam.teamLegByRuns || 0) - UpdatedBallRun)
                            updatePartnership["batter1Balls"] = getNonNegativeValue((updatePartnership.batter1Balls || 0) -
                                (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter1Id) ? 1 : 0));
                            updatePartnership["batter2Balls"] = getNonNegativeValue((updatePartnership.batter2Balls || 0) -
                                (compareNumStringValues(batter.commentaryPlayerId, currentPartnership.batter2Id) ? 1 : 0));
                        }
                    }
                    else {
                        batter["batBall"] = getNonNegativeValue((batter.batBall || 0) - 1)
                        updateBowler["bowlerOver"] = getNonNegativeValue(((+bowler.bowlerOver || 0) - 0.1).toFixed(1))
                        updateBattingTeam["teamOver"] = getNonNegativeValue(((+teams[BATTING_TEAM].teamOver || 0) - 0.1).toFixed(1))
                        updateBowler["bowlerTotalBall"] = getNonNegativeValue((bowler.bowlerTotalBall || 0) - 1)
                        updateOver["ballCount"] = getNonNegativeValue((currentOver.ballCount || 0) - 1)
                        updateOver["totalRun"] = getNonNegativeValue((currentOver.totalRun || 0) - run)
                        updateBattingTeam["teamScore"] = getNonNegativeValue((teams[BATTING_TEAM].teamScore || 0) - run)
                        updatePartnership["totalRuns"] = getNonNegativeValue(updatePartnership.totalRuns - run)
                        updatePartnership["extras"] = getNonNegativeValue(updatePartnership.extras - run)
                        updatePartnership["totalBalls"] = getNonNegativeValue(updatePartnership.totalBalls - 1)
                        if (type === BALL_TYPE_BYE) {
                            updateBowler["bowlerByeBall"] = getNonNegativeValue((bowler.bowlerByeBall || 0) - 1)
                            updateBowler["bowlerByeBallRun"] = getNonNegativeValue((bowler.bowlerByeBallRun || 0) - run)
                            updateOver["totalByesBall"] = getNonNegativeValue((currentOver.totalByesBall || 0) - 1)
                            updateOver["totalByesRun"] = getNonNegativeValue((currentOver.totalByesRun || 0) - run)
                            updateBattingTeam["teamByRuns"] = getNonNegativeValue((updateBattingTeam.teamByRuns || 0) - run)
                        }
                        else if (type === BALL_TYPE_LEG_BYE) {
                            updateBowler["bowlerLegByeBall"] = getNonNegativeValue((bowler.bowlerLegByeBall || 0) - 1)
                            updateBowler["bowlerLegByeBallRun"] = getNonNegativeValue((bowler.bowlerLegByeBallRun || 0) - run)
                            updateOver["totalLegByesBall"] = getNonNegativeValue((currentOver.totalLegByesBall || 0) - 1)
                            updateOver["totalLegByesRun"] = getNonNegativeValue((currentOver.totalLegByesRun || 0) - run)
                            updateBattingTeam["teamLegByRuns"] = getNonNegativeValue((updateBattingTeam.teamLegByRuns || 0) - run)
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
                    _setOnPitchPlayers({ [ON_STRIKE]: updateBatter, [NON_STRIKE]: updateNonStriker, [CURRENT_BOWLER]: updateBowler })
                    _setPlayers({
                        [BOWLING_TEAM]: players?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player),
                        [BATTING_TEAM]: players?.[BATTING_TEAM].map(player => {
                            if (compareNumStringValues(player.commentaryPlayerId, updateBatter.commentaryPlayerId))
                                return updateBatter
                            else if (compareNumStringValues(player.commentaryPlayerId, updateNonStriker.commentaryPlayerId))
                                return updateNonStriker
                            else return player
                        })
                    })
                    _setTeams({ ...teams, [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam } })
                    _setCurrentOver({ ...currentOver, ...updateOver })
                    _setCurrentPartnership({ ...currentPartnership, ...updatePartnership })
                }
                if (isBallCount) {
                    setBallCountForStrike(currentBall.autoStrikeBallCount || 0)
                }
                setIsUndoBall(undoType)
                setSaveToDb(true)
            }
        } else {
            // setUndoErrorModal(`OverCount in ball: ${+currentBall?.overCount} is not equal to teamOver : ${+teams[BATTING_TEAM].teamOver}. please correct it from update feature screen`)
            setUndoErrorModal(`There is some data mismatched, Please click Retry.`)
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
                updatedPlayerToSend["batterOrder"] = null
            }
            return updatedPlayerToSend
        }
        const updatedOnPitchPlayer = {}
        const playerListToSendToDb = []
        const updatedBattingPlayerList = players[BATTING_TEAM].map(player => {
            let forNewPlayers = {}
            if (compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[ON_STRIKE].commentaryPlayerId)
                || compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[NON_STRIKE].commentaryPlayerId)) {
                forNewPlayers = { isPlay: null, onStrike: null, isBatterOut: null, batterOrder: null, batsmanStrikeRate: null, bowlerEconomy: null }
                playerListToSendToDb.push({ ...player, ...forNewPlayers })
            }
            let updatedPlayer = { ...player, ...forNewPlayers }
            let wicketDetails = {}
            if (compareNumStringValues(player.commentaryPlayerId, currentBall.batStrikeId)) {
                wicketDetails = isbatterWicket(player)
                updatedPlayer = { ...updatedPlayer, ...wicketDetails, isPlay: true, onStrike: true }
                if (compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[ON_STRIKE].commentaryPlayerId)) updatedPlayer["batterOrder"] = onPitchPlayers[ON_STRIKE].batterOrder
                if (compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[NON_STRIKE].commentaryPlayerId)) updatedPlayer["batterOrder"] = onPitchPlayers[NON_STRIKE].batterOrder
                updatedOnPitchPlayer[ON_STRIKE] = updatedPlayer
            }
            else if (compareNumStringValues(player.commentaryPlayerId, currentBall.batNonStrikeId)) {
                wicketDetails = isbatterWicket(player)
                updatedPlayer = { ...updatedPlayer, ...wicketDetails, isPlay: true, onStrike: false }
                if (compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[ON_STRIKE].commentaryPlayerId)) updatedPlayer["batterOrder"] = onPitchPlayers[ON_STRIKE].batterOrder
                if (compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[NON_STRIKE].commentaryPlayerId)) updatedPlayer["batterOrder"] = onPitchPlayers[NON_STRIKE].batterOrder
                updatedOnPitchPlayer[NON_STRIKE] = updatedPlayer
            }
            return updatedPlayer
        })
        _setPlayers({ ...players, [BATTING_TEAM]: updatedBattingPlayerList })
        updatedOnPitchPlayer[CURRENT_BOWLER] = onPitchPlayers[CURRENT_BOWLER]
        setPlayerUpdateList([].concat(playerListToSendToDb, playerUpdateList || []))
        return updatedOnPitchPlayer
    }

    const updateAfterOverUndo = () => {
        console.log("inside here");
        setIsUndoingLastOver(true);
        // removing 2 becaus length and index difference
        const previousBall = ballHistory[ballHistory.length - 2]
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
                const bowlToAdd = ((+previousBall.currentOverBalls || 0) / 10)
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
            if (compareNumStringValues(player.commentaryPlayerId, previousBall.nextBatStrikeId)) {
                updatedPlayer["isPlay"] = true
                updatedPlayer["onStrike"] = true
                previousOnPitchPlayer[ON_STRIKE] = updatedPlayer
            }
            if (compareNumStringValues(player.commentaryPlayerId, previousBall.nextBatNonStrikeId)) {
                updatedPlayer["isPlay"] = true
                previousOnPitchPlayer[NON_STRIKE] = updatedPlayer
            }
            return updatedPlayer
        })
        _setTeams({ ...teams, [BATTING_TEAM]: updatedBattingTeam })
        _setPlayers({ [BATTING_TEAM]: updatedBattingPlayerList, [BOWLING_TEAM]: updatedBowlingPlayerList })
        _setOnPitchPlayers(previousOnPitchPlayer)
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
        // console.log("Called from : 17")
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
        // console.log("Called from : 18")
        dispatch(addCommentaryScreenData(objToSave))
    }
    const onRetiredHurtClick = (retiredHurtData) => {
        // console.log("retiredHurtData", retiredHurtData)
        const updateBall = {
            "commentaryBallByBallId": "0",
            "ballIsCount": false,
            "ballRun": 0,
            "ballExtraRun": 0,
            "batStrikeId": retiredHurtData[PREV_ON_STRIKE]?.commentaryPlayerId,
            "batNonStrikeId": retiredHurtData[PREV_NON_STRIKE]?.commentaryPlayerId,
            "ballType": BALL_TYPE_RETIRED_HURT
        }
        const currentBallDetails = generateBall({ currentBall: updateBall, commentaryDetails, currentOver, onPitchPlayers: retiredHurtData, teams, currentPartnership })
        // const currentBallDetails = { ...currentBall }
        currentBallDetails["nextBatStrikeId"] = retiredHurtData[ON_STRIKE]?.commentaryPlayerId
        currentBallDetails["nextBatNonStrikeId"] = retiredHurtData[NON_STRIKE]?.commentaryPlayerId
        const partnershipDetails = {
            "batter1Id": retiredHurtData[ON_STRIKE]?.commentaryPlayerId,
            "batter1Name": retiredHurtData[ON_STRIKE]?.playerName,
            "batter2Id": retiredHurtData[NON_STRIKE]?.commentaryPlayerId,
            "batter2Name": retiredHurtData[NON_STRIKE]?.playerName,
            "commentaryBallByBallId": (currentBall.commentaryBallByBallId || "0"),
            "batter1Runs": 0,
            "batter2Runs": 0,
            "batter1Balls": 0,
            "batter2Balls": 0,
            "order": teams?.[BATTING_TEAM]?.teamWicket + 1,
            "isActive": true,
        }
        const updatedPartnership = generatePartnership({ commentaryDetails, currentPartnership: partnershipDetails, teams })
        const objToSave = {
            "commentaryId": commentaryDetails.commentaryId,
            "commentaryPartnership": updatedPartnership,
            "commentaryDetails": commentaryDetails,
            "commentaryPlayers": [retiredHurtData[ON_STRIKE], retiredHurtData[NON_STRIKE], retiredHurtData[RETIRED_HURT_BATTER]],
            "commentaryBallByBall": currentBallDetails
        }
        checkForOverSwitch()
        setCurrentPartnership({})
        // console.log("Called from : 19")
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
        // console.log("Called from : 20")
        dispatch(addCommentaryScreenData(objToSave))
        setPlayers({ ...players, [BATTING_TEAM]: updatedPlayerList })
        setOnPitchPlayers({ ...onPitchPlayers, ...updatedOnPitchPlayer })
        setIsUndoBall(RETIRED_HURT)
    }
    const initialDataLoad = () => {
        const currentInningsTeams = {}
        const battingTeam = []
        const bowlingTeam = []
        const onPitchPlayers = {}
        let partnershipFromApi = {}
        const apiCallObj = {}
        let currentOver = 0
        let currentOverToUpdate = 0
        let targetToUpdate = 0
        propsData.commentaryData.commentaryTeams.forEach(teamDetails => {
            if (isEqual(teamDetails.currentInnings, commentaryDetails.currentInnings)) {
                const isBattingTeam = teamDetails.teamStatus === BAT
                currentInningsTeams[isBattingTeam ? BATTING_TEAM : BOWLING_TEAM] = teamDetails
                if (isBattingTeam) {
                    currentOver = Math.floor(teamDetails?.teamOver)
                    const trail = (+teamDetails?.teamTrialRuns || 0)
                    if (trail > -1) targetToUpdate = trail + 1
                }
            }
        });
        if (currentInningsTeams?.[BOWLING_TEAM]?.isBattingComplete) setTarget(targetToUpdate)
        propsData.commentaryData.commentaryPlayers.forEach(playerDetails => {
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
        // propsData.commentaryData.commentaryPartnership.forEach(partnershipDetails => {
        //     if (
        //         (isEqual(partnershipDetails.batter1Id, onPitchPlayers[ON_STRIKE]?.commentaryPlayerId) &&
        //             isEqual(partnershipDetails.batter2Id, onPitchPlayers[NON_STRIKE]?.commentaryPlayerId)) ||
        //         (
        //             isEqual(partnershipDetails.batter1Id, onPitchPlayers[NON_STRIKE]?.commentaryPlayerId) &&
        //             isEqual(partnershipDetails.batter2Id, onPitchPlayers[ON_STRIKE]?.commentaryPlayerId)
        //         )) {
        //         partnershipFromApi = partnershipDetails
        //     }
        // });
        partnershipFromApi = propsData.commentaryData.commentaryPartnership?.find((i) => i?.isActive) || {};
        propsData.commentaryData.commentaryOvers.forEach(overDetails => {
            if (
                isEqual(+overDetails.teamId, currentInningsTeams?.[BOWLING_TEAM]?.teamId) &&
                isEqual(+overDetails.over, +currentOver) &&
                isEqual(+overDetails?.currentInnings, commentaryDetails.currentInnings)) currentOverToUpdate = overDetails
        });
        const ballData = propsData.commentaryData.commentaryBallByBall || []
        let ballByBallHistoryData = ballData?.commentaryBallByBallId ? [ballData] : ballData
        ballByBallHistoryData = _.orderBy(ballByBallHistoryData, ["commentaryBallByBallId"], ["asc"])
        const overData = propsData.commentaryData.commentaryOvers || []
        let overHistoryData = overData.overId ? [overData] : overData
        overHistoryData = _.orderBy(overHistoryData, ["overId"], ["asc"])
        const partnershipData = propsData.commentaryData.commentaryPartnership || []
        let currentBallToUpdate = currentBall.commentaryBallByBallId ? currentBall : _.isArray(ballByBallHistoryData) ? ballByBallHistoryData[ballByBallHistoryData.length - 1] : undefined
        let partnershipHistoryData = partnershipData.commentaryPartnershipId ? [partnershipData] : (!isEmpty(partnershipData) && !isEmpty(partnershipFromApi))
            ? [
                ...partnershipData.filter(
                    obj => obj.batter1Id !== partnershipFromApi.batter1Id ||
                        obj.batter2Id !== partnershipFromApi.batter2Id
                ),
                { ...partnershipFromApi, "commentaryBallByBallId": currentBallToUpdate?.commentaryBallByBallId }
            ]
            : partnershipData;
        // let partnershipHistoryData = partnershipData.commentaryPartnershipId ? [partnershipData] : !isEmpty(partnershipData) ?
        //     [{ ...partnershipFromApi, "commentaryBallByBallId": currentBallToUpdate }] : partnershipData
        partnershipHistoryData = _.orderBy(partnershipHistoryData, ["commentaryPartnershipId"], ["asc"])
        const partnershipDetails = {
            "batter1Id": onPitchPlayers[ON_STRIKE]?.commentaryPlayerId,
            "batter1Name": onPitchPlayers[ON_STRIKE]?.playerName,
            "batter2Id": onPitchPlayers[NON_STRIKE]?.commentaryPlayerId,
            "batter2Name": onPitchPlayers[NON_STRIKE]?.playerName,
            "commentaryBallByBallId": currentBallToUpdate?.commentaryBallByBallId || "0",
            "order": currentInningsTeams?.[BATTING_TEAM]?.teamWicket + 1 || 1,
            "isActive": true,
        }
        setTeams(currentInningsTeams)
        setPlayers({ [BATTING_TEAM]: battingTeam, [BOWLING_TEAM]: bowlingTeam })
        setOnPitchPlayers(onPitchPlayers)
        setOverBallByBallDisplay(getBallsForAllOver(ballByBallHistoryData))
        setBallHistory(ballByBallHistoryData)
        setOverHistory(overHistoryData)
        setPartnershipHistory(partnershipHistoryData)
        setWicketHistory(propsData.commentaryData.commentaryWicket)
        setCurrentPartnership(partnershipFromApi)
        setCurrentOver(currentOverToUpdate)
        setCurrentBall(currentBallToUpdate)
        if (!isEmpty(currentBallToUpdate)) setBallCountForStrike((currentBallToUpdate.autoStrikeBallCount || 0) + 1)
        setIsLastInnings(commentaryDetails.currentInnings >= matchTypeDetails.noOfIningsPerSide)
        if (isEmpty(partnershipFromApi) && onPitchPlayers[ON_STRIKE]?.commentaryPlayerId
            && onPitchPlayers[NON_STRIKE]?.commentaryPlayerId)
            apiCallObj["commentaryPartnership"] = generatePartnership({ commentaryDetails, currentPartnership: partnershipDetails, teams: currentInningsTeams })
        if (!currentOverToUpdate && onPitchPlayers[CURRENT_BOWLER]?.commentaryPlayerId) {
            apiCallObj["commentaryOvers"] = generateOver({
                commentaryDetails, onPitchPlayers, teams: currentInningsTeams
            })
        }
        if (!isEmpty(apiCallObj)) {
            // console.log("Called from : 21 ");
            dispatch(addCommentaryScreenData({
                ...apiCallObj,
                "commentaryId": commentaryDetails.commentaryId,
            }))
        }
    }
    const updateTempToMain = () => {
        if (!isEmpty(_currentOver)) {
            setCurrentOver(_currentOver)
            _setCurrentOver()
        }
        if (!isEmpty(_currentPartnership)) {
            setCurrentPartnership(_currentPartnership)
            _setCurrentPartnership()
        }
        if (!isEmpty(_onPitchPlayers)) {
            setOnPitchPlayers(_onPitchPlayers)
            _setOnPitchPlayers()
        }
        if (!isEmpty(_players)) {
            setPlayers(_players)
            _setPlayers()
        }
        if (!isEmpty(_teams)) {
            setTeams(_teams)
            _setTeams()
        }
    }
    useEffect(() => {
        if (superOverApiData) {
            props.onInningsChange()
            dispatch(clearAddCommentaryScreenData())
        }
    }, [superOverApiData])
    useEffect(() => {
        if (updateRunsFromWicket) {
            updateRuns(updateRunsFromWicket)
        }
    }, [updateRunsFromWicket])

    useEffect(() => {
        if (!isEmpty(commentaryDetails) && ballStatus) {
            if (socket) {
                socket.emit(COMMENTARY_UPDATE, { ballStatus: ballStatus, eventRefId: commentaryDetails?.eventRefId, commentaryId: commentaryDetails?.commentaryId });
            }
        }
    }, [commentaryDetails, ballStatus]);

    useEffect(() => {
        if (isUndoCompleted) {
            if (isUndoBall === WICKET || isUndoBall === RETIRED_HURT) {
                const updatedWicketHistory = wicketHistory.slice(0, -1)
                const updaterPartnershipHistory = partnershipHistory.slice(0, -1)
                setWicketHistory(updatedWicketHistory)
                setPartnershipHistory(updaterPartnershipHistory)
                setCurrentPartnership(updaterPartnershipHistory[updaterPartnershipHistory.length - 1])
            }
            else if (isUndoBall === OVER) {
                const updatedOverHistory = overHistory.slice(0, -1)
                const newCurrentOver = { ...updatedOverHistory[updatedOverHistory.length - 1] }
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
            dispatch(clearAddCommentaryScreenData())
        }
    }, [redirectOnScreenChange, isCommentaryDataUpdated])
    useEffect(() => {
        if (changeOverOnPopupClick) {
            // setOverBallByBallDisplay([])
            checkInningsSwitch(OVER)
            changePlayer(CURRENT_BOWLER)
            setOnPitchPlayers({ ...onPitchPlayers, [CURRENT_BOWLER]: null })
            changeOver()
            setOverPopUpForBowler(true)
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
                const generatedBallByBall = generateBall({
                    currentBall: newCurrentBall, commentaryDetails,
                    currentOver: _currentOver || currentOver, onPitchPlayers: _onPitchPlayers || onPitchPlayers, teams: _teams || teams,
                    currentPartnership
                })
                objToSave = {
                    ...objToSave,
                    "commentaryId": commentaryDetails.commentaryId,
                    "commentaryBallByBall": generatedBallByBall,
                    "commentaryOvers": {
                        ..._currentOver,
                        "teamScore": `${_teams[BATTING_TEAM]?.teamScore || 0}/${_teams[BATTING_TEAM]?.teamWicket || 0}`
                    },
                    "commentaryPlayers": [].concat(playerUpdateList, Object.values(_onPitchPlayers)).filter(x => x),
                    "commentaryPartnership": generatePartnership({
                        commentaryDetails, currentBall: {},
                        currentPartnership: _currentPartnership || currentPartnership, teams: _teams
                    }),
                    "commentaryDetails": {
                        ...commentaryDetails,
                        "displayStatus": generateDisplayStatus({ currentBall: generatedBallByBall }),
                        "rmk": teams[BATTING_TEAM].teamTrialRuns ?
                            generateRemainingRuns(teams[BATTING_TEAM], matchTypeDetails.ballsPerOver) :
                            ""
                    },
                    "commentaryTeams": [_teams[BATTING_TEAM]],
                }
                if (objToSave.deleteCommentaryBallByBallId) delete objToSave.commentaryBallByBall
                if (objToSave.deleteOverId) delete objToSave.commentaryOvers
                // console.log("Called from : 22");
                dispatch(addCommentaryScreenData(objToSave))
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
            // console.log("Called from : 23");
            dispatch(addCommentaryScreenData(objToSave))
            setIsOverChange(undefined)
            setPlayerUpdateList([])
        }
    }, [isOverChange])
    useEffect(() => {
        if (isEmpty(propsData) && !isEmpty(props.data)) {
            setPropsData(props.data)
            setIsWheelShow(props?.data?.commentaryData?.commentaryDetails?.isWheelShow);
            setIsShotType(props?.data?.commentaryData?.commentaryDetails?.shotType);
            setCommentaryDetails({ ...props.data.commentaryData.commentaryDetails, rmk: "", displayStatus: "" })
            setMatchTypeDetails(props.data.commentaryData.matchTypeDetails)
        }
        props.saveUserInfo()
    }, [])
    useEffect(() => {
        if (!isEmpty(propsData)) {
            initialDataLoad()
        }
    }, [propsData])
    useEffect(() => {
        if (!isEmpty(commentaryDataToUpdate)) {
            // Update Over history on over change
            setIsWheelShowComplete(false);
            if (isWheelShow) {
                if (commentaryDataToUpdate?.commentaryBallByBallDetails?.ballRun && !showWicketModal) {
                    setShowCricketFieldModal(true);
                    setCricketFieldData({ commentaryId: commentaryDetails.commentaryId, commentaryBallByBallId: commentaryDataToUpdate?.commentaryBallByBallDetails?.commentaryBallByBallId, run: commentaryDataToUpdate?.commentaryBallByBallDetails?.ballRun, isBoundary: commentaryDataToUpdate?.commentaryBallByBallDetails?.ballIsBoundry, batter: onPitchPlayers[ON_STRIKE]?.playerName, bowler: onPitchPlayers[CURRENT_BOWLER]?.playerName, overCount: commentaryDataToUpdate?.commentaryBallByBallDetails?.overCount });
                } else if (commentaryDataToUpdate?.commentaryBallByBallDetails?.ballRun === 0) {
                    setIsWheelShowComplete(true);
                }
            }
            if (!isEmpty(commentaryDataToUpdate.overdetails) && !isEqual(commentaryDataToUpdate.overdetails.overId, currentOver.overId)) {
                const updatedOverHistory = overHistory.slice(0, -1)
                setOverHistory([].concat(updatedOverHistory || [], [currentOver, commentaryDataToUpdate.overdetails]))
                const generatedBall = generateBall({ currentBall: { commentaryBallByBallId: "0", }, commentaryDetails, currentOver: { overId: commentaryDataToUpdate.overdetails.overId }, onPitchPlayers, teams, currentPartnership })
                // console.log("Called from : 24");
                dispatch(addCommentaryScreenData({
                    "commentaryId": commentaryDetails.commentaryId,
                    "commentaryDetails": { ...commentaryDetails, "displayStatus": generateDisplayStatus({ currentBall: generatedBall }) },
                    "commentaryBallByBall": generatedBall,
                }))
                setCurrentOver(commentaryDataToUpdate.overdetails)
            }
            const commentartBallByBallIdToUpdate = commentaryDataToUpdate?.commentaryBallByBallDetails?.commentaryBallByBallId
            // Update ball history on ball change
            if (!isEmpty(commentaryDataToUpdate.commentaryBallByBallDetails)
                && !compareNumStringValues(currentBall?.commentaryBallByBallId, commentaryDataToUpdate.commentaryBallByBallDetails.commentaryBallByBallId)) {
                // If Partnership Ball By ball Id is not correct, then update it
                if (!currentPartnership.commentaryBallByBallId || (+currentPartnership.commentaryBallByBallId === 0))
                    setCurrentPartnership({ ...currentPartnership, "commentaryBallByBallId": commentartBallByBallIdToUpdate })
                setBallHistory([].concat(ballHistory || [], [commentaryDataToUpdate.commentaryBallByBallDetails]))
                setCurrentBall(commentaryDataToUpdate.commentaryBallByBallDetails)
                //checkForOverSwitch(_currentOver?.ballCount || currentOver?.ballCount)
                // handleCommentaryConsole(_currentOver, currentOver);
                // console.log(`Temporary _over : ${_currentOver?.over}, _ballCount: ${_currentOver?.ballCount}, _teamScore: ${_currentOver?.teamScore} & permanent over : ${currentOver?.over}, ballCount: ${currentOver?.ballCount}, teamScore: ${currentOver?.teamScore}`);
            } else if (
                currentBall.commentaryBallByBallId && commentaryDataToUpdate.commentaryBallByBallDetails
                && isEqual(currentBall.commentaryBallByBallId, commentaryDataToUpdate.commentaryBallByBallDetails?.commentaryBallByBallId)
                && !isEqual(currentBall, commentaryDataToUpdate.commentaryBallByBallDetails)) {
                setBallHistory([].concat((ballHistory.slice(0, -1) || []), [commentaryDataToUpdate.commentaryBallByBallDetails]))
            }
            const partnershipFromApi = commentaryDataToUpdate?.commentaryPartnershipDetails
            if (
                (isEmpty(currentPartnership) || (!currentPartnership?.commentaryPartnershipId && (+currentPartnership?.commentaryPartnershipId === 0)))
                &&
                (!isEmpty(partnershipFromApi) || (partnershipFromApi?.commentaryPartnershipId && (+partnershipFromApi?.commentaryPartnershipId !== 0)))) {
                const newPartnership = {
                    ...commentaryDataToUpdate.commentaryPartnershipDetails,
                    "commentaryBallByBallId": (commentartBallByBallIdToUpdate || currentBall.commentaryBallByBallId),
                    isActive: true,
                }
                setCurrentPartnership(newPartnership)
                setPartnershipHistory([].concat(partnershipHistory || [], [newPartnership]))
            }
            // Update Current Wicket on Wicket change
            if (!isEmpty(commentaryDataToUpdate.commentaryWicketDetails) && !currentWicket?.commentaryWicketId) {
                setWicketHistory([].concat(wicketHistory || [], [commentaryDataToUpdate.commentaryWicketDetails]))
                setCurrentWicket(commentaryDataToUpdate.commentaryWicketDetails)
            }
            // }
            updateTempToMain()
            setPlayerUpdateList(undefined)
            checkInningsSwitch(RUN)
            dispatch(clearAddCommentaryScreenData())
        }
    }, [commentaryDataToUpdate])
    useEffect(() => {
        if (!onPitchPlayers[ON_STRIKE] || !onPitchPlayers[NON_STRIKE] || !onPitchPlayers[CURRENT_BOWLER]) {
            setSelectMissingPlayer(true)
        } else if (selectMissingPlayer) setSelectMissingPlayer(false)
    }, [onPitchPlayers])
    useEffect(() => {
        if (matchTypeDetails?.isAutoChangeStriker
            && !changePlayerList
            && (ballCountForStrike > matchTypeDetails?.autoChangeStrikerAfterBall)
            && !isMatchCompleted) {
            changeStrike()
            setBallCountForStrike(1)
        }
    }, [ballCountForStrike, changePlayerList])
    useEffect(() => {
        if (currentOver.overId) {
            let getCurrentOverToBallStatus = getBallsForAllOver(ballHistory)
            const overToCheckFor = currentOver.currentInnings + STRING_SEPERATOR + teams[BATTING_TEAM].teamId + STRING_SEPERATOR + (+currentOver.over + 1)
            if (!getCurrentOverToBallStatus[overToCheckFor]) getCurrentOverToBallStatus = { [overToCheckFor]: [], ...getCurrentOverToBallStatus }
            setOverBallByBallDisplay(getCurrentOverToBallStatus)
        }
    }, [currentOver, ballHistory])
    useEffect(() => { if (error) setRetryModel(error) }, [error])

    const handleWheelShowToggle = async (value) => {
        await axiosInstance
            .post(`/admin/commentary/upIsWheelShow`, {
                commentaryId: commentaryDetails.commentaryId,
                isWheelShow: value,
            })
            .then((response) => {
                setIsWheelShow(value);
                dispatch(
                    updateToastData({
                        data: response?.message,
                        title: response?.title,
                        type: SUCCESS,
                    })
                );
            })
            .catch((error) => {
                dispatch(
                    updateToastData({
                        data: error?.message,
                        title: error?.title,
                        type: ERROR,
                    })
                );
            });
    };

    const handleShotTypeToggle = async (value) => {
        await axiosInstance
            .post(`/admin/commentary/upShotType`, {
                commentaryId: cricketFieldData?.commentaryId,
                shotType: value,
            })
            .then((response) => {
                setIsShotType(value);
                dispatch(
                    updateToastData({
                        data: response?.message,
                        title: response?.title,
                        type: SUCCESS,
                    })
                );
            })
            .catch((error) => {
                dispatch(
                    updateToastData({
                        data: error?.message,
                        title: error?.title,
                        type: ERROR,
                    })
                );
            });
    };

    console.log("showWicketModal", showWicketModal)

    return <>
        {/* <CommentaryScreen */}
        <NewCommentaryScreen
            refId={props.refId}
            commentaryId={commentaryDetails?.commentaryId}
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
                setBallStatus(BALL_START_STATUS);
                dispatch(updateCommentaryDisplayStatus({
                    "commentaryId": commentaryDetails.commentaryId,
                    "displayStatus": displayStatus,
                    "commentaryPlayerId": onPitchPlayers[ON_STRIKE].commentaryPlayerId,
                }))
            }}
            handleRetiredHurt={() => setShowRretiredHurt(true)}
            overBalls={overBallByBallDisplay}
            overHistory={overHistory}
            currentOver={currentOver}
            players={players}
            showPaneltyRuns={setIsPaneltyPopup}
            target={target}
            partnerships={[...(partnershipHistory?.slice(0, -1) || []), currentPartnership]}
            anyPopup={props.statusPopup || inningsChangePopup || extrasType || showChangeOverModal || inningsChangePopup || showWicketModal || showUpdateInnings
                || superOverModal || showRretiredHurt || isPaneltyPopup
                || props.isDataLoading || isCommentaryBallLoading || selectMissingPlayer
                || undoInningsPopup || completeMatchModal || winnerAnnouncement || isChangeBowler.isChangePopup || (changePlayerList ? true : false)}
            handleWheelShowToggle={handleWheelShowToggle}
            isWheelShow={isWheelShow}
            showWicketModal={showWicketModal}
            showChangeOverModal={showChangeOverModal && !changePlayerList}
            // wicket control
            // toggle={() => {
            //     setExtrasType(undefined)
            // }}
            // onSubmit={handleWicket}
            // bowlingTeam={players[BOWLING_TEAM]}
            // bowlingTeamDetails={teams[BOWLING_TEAM]}
            extraType={extrasType}
            {...(showWicketModal && {
                isOpen: showWicketModal,
                toggle: () => {
                    setShowWicketModal(undefined);
                    setExtrasType(undefined);
                },
                onSubmit: handleWicket,
                bowlingTeam: players[BOWLING_TEAM],
                bowlingTeamDetails: teams[BOWLING_TEAM],
            })}
            {...(extrasType && {
                extrasTypeIsOpen: extrasType,
                extrasTypeToggle: () => {
                    setExtrasType(undefined)
                },
                updateExtrasExtrasType: onExtrasChange
            })}
            // RetiredHurt
            // revertModal
            // {...(completeMatchModal && {
            //     revertModalisOpen:completeMatchModal,
            //     revertModaltoggle:() => { setCompleteMatchModal(undefined) },
            //     revertModalonNoClick:() => { setCompleteMatchModal(undefined) },
            //     revertModalonYesClick:() => completeMatch()
            // })}
            // RetiredHurt
            {...(showRretiredHurt && {
                retiredHurtisOpen: showRretiredHurt,
                retiredHurttoggle:() => setShowRretiredHurt(false),
                retiredHurtonsubmit:onRetiredHurtClick,
                onPitchplayers:onPitchPlayers,
                retiredHurtplayerList: players[BATTING_TEAM]?.filter((player) => (player.isPlay === null && player.isBatterOut !== true)),
                allBattingPlayers: players[BATTING_TEAM]
            })}

            // change Innings
            {...(inningsChangePopup && {
                inningsChangeisOpen:inningsChangePopup,
                inningsChangetoggle:() => { setShowInningsChangePopup(undefined) },
                inningsChangeNoClick:() => { setShowInningsChangePopup(undefined) },
                inningsChangeYesClick:() => onInningsChange()
            })}

            // PenaltyModal
            {...(isPaneltyPopup && {
                PenaltyToggle : () => { setIsPaneltyPopup(null)},
                PenaltyIsOpen : true,
                PenaltySelectedPenalty:(selectedPenalty) => {
                    updatePanelty(selectedPenalty)
                    setIsPaneltyPopup(null)
                }
            })}


            {...((showChangeOverModal && !changePlayerList) && {
                isOpen:{showChangeOverModal},
                toggle:() => { setShowChangeOverModal(undefined) },
                onNoClick:() => { setShowChangeOverModal(undefined) },
                onYesClick:() => {
                    setIsBowlerrChange(true)
                    setShowChangeOverModal(undefined);
                    setChangeOverOnPopupClick(true)
                },
                overBalls:overBallByBallDisplay,
                currentOver:currentOver,
                battingTeam:teams?.[BATTING_TEAM] || {},
                bowlerName:getPlayerNameById(players, currentOver?.bowlerId, false),
                onPitchPlayers:onPitchPlayers,
            })}

            isSelectPlayerModalOpen={!(isCommentaryBallLoading || inningsChangePopup || superOverModal || showRretiredHurt || isPaneltyPopup || props.isDataLoading ||
                winnerAnnouncement || showUpdateInnings || completeMatchModal || superOverModal || showCricketFieldModal) && !!changePlayerList}
            selectPlayerModalProps={{
                isOpen: !!changePlayerList,
                toggle: isWicketChange ? false : () => {
                    setChangePlayerList(undefined);
                    setIsSwapPlayer(undefined);
                    setOverPopUpForBowler(undefined);
                    setIsChangeBowler({ isChange: null, isChangePopup: null, popupOption: null });
                },
                overPopUpForBowler,
                isBowler: isChangeBowler.isChange || isBowlerrChange,
                playerList: changePlayerList,
                selectPlayer: (newPlayerId) => {
                    setOverPopUpForBowler(undefined);
                    setIsBowlerrChange(undefined);
                    if (isSwapPlayer) {
                        swapPlayer(newPlayerId);
                    } else if (isChangeBowler.isChange) {
                        onBowlerChange(newPlayerId);
                    } else {
                        onPlayerChange(newPlayerId);
                    }
                }
            }}
        />
        
        {/* <CommentaryScreen
            commentaryId={commentaryDetails?.commentaryId}
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
                setBallStatus("ballstart");
                dispatch(updateCommentaryDisplayStatus({
                    "commentaryId": commentaryDetails.commentaryId,
                    "displayStatus": displayStatus,
                    "commentaryPlayerId": onPitchPlayers[ON_STRIKE].commentaryPlayerId,
                }))
            }}
            handleRetiredHurt={() => setShowRretiredHurt(true)}
            overBalls={overBallByBallDisplay}
            overHistory={overHistory}
            currentOver={currentOver}
            players={players}
            showPaneltyRuns={setIsPaneltyPopup}
            target={target}
            partnerships={[...(partnershipHistory?.slice(0, -1) || []), currentPartnership]}
            anyPopup={props.statusPopup || inningsChangePopup || extrasType || showChangeOverModal || inningsChangePopup || showWicketModal || showUpdateInnings
                || superOverModal || showRretiredHurt || isPaneltyPopup
                || props.isDataLoading || isCommentaryBallLoading || selectMissingPlayer
                || undoInningsPopup || completeMatchModal || winnerAnnouncement || isChangeBowler.isChangePopup || (changePlayerList ? true : false)}
            handleWheelShowToggle={handleWheelShowToggle}
            isWheelShow={isWheelShow}
        /> */}
        {!(isCommentaryBallLoading || inningsChangePopup || superOverModal || showRretiredHurt || isPaneltyPopup || props.isDataLoading ||
            winnerAnnouncement || showUpdateInnings || completeMatchModal || superOverModal || showCricketFieldModal) &&
            <SelectPlayerModal isOpen={changePlayerList ? true : false}
                toggle={isWicketChange ? false : () => {
                    setChangePlayerList(undefined)
                    setIsSwapPlayer(undefined)
                    setOverPopUpForBowler(undefined)
                    setIsChangeBowler({ isChange: null, isChangePopup: null, popupOption: null })
                }}
                overPopUpForBowler={overPopUpForBowler}
                isBowler={(isChangeBowler.isChange || isBowlerrChange) ? true : false}
                playerList={changePlayerList}
                selectPlayer={(newPlayerId) => {
                    if (isSwapPlayer) { setOverPopUpForBowler(undefined); setIsBowlerrChange(undefined); swapPlayer(newPlayerId) }
                    else if (isChangeBowler.isChange) { setOverPopUpForBowler(undefined); setIsBowlerrChange(undefined); onBowlerChange(newPlayerId) }
                    else {
                        setOverPopUpForBowler(undefined)
                        setIsBowlerrChange(undefined)
                        onPlayerChange(newPlayerId)
                    }
                }}
            />}
        {/* {extrasType && <ExtrasModal
            isOpen={true}
            toggle={() => { setExtrasType(undefined) }}
            extraType={extrasType}
            updateExtras={onExtrasChange} />} */}
        {/* {(showChangeOverModal && !changePlayerList) && <ChangeOverModal
            isOpen={showChangeOverModal}
            toggle={() => { setShowChangeOverModal(undefined) }}
            onNoClick={() => { setShowChangeOverModal(undefined) }}
            onYesClick={() => {
                setIsBowlerrChange(true)
                setShowChangeOverModal(undefined);
                setChangeOverOnPopupClick(true)
            }}
            overBalls={overBallByBallDisplay}
            currentOver={currentOver}
            battingTeam={teams?.[BATTING_TEAM] || {}}
            bowlerName={getPlayerNameById(players, currentOver?.bowlerId, false)}
            onPitchPlayers={onPitchPlayers}
        />} */}
        {/* {inningsChangePopup && <ChangeInningsModal
            isOpen={inningsChangePopup}
            toggle={() => { setShowInningsChangePopup(undefined) }}
            onNoClick={() => { setShowInningsChangePopup(undefined) }}
            onYesClick={onInningsChange} />} */}
        {/* {showWicketModal &&
            <WicketModal
                isOpen={showWicketModal}
                toggle={() => {
                    setShowWicketModal(undefined)
                    setExtrasType(undefined)
                }}
                onSubmit={handleWicket}
                bowlingTeam={players[BOWLING_TEAM]}
                bowlingTeamDetails={teams[BOWLING_TEAM]}
                onPitchPlayers={onPitchPlayers}
                extraType={extrasType}
            />} */}
        {showUpdateInnings && <UpdateInningsModal
            isOpen={showUpdateInnings}
            toggle={() => { setShowUpdateInnings(undefined) }}
            onsubmit={handleInningsUpdate}
            currentInningTeams={propsData.commentaryData?.commentaryTeams?.filter(team => team.currentInnings === (commentaryDetails.currentInnings + 1))}
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
            onYesClick={() => completeMatch()}
        />}
        {winnerAnnouncement && <WinnerModal
            isOpen={winnerAnnouncement ? true : false}
            winnerAnnouncement={winnerAnnouncement}
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
        {selectMissingPlayer && !(changePlayerList || superOverModal || winnerAnnouncement) &&
            <OnPitchPlayerModal
                onPitchPlayers={onPitchPlayers}
                players={players}
                updatePlayerOnParent={handleMissingPlayerChange}
                toggle={() => { setIsBowlerrChange(undefined); setSelectMissingPlayer(false) }}
            />
        }
        {undoErrorModal && <UndoErrorModal
            toggle={() => { setUndoErrorModal(null) }}
            undoError={undoErrorModal}
        />}
        {/* {isPaneltyPopup && <PenaltyModal
            toggle={() => { setIsPaneltyPopup(null) }}
            isOpen={true}
            selectedPenalty={(selectedPenalty) => {
                updatePanelty(selectedPenalty)
                setIsPaneltyPopup(null)
            }}
        />} */}
        {/* {showRretiredHurt && <RetiredHurtModal
            toggle={() => setShowRretiredHurt(false)}
            onsubmit={onRetiredHurtClick}
            onPitchplayers={onPitchPlayers}
            playerList={players[BATTING_TEAM]?.filter((player) => (player.isPlay === null && player.isBatterOut !== true))}
            allBattingPlayers={players[BATTING_TEAM]}
        />} */}
        {superOverModal ?
            <SuperOverModal
                toggle={() => {
                    setSuperOverModal(false)
                }}
                onSuperOverClick={handleSuperOver}
                onResultClick={() => {
                    setSuperOverModal(false)
                    checkWinner()
                }}
                currentInningTeams={Object.values(teams || {})}
            />
            : null}
        {retryModel && <RetryModel errorMsg={retryModel} />}
        {showCricketFieldModal && (
            <CricketFieldModal
                cricketFieldData={cricketFieldData}
                shotTypes={propsData?.commentaryData?.shotTypes}
                isShotType={isShotType}
                handleShotTypeToggle={handleShotTypeToggle}
                isOpen={showCricketFieldModal}
                toggle={() => {
                    setShowCricketFieldModal(undefined);
                    setIsWheelShowComplete(true);
                }}
            />
        )}
    </>
}

export default Commentary
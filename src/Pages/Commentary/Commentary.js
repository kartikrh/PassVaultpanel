import { useEffect, useState } from "react"
import { CommentaryScreen } from "./Commentary.jsx"
import _, { isEmpty, isEqual } from "lodash"
import { ALL, BALL_BYE, BALL_LEG_BYE, BALL_TYPE_BYE, BALL_TYPE_LEG_BYE, BALL_TYPE_NO_BALL, BALL_TYPE_NO_BALL_BYE, BALL_TYPE_NO_BALL_LEG_BYE, BALL_TYPE_OVER_COMPLETE, BALL_TYPE_REGULAR, BALL_TYPE_WIDE, BALL_WIDE, BAT, BATTING_TEAM, BOWLING_TEAM, CHANGE_BOWLER, CURRENT_BOWLER, NON_STRIKE, NO_BALL, NO_BALL_BYE, NO_BALL_LEG_BYE, ON_STRIKE, OVER, RETIRED_OUT, RUN, SWITCH_BOWLER, WICKET } from "./CommentartConst.js"
import SelectPlayerModal from "./CommentaryModels/SelectPlayerModal.jsx"
import ExtrasModal from "./CommentaryModels/ExtrasModal.jsx"
import ChangeOverModal from "./CommentaryModels/ChangeOverModal.jsx"
import WicketModal from "./CommentaryModels/WicketModal.jsx"
import { generateBall, generateDisplayStatus, generateOver, generatePartnership, generateWicket, getEconomyRate, getRequiredRunRate, getRunRate, getStrikeRate } from "./functions.js"
import { useDispatch, useSelector } from "react-redux"
import { addCommentaryScreenData, changeBowlerFromCommentary, clearAddCommentaryScreenData, clearUndoFlag, undoBallFromCommentary, undoOverFromCommentary } from "../../Features/Tabs/commentarySlice.js"
import ChangeInningsModal from "./CommentaryModels/ChangeInningsModal.jsx"
import { useNavigate } from "react-router-dom"
import UpdateInningsModal from "./CommentaryModels/UpdateInningsModal.jsx"
import { compareNumStringValues } from "../../components/Common/Reusables/reusableMethods.js"
import UpdateStrikeModal from "./CommentaryModels/UpdateStrikerModal.jsx"
import WinnerModal from "./CommentaryModels/WinnerModal.jsx"
import UndoInnnigsModal from "./CommentaryModels/UndoInningsModal.jsx"
import CompleteCurrentMatchModal from "./CommentaryModels/CompleteMatchModal.jsx"
import ChangeBowlerModal from "./CommentaryModels/ChangeBowlerModal.jsx"

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
    const [isWicketChange, setIsWicketChange] = useState(undefined)
    const [playerUpdateList, setPlayerUpdateList] = useState(undefined)
    const [inningsChangePopup, setShowInningsChangePopup] = useState(undefined)
    const [redirectOnScreenChange, setRedirectOnScreenChange] = useState(undefined)
    const [showUpdateInnings, setShowUpdateInnings] = useState(undefined)
    const [winnerAnnouncement, setWinnerAnnouncement] = useState(undefined)
    const [showSwitchBatterModal, setShowSwitchBatterModal] = useState(undefined)
    const [isUndoBall, setIsUndoBall] = useState(undefined)
    const [undoInningsPopup, setUndoInningsPopup] = useState(undefined)
    const [updateRunsFromWicket, setUpdateRunFromWicket] = useState(undefined)
    const [isSwapPlayer, setIsSwapPlayer] = useState(undefined)
    const [isChangeBowler, setIsChangeBowler] = useState({})
    const [completeMatchModal, setCompleteMatchModal] = useState(undefined)
    const matchTypeDetails = props.data.matchTypeData
    const commentaryDetails = props.data.commentaryData.commentaryDetails
    const { commentaryDataToUpdate, isCommentaryDataUpdated, isUndoCompleted, isCommentaryBallLoading } = useSelector(state => state.tabsData.commentary);
    const statusList = props.data.commentaryData.commentaryDisplayStatus
    let navigate = useNavigate();

    // useEffect(() => {
    //     // console.log(commentaryDetails, matchTypeDetails)
    console.log({ currentBall, currentOver, currentPartnership, currentWicket, onPitchPlayers, ballHistory })
    //     // console.log(currentOver, currentBall)
    //     // console.log(ballHistory, overHistory, wicketHistory, partnershipHistory)
    //     // console.log(onPitchPlayers, teams)
    //     // console.log(onPitchPlayers, players?.[BATTING_TEAM], players?.[BOWLING_TEAM])
    // })
    const checkForOverSwitch = (ballcount) => {
        if ((ballcount || currentOver.ballCount) >= (matchTypeDetails.ballsPerOver)) setShowChangeOverModal(true)
    }
    const checkInningsSwitch = (checkFor) => {
        const maxNoOfWicket = matchTypeDetails.noOfPlayer - (matchTypeDetails.isLastManStand ? 0 : 1);
        const isOverLimitReached = () => {
            return matchTypeDetails.isLimitedOvers &&
                (Math.ceil(+currentOver.over || 0) + 1) >= matchTypeDetails.oversPerInings;
        };

        const isWicketLimitReached = () => {
            return teams?.[BATTING_TEAM]?.teamWicket > maxNoOfWicket - 2;
        };

        const isRunTargetAchieved = () => {
            return isLastInnigs && commentaryDetails.target && commentaryDetails.target !== 0 &
                teams?.[BATTING_TEAM]?.teamScore >= commentaryDetails.target;
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
        // console.log(checkFor)
        if (conditionsToCheck.some(condition => condition)) {
            if (teams?.[BOWLING_TEAM].isBattingComplete && isLastInnigs) setCompleteMatchModal(true)
            else setShowInningsChangePopup(true);
        }
    }
    const checkWinner = () => {
        const isMatchTie = teams?.[BATTING_TEAM]?.teamScore === commentaryDetails.target - 1
        const isBattingTeamWon = teams?.[BATTING_TEAM]?.teamScore >= commentaryDetails.target
        const WINNING_TEAM = isBattingTeamWon ? BATTING_TEAM : BOWLING_TEAM
        const WINNING_MESSAGE = isMatchTie ? `Match Between ${teams?.[BATTING_TEAM].teamName} and ${teams?.[BOWLING_TEAM].teamName} is Tied.`
            : "Match won by " + teams?.[WINNING_TEAM].teamName
        const teamUpdates = [
            { ...teams?.[BATTING_TEAM], isBattingComplete: true, isWin: isBattingTeamWon },
            { ...teams?.[BOWLING_TEAM], isWin: !isBattingTeamWon }]
        const commentaryUpdates = {
            "commentaryStatus": 4,
            "winnerId": teams?.[WINNING_TEAM].teamId,
            "winnerName": teams?.[WINNING_TEAM].teamName,
            "displayStatus": WINNING_MESSAGE
        }
        let objToSave = {
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
        dispatch(addCommentaryScreenData(objToSave))
        setShowInningsChangePopup(undefined)
        setCompleteMatchModal(undefined)
        setRedirectOnScreenChange(true)
        setWinnerAnnouncement(WINNING_MESSAGE)
    }
    const onInningsChange = () => {
        let teamUpdates = undefined
        let commentaryUpdates = undefined
        if (teams[BOWLING_TEAM].isBattingComplete && !isLastInnigs) {
            setShowUpdateInnings(true)
        } else {
            teamUpdates = [
                { ...teams?.[BATTING_TEAM], isBattingComplete: true, teamStatus: 2 },
                { ...teams?.[BOWLING_TEAM], teamStatus: 1 }]
            commentaryUpdates = {
                "commentaryStatus": 2,
                "target": (teams[BATTING_TEAM]?.teamScore || 0) + 1,
                "displayStatus": "Batting for Current team Completed"
            }
            setRedirectOnScreenChange(true)
        }
        let objToSave = {
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
        dispatch(addCommentaryScreenData(objToSave))
        setShowInningsChangePopup(undefined)
    }
    const handleInningsUpdate = (battingTeamId) => {
        let updatedInningsTeam = [{ ...teams?.[BATTING_TEAM], isBattingComplete: true }]
        props.data.commentaryData?.commentaryTeams?.forEach(team => {
            if (team.currentInnings === (commentaryDetails.currentInnings + 1)) {
                updatedInningsTeam.push({ ...team, teamStatus: team.teamId === battingTeamId ? 1 : 2 })
            }
        });
        let objToSave = {
            "commentaryDetails": {
                ...commentaryDetails,
                currentInnings: commentaryDetails.currentInnings + 1,
                commentaryStatus: 2,
                "displayStatus": "Innings Changed"
            },
            "commentaryTeams": updatedInningsTeam,
            "commentaryPlayers": [
                { ...onPitchPlayers[ON_STRIKE], isPlay: null, onStrike: null },
                { ...onPitchPlayers[NON_STRIKE], isPlay: null, },
                { ...onPitchPlayers[CURRENT_BOWLER], isPlay: null, }
            ],
        }
        dispatch(addCommentaryScreenData(objToSave))
        setShowUpdateInnings(undefined)
        setRedirectOnScreenChange(true)
    }
    useEffect(() => {
        if (updateRunsFromWicket) {
            updateRuns(updateRunsFromWicket)
            setUpdateRunFromWicket(undefined)
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
                // console.log(currentOver)
                dispatch(undoOverFromCommentary({ "commentaryOverId": currentOver.overId }))
                const updatedOverHistory = overHistory.slice(0, -1)
                setOverHistory(updatedOverHistory)
                setCurrentOver(updatedOverHistory[updatedOverHistory.length - 1])
            }
            const updatedBallHistoryList = ballHistory.slice(0, -1)
            dispatch(clearUndoFlag())
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
            checkInningsSwitch(OVER)
            changePlayer(CURRENT_BOWLER)
            changeOver()
            dispatch(addCommentaryScreenData({
                "commentaryDetails": {
                    ...commentaryDetails,
                    "displayStatus": "Over Completed"
                }, "commentaryOvers": { ...currentOver, "isComplete": true },
            }))
            setChangeOverOnPopupClick(undefined)
        }
    }, [changeOverOnPopupClick])
    useEffect(() => {
        if (saveToDb) {
            // setting commentary ball by ball id to 0 in order to make sure that every time new ball is created
            let newCurrentBall = undefined
            if (isUndoBall) newCurrentBall = currentBall
            else newCurrentBall = { ...currentBall, commentaryBallByBallId: "0" }
            const generatedBallByBall = generateBall({ currentBall: newCurrentBall, commentaryDetails, currentOver, onPitchPlayers, teams })
            const objToSave = {
                "commentaryBallByBall": generatedBallByBall,
                "commentaryDetails": {
                    ...commentaryDetails,
                    "displayStatus": generateDisplayStatus({ currentBall: generatedBallByBall })
                },
                "commentaryOvers": currentOver,
                "commentaryPlayers": [].concat(playerUpdateList, [onPitchPlayers[CURRENT_BOWLER], onPitchPlayers[ON_STRIKE], onPitchPlayers[NON_STRIKE]]).filter(x => x),
                "commentaryPartnership": generatePartnership({ commentaryDetails, currentBall: {}, currentPartnership, teams }),
                "commentaryTeams": [teams[BATTING_TEAM]],
            }
            dispatch(addCommentaryScreenData(objToSave))
            setSaveToDb(false)
            checkInningsSwitch(RUN)
        }
    }, [saveToDb])
    useEffect(() => {
        if (isOverChange) {
            const objToSave = {
                "commentaryDetails": { ...commentaryDetails, "displayStatus": `${onPitchPlayers[CURRENT_BOWLER]?.playerName} with new Over` },
                "commentaryOvers": generateOver({ commentaryDetails, onPitchPlayers, teams }),
                "commentaryPlayers": [].concat([onPitchPlayers[CURRENT_BOWLER], onPitchPlayers[ON_STRIKE], onPitchPlayers[NON_STRIKE]], playerUpdateList).filter(x => x),
                "commentaryTeams": [teams[BATTING_TEAM]],
            }
            dispatch(addCommentaryScreenData(objToSave))
            setIsOverChange(undefined)
        }
    }, [isOverChange])
    useEffect(() => {
        if (props.data) {
            const currentInningsTeams = {}
            const battingTeam = []
            const bowlingTeam = []
            const onPitchPlayers = {}
            let currentPartnership = {}
            let currentOver = 0
            props.data.commentaryData.commentaryTeams.forEach(teamDetails => {
                if (isEqual(teamDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = teamDetails.teamStatus === BAT
                    currentInningsTeams[isBattingTeam ? BATTING_TEAM : BOWLING_TEAM] = teamDetails
                    currentOver = isBattingTeam ? Math.floor(teamDetails?.teamOver) : currentOver
                }
            });
            props.data.commentaryData.commentaryPlayers.forEach(playerDetails => {
                if (isEqual(playerDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = playerDetails.teamId === currentInningsTeams[BATTING_TEAM].teamId
                    // If player is from batting team, add them to the batting object list
                    if (isBattingTeam) {
                        if (playerDetails.isPlay === true)
                            onPitchPlayers[playerDetails.onStrike === true ? ON_STRIKE : NON_STRIKE] = playerDetails
                        battingTeam.push(playerDetails)
                    }
                    // else add them to the bowling object list
                    else {
                        if (playerDetails.isPlay === true)
                            onPitchPlayers[CURRENT_BOWLER] = playerDetails
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
                if (isEqual(+overDetails.over, +currentOver)) {
                    currentOver = overDetails
                }
            });
            const partnershipDetails = {
                "batter1Id": onPitchPlayers[ON_STRIKE]?.commentaryPlayerId,
                "batter1Name": onPitchPlayers[ON_STRIKE]?.playerName,
                "batter2Id": onPitchPlayers[NON_STRIKE]?.commentaryPlayerId,
                "batter2Name": onPitchPlayers[NON_STRIKE]?.playerName,
            }
            const ballByBallHistoryData = props.data.commentaryData.commentaryBallByBall
            // if (typeof currentOver === "object" && currentOver.isComplete) changePlayer(CURRENT_BOWLER)
            setTeams(currentInningsTeams)
            setPlayers({ [BATTING_TEAM]: battingTeam, [BOWLING_TEAM]: bowlingTeam })
            setOnPitchPlayers(onPitchPlayers)
            setBallHistory(ballByBallHistoryData || [])
            setOverHistory(props.data.commentaryData.commentaryOvers || [])
            setPartnershipHistory(props.data.commentaryData.commentaryPartnership)
            setWicketHistory(props.data.commentaryData.commentaryWicket)
            setCurrentPartnership({ ...partnershipDetails, ...currentPartnership })
            setCurrentOver(currentOver)
            setCurrentBall(_.isArray(ballByBallHistoryData) ? ballByBallHistoryData[ballByBallHistoryData.length - 1] : undefined)
            // checkInningsSwitch(ALL)
            setIsLastInnings(commentaryDetails.currentInnings >= matchTypeDetails.noOfIningsPerSide)
            if (isEmpty(currentPartnership)) {
                dispatch(addCommentaryScreenData({ "commentaryDetails": { ...commentaryDetails, "displayStatus": "" }, "commentaryPartnership": generatePartnership({ commentaryDetails, currentBall: {}, currentPartnership: partnershipDetails, teams: currentInningsTeams }), }))
            }
        }
    }, [])
    useEffect(() => {
        if (!isEmpty(commentaryDataToUpdate)) {
            if (isUndoBall) dispatch(undoBallFromCommentary({ "commentaryBallByBallId": currentBall.commentaryBallByBallId }))
            else {
                // Update Over history on over change
                if (!isEmpty(commentaryDataToUpdate.overdetails) && !isEqual(commentaryDataToUpdate.overdetails.overId, currentOver.overId)) {
                    const updatedOverHistory = overHistory.slice(0, -1)
                    setOverHistory([].concat(updatedOverHistory || [], [currentOver, commentaryDataToUpdate.overdetails]))
                    const generatedBall = generateBall({ currentBall: { commentaryBallByBallId: "0", }, commentaryDetails, currentOver: { overId: commentaryDataToUpdate.overdetails.overId }, onPitchPlayers, teams })
                    dispatch(addCommentaryScreenData({ "commentaryDetails": { ...commentaryDetails, "displayStatus": generateDisplayStatus({ currentBall: generatedBall }) }, "commentaryBallByBall": generatedBall, }))
                    setCurrentOver(commentaryDataToUpdate.overdetails)
                }
                // Update ball history on ball change
                if (!isEmpty(commentaryDataToUpdate.commentaryBallByBallDetails) && !compareNumStringValues(currentBall?.commentaryBallByBallId, commentaryDataToUpdate.commentaryBallByBallDetails.commentaryBallByBallId)) {
                    setBallHistory([].concat(ballHistory || [], [commentaryDataToUpdate.commentaryBallByBallDetails]))
                    setCurrentBall(commentaryDataToUpdate.commentaryBallByBallDetails)
                    if (isWicketChange) callWicketToDB(commentaryDataToUpdate.commentaryBallByBallDetails.commentaryBallByBallId)
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
            }
            setPlayerUpdateList(undefined)
            dispatch(clearAddCommentaryScreenData())
        }
    }, [commentaryDataToUpdate])
    const callWicketToDB = (currentBallByBallID) => {
        const newCurrentBall = currentBall
        newCurrentBall["commentaryBallByBallId"] = currentBallByBallID
        const updatedPartnership = generatePartnership({ commentaryDetails, currentBall: newCurrentBall, currentPartnership, teams })
        const updatedBallByBall = generateBall({ currentBall: newCurrentBall, commentaryDetails, currentOver, onPitchPlayers, teams })
        const updatedWicket = generateWicket({ commentaryDetails, currentOver, teams, currentWicket, currentBall: newCurrentBall })
        const objToSave = {
            "commentaryDetails": {
                ...commentaryDetails,
                "displayStatus": generateDisplayStatus({ currentBall: updatedBallByBall })
            },
            "commentaryPartnership": updatedPartnership,
            "commentaryBallByBall": updatedBallByBall,
            "commentaryWicket": updatedWicket,
            "commentaryPlayers": Object.values(onPitchPlayers),
        }
        dispatch(addCommentaryScreenData(objToSave))
        // update here
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

        const updatedBowlerOver = ((+bowler.bowlerOver || 0) + 0.1).toFixed(1)
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
        updateBattingTeam["teamOver"] =
            ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1)
        updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, currentOver, matchTypeDetails.ballsPerOver)
        if (matchTypeDetails.isLimitedOvers && commentaryDetails.target) {
            updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                currentOver, matchTypeDetails.ballsPerOver, commentaryDetails.target || 0, matchTypeDetails.oversPerInings)
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
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
            updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, currentOver, matchTypeDetails.ballsPerOver)
            if (matchTypeDetails.isLimitedOvers && commentaryDetails.target) {
                updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                    currentOver, matchTypeDetails.ballsPerOver, commentaryDetails.target || 0, matchTypeDetails.oversPerInings)
            }
            updateOver["totalWideBall"] = (currentOver.totalWideBall || 0) + 1
            updateOver["totalWideRun"] = (currentOver.totalWideRun || 0) + runToUpdate
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runToUpdate
            updateBall["ballIsCount"] = false
            updateBall["ballRun"] = runToUpdate
            updateBall["ballExtraRun"] = runToUpdate
            updateBall["ballType"] = BALL_TYPE_WIDE
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runToUpdate
            updatePartnership["extras"] = currentPartnership.extras + runToUpdate
        } else if (type === NO_BALL || type === NO_BALL_BYE || type === NO_BALL_LEG_BYE) {
            const runToUpdate = (+matchTypeDetails["valueOfNoBall"] || 0) + runs
            batter["batBall"] = (batter.batBall || 0) + 1
            batter["batsmanStrikeRate"] = getStrikeRate(batter.batRun, batter.batBall)
            updateBowler["bowlerNoBall"] = (bowler.bowlerNoBall || 0) + 1
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
            updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, currentOver, matchTypeDetails.ballsPerOver)
            if (matchTypeDetails.isLimitedOvers && commentaryDetails.target) {
                updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                    currentOver, matchTypeDetails.ballsPerOver, commentaryDetails.target || 0, matchTypeDetails.oversPerInings)
            }
            updateOver["totalNoball"] = (currentOver.totalNoball || 0) + 1
            updateOver["totalNoBallRun"] = (currentOver.totalNoBallRun || 0) + runToUpdate
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runToUpdate
            updateBall["ballIsCount"] = false
            if (type === NO_BALL) {
                updateBall["ballType"] = BALL_TYPE_NO_BALL
                batter["batRun"] = (batter.batRun || 0) + runs
                updateBall["ballRun"] = runs
                updateBall["ballExtraRun"] = (+matchTypeDetails["valueOfWideBall"] || 0)
                updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) + (+matchTypeDetails["valueOfNoBall"] || 0)
                updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + runToUpdate
            } else {
                updateBall["ballRun"] = runToUpdate
                updateBall["ballExtraRun"] = runToUpdate
                updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) + runToUpdate
                updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + (+matchTypeDetails["valueOfNoBall"] || 0)
                if (type === NO_BALL_BYE) updateBall["ballType"] = BALL_TYPE_NO_BALL_BYE
                else if (type === NO_BALL_LEG_BYE) updateBall["ballType"] = BALL_TYPE_NO_BALL_LEG_BYE
            }
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runToUpdate
            updatePartnership["extras"] = currentPartnership.extras + runToUpdate
            updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, bowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
        }
        else {
            updateBall["ballIsCount"] = true
            updateBowler["bowlerOver"] = updatedBowlerOver
            // updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + runs
            updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) + 1
            updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, updateBowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
            updateOver["ballCount"] = (currentOver.ballCount || 0) + 1
            batter["batBall"] = (batter.batBall || 0) + 1
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runs
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runs
            updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, currentOver, matchTypeDetails.ballsPerOver)
            if (matchTypeDetails.isLimitedOvers && commentaryDetails.target) {
                updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                    currentOver, matchTypeDetails.ballsPerOver, commentaryDetails.target || 0, matchTypeDetails.oversPerInings)
            }
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
            }
            else if (type === BALL_LEG_BYE) {
                updateBowler["bowlerLegByeBall"] = (bowler.bowlerLegByeBall || 0) + 1
                updateBowler["bowlerLegByeBallRun"] = (bowler.bowlerLegByeBallRun || 0) + runs
                updateOver["totalLegByesBall"] = (currentOver.totalLegByesBall || 0) + 1
                updateOver["totalLegByesRun"] = (currentOver.totalLegByesRun || 0) + runs
                updateBall["ballType"] = BALL_TYPE_LEG_BYE
            }
            checkForOverSwitch(updateOver.ballCount)
        }
        const isStrikeChange = runs % 2 !== 0
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
    const changeOver = () => {
        let updateBattingTeam = {}
        updateBattingTeam["teamOver"] =
            Math.ceil(+teams[BATTING_TEAM].teamOver || 0)
        setTeams({ ...teams, [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam } })
        const newOnStrikePlayer = { ...onPitchPlayers[NON_STRIKE], onStrike: true }
        const newNonStrikePlayer = { ...onPitchPlayers[ON_STRIKE], onStrike: false }
        setOnPitchPlayers(
            (prevValue) => {
                return { ...prevValue, [ON_STRIKE]: newOnStrikePlayer, [NON_STRIKE]: newNonStrikePlayer, }
            })
    }
    const handleWicket = (wicketData) => {
        if (!wicketData.isExtraWicket) setCurrentBall({})
        const ballToUpdateOnWicket = wicketData.isExtraWicket ? 0 : 1
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
        // updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + +wicketData.runs
        // updateBattingTeam["teamOver"] =
        //     ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1)
        updateBowler["bowlerTotalWicket"] = (onPitchPlayers[CURRENT_BOWLER].bowlerTotalWicket || 0) + 1
        updateBall["ballPlayerId"] = wicketPlayerDetails.commentaryPlayerId
        updateWicket["batterId"] = wicketPlayerDetails.commentaryPlayerId
        updateWicket["batterName"] = wicketPlayerDetails.playerName
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
        let newPlayer = undefined
        const playerToChangeId = onPitchPlayers[playerToChange]?.commentaryPlayerId
        setPlayers({
            ...players,
            [teamType]: players[teamType]?.map((player) => {
                if (isEqual(player.commentaryPlayerId, playerToChangeId)) {
                    const updatedPlayer = { ...onPitchPlayers[playerToChange], "isPlay": null, "onStrike": null }
                    if (playerToChange === CURRENT_BOWLER) {
                        updatedPlayer["bowlerOver"] = Math.ceil(+updatedPlayer.bowlerOver || 0)
                        updatedPlayer["bowlerMaidenOver"] = currentOver.totalRun < 1 ? 1 : 0
                    }
                    setPlayerUpdateList([].concat([updatedPlayer], playerUpdateList || []))
                    return updatedPlayer
                }
                if (isEqual(player.commentaryPlayerId, newPlayerId)) {
                    newPlayer = player
                    const updatedPlayer = { ...player, "isPlay": true, "onStrike": playerToChange === ON_STRIKE ? true : playerToChange === NON_STRIKE ? false : null }
                    newPlayer = updatedPlayer
                    // setPlayerUpdateList([].concat([updatedPlayer], playerUpdateList || []))
                    return updatedPlayer
                } return player
            })
        })
        const updatedOnPitchPlayer = {
            ...onPitchPlayers,
            [playerToChange]: newPlayer
        }
        setOnPitchPlayers(updatedOnPitchPlayer)
        if (playerToChange === CURRENT_BOWLER) setIsOverChange(true)
        if (isWicketChange) {
            const partnershipDetails = {
                "batter1Id": updatedOnPitchPlayer[ON_STRIKE]?.commentaryPlayerId,
                "batter1Name": updatedOnPitchPlayer[ON_STRIKE]?.playerName,
                "batter2Id": updatedOnPitchPlayer[NON_STRIKE]?.commentaryPlayerId,
                "batter2Name": updatedOnPitchPlayer[NON_STRIKE]?.playerName,
            }
            const updatedPartnership = generatePartnership({ commentaryDetails, currentBall: {}, currentPartnership: partnershipDetails, teams })
            const objToSave = {
                "commentaryPartnership": updatedPartnership,
                "commentaryDetails": commentaryDetails,
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
        // console.log(newPlayerId)
        const oldPlayer = onPitchPlayers[playerToChange]
        const teamType = playerToChange === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM
        let newPlayer = undefined
        players[teamType]?.forEach((player) => {
            if (isEqual(player.commentaryPlayerId, newPlayerId)) newPlayer = player
        })
        // console.log(newPlayer, oldPlayer)
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
            "commentaryDetails": {
                ...commentaryDetails,
                "displayStatus": "Batter Switched"
            },
            "commentaryPlayers": Object.values(updatedOnPitchPlayer),
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
        dispatch(addCommentaryScreenData({ "commentaryPlayers": [updatedPerviousBowler, updatedNewBowler], }))
        dispatch(changeBowlerFromCommentary(objForChangeBowler))
        setCurrentOver(UpdatedOver)
        setPlayers({ ...players, [BOWLING_TEAM]: updatedPlayerList })
        setOnPitchPlayers({ ...onPitchPlayers, [CURRENT_BOWLER]: updatedNewBowler })
        setIsChangeBowler({})
        setChangePlayerList(undefined)
        setPlayerToChange(undefined)
        setIsChangeBowler({ isChange: false, isChangePopup: false, updateAfterSave: true })
    }
    const onBowlerChange = (newPlayerId) => {
        if (isChangeBowler.popupOption === SWITCH_BOWLER) switchBowler(newPlayerId)
        else if (isChangeBowler.popupOption === CHANGE_BOWLER) console.log(newPlayerId)
    }
    const changeOnStrikePlayer = (commentaryPlayerId) => {
        const isPlayerOnNonstrike = compareNumStringValues(onPitchPlayers[NON_STRIKE].commentaryPlayerId, commentaryPlayerId)
        if (isPlayerOnNonstrike) {
            const updatedOnStrikePlayer = { ...onPitchPlayers[NON_STRIKE], onStrike: true }
            const updatedNonStrikePlayer = { ...onPitchPlayers[ON_STRIKE], onStrike: false }
            setOnPitchPlayers({ ...onPitchPlayers, [ON_STRIKE]: updatedOnStrikePlayer, [NON_STRIKE]: updatedNonStrikePlayer })
            const objToSave = {
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
        // console.log(currentBall.commentaryBallByBallId && (+currentBall.overCount === +teams[BATTING_TEAM].teamOver))
        // console.log(currentBall.commentaryBallByBallId, +currentBall.overCount, +teams[BATTING_TEAM].teamOver)
        // console.log(currentOver, currentBall)
        if (currentBall.commentaryBallByBallId && (+currentBall.overCount === +teams[BATTING_TEAM].teamOver)) {
            if (((currentOver.over || 0) === 0) && ((currentOver.ballCount || 0) === 0)
                && ((currentBall.ballRun || 0) === 0)) {
                setUndoInningsPopup(true)
            } else if ((currentBall.ballType === BALL_TYPE_OVER_COMPLETE)
                && (currentBall.currentOverBalls === 0) && (currentBall.ballRun === 0)) updateAfterOverUndo()
            else {
                const updateBattingTeam = {}
                let updateBowler = {}
                let undoType = RUN
                const updateOver = {}
                let playersOnPitch = onPitchPlayers
                if (currentBall.ballIsWicket) {
                    undoType = WICKET
                    updateOver["totalWicket"] = (currentOver.totalWicket || 0) - 1
                    updateBattingTeam["teamWicket"] = (teams[BATTING_TEAM].teamWicket || 0) - 1
                    updateBowler["bowlerTotalWicket"] = (onPitchPlayers[CURRENT_BOWLER].bowlerTotalWicket || 0) - 1
                    playersOnPitch = updatePlayerAfterUndoWicket()
                }
                const bowler = playersOnPitch[CURRENT_BOWLER]
                const type = currentBall.ballType
                const isOnStrikeSame = compareNumStringValues(playersOnPitch[ON_STRIKE].commentaryPlayerId, currentBall.batStrikeId)
                const batter = isOnStrikeSame ? playersOnPitch[ON_STRIKE] : playersOnPitch[NON_STRIKE]
                const run = currentBall.ballRun
                let updateBatter = {}
                const updatedBowlerOver = ((+bowler.bowlerOver || 0) - 0.1).toFixed(1)
                const updatePartnership = {}
                if (type === BALL_TYPE_REGULAR) {
                    updateBatter["batRun"] = (batter.batRun || 0) - run
                    updateBatter["batBall"] = (batter.batBall || 0) - currentBall.ballIsCount ? 1 : 0
                    updateBatter["batsmanStrikeRate"] = getStrikeRate(updateBatter.batRun, updateBatter.batBall)
                    updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) - 1
                    updateOver["ballCount"] = (currentOver.ballCount || 0) - 1
                    updatePartnership["totalBalls"] = (currentPartnership?.totalBalls || 0) - 1
                    updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) - run
                    updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, updateBowler.totalBalls, matchTypeDetails.ballsPerOver)
                    updateBowler["bowlerOver"] = updatedBowlerOver
                    updatePartnership["totalRuns"] = (currentPartnership.totalRuns || 0) - run
                    updateOver["totalRun"] = (currentOver.totalRun || 0) - run
                    updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - run
                    updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, currentOver, matchTypeDetails.ballsPerOver)
                    if (matchTypeDetails.isLimitedOvers && commentaryDetails.target) {
                        updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                            currentOver, matchTypeDetails.ballsPerOver, commentaryDetails.target || 0, matchTypeDetails.oversPerInings)
                    }
                    updateBattingTeam["teamOver"] =
                        ((+teams[BATTING_TEAM].teamOver || 0) - 0.1).toFixed(1)
                    if (run === 0) {
                        updateBatter["batDotBall"] = (batter.batDotBall || 0) - 1
                        updateOver["dotBall"] = (currentOver.dotBall || 0) - 1
                        updateBowler["bowlerDotBall"] = (bowler.bowlerDotBall || 0) - 1
                    } else if (run % 2 === 0) {
                        if (currentBall.ballFour === 1) {
                            updateBatter["batFour"] = (batter.batFour || 0) - 1
                            updateOver["totalFour"] = (currentOver.totalFour || 0) - 1
                            updateBowler["bowlerFour"] = (bowler.bowlerFour || 0) - 1

                        } else if (currentBall.ballSix === 1) {
                            updateBatter["batSix"] = (batter.batSix || 0) - 1
                            updateOver["totalSix"] = (currentOver.totalSix || 0) - 1
                            updateBowler["bowlerSix"] = (bowler.bowlerSix || 0) - 1
                        }
                    }
                    updateBatter = { ...playersOnPitch[isOnStrikeSame ? ON_STRIKE : NON_STRIKE], ...updateBatter, onStrike: isOnStrikeSame ? false : true }
                    updateBowler = { ...playersOnPitch[CURRENT_BOWLER], ...updateBowler }
                    const updateNonStriker = { ...playersOnPitch[isOnStrikeSame ? NON_STRIKE : ON_STRIKE], onStrike: isOnStrikeSame ? true : false }
                    setOnPitchPlayers({ [ON_STRIKE]: updateBatter, [NON_STRIKE]: updateNonStriker, [CURRENT_BOWLER]: updateBowler })
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
                    setCurrentPartnership((prevValue) => { return { ...prevValue, ...updatePartnership, } })
                    setTeams((prevData) => { return { ...prevData, [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam } } })
                    setCurrentOver((prevValue) => { return { ...prevValue, ...updateOver, } })
                } else {
                    if (type === BALL_TYPE_WIDE) {
                        updateBowler["bowlerWideBall"] = (bowler.bowlerWideBall || 0) - 1
                        updateBowler["bowlerWideBallRun"] = (bowler.bowlerWideBallRun || 0) - currentBall.ballRun
                        updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) - currentBall.ballRun
                        updateBowler["bowlerEconomy"] = getEconomyRate(updateBowler.bowlerRun, bowler.bowlerTotalBall, matchTypeDetails.ballsPerOver)
                        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - run
                        updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, currentOver, matchTypeDetails.ballsPerOver)
                        if (matchTypeDetails.isLimitedOvers && commentaryDetails.target) {
                            updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                                currentOver, matchTypeDetails.ballsPerOver, commentaryDetails.target || 0, matchTypeDetails.oversPerInings)
                        }
                        updateOver["totalWideBall"] = (currentOver.totalWideBall || 0) - 1
                        updateOver["totalWideRun"] = (currentOver.totalWideRun || 0) - run
                        updateOver["totalRun"] = (currentOver.totalRun || 0) - run
                        updatePartnership["totalRuns"] = currentPartnership.totalRuns - run
                        updatePartnership["extras"] = currentPartnership.extras - run
                    } else if (type === BALL_TYPE_NO_BALL || type === BALL_TYPE_NO_BALL_BYE || type === BALL_TYPE_NO_BALL_LEG_BYE) {
                        const totalRunToDelete = currentBall.ballRun + currentBall.ballExtraRun
                        if (type === BALL_TYPE_NO_BALL) {
                            batter["batRun"] = (batter.batRun || 0) - run
                            batter["batBall"] = (batter.batBall || 0) - 1
                            batter["batsmanStrikeRate"] = getStrikeRate(batter.batRun, batter.batBall)
                            updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) - currentBall.ballExtraRun
                            updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) - totalRunToDelete
                        } else {
                            updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) - currentBall.ballExtraRun
                            updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) - totalRunToDelete
                        }
                        updateBowler["bowlerNoBall"] = (bowler.bowlerNoBall || 0) - 1
                        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - totalRunToDelete
                        updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, currentOver, matchTypeDetails.ballsPerOver)
                        if (matchTypeDetails.isLimitedOvers && commentaryDetails.target) {
                            updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                                currentOver, matchTypeDetails.ballsPerOver, commentaryDetails.target || 0, matchTypeDetails.oversPerInings)
                        }
                        updateOver["totalNoball"] = (currentOver.totalNoball || 0) - 1
                        updateOver["totalNoBallRun"] = (currentOver.totalNoBallRun || 0) - currentBall.ballExtraRun
                        updateOver["totalRun"] = (currentOver.totalRun || 0) - totalRunToDelete
                        updatePartnership["totalRuns"] = currentPartnership.totalRuns - totalRunToDelete
                        updatePartnership["extras"] = currentPartnership.extras - currentBall.ballExtraRun
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
                        updateBattingTeam["crr"] = getRunRate(updateBattingTeam.teamScore, currentOver, matchTypeDetails.ballsPerOver)
                        if (matchTypeDetails.isLimitedOvers && commentaryDetails.target) {
                            updateBattingTeam["rrr"] = getRequiredRunRate(updateBattingTeam.teamScore,
                                currentOver, matchTypeDetails.ballsPerOver, commentaryDetails.target || 0, matchTypeDetails.oversPerInings)
                        }
                        updatePartnership["totalRuns"] = currentPartnership.totalRuns - run
                        updatePartnership["extras"] = currentPartnership.extras - run
                        updatePartnership["totalBalls"] = currentPartnership.totalBalls - 1

                        if (type === BALL_TYPE_BYE) {
                            updateBowler["bowlerByeBall"] = (bowler.bowlerByeBall || 0) - 1
                            updateBowler["bowlerByeBallRun"] = (bowler.bowlerByeBallRun || 0) - run
                            updateOver["totalByesBall"] = (currentOver.totalByesBall || 0) - 1
                            updateOver["totalByesRun"] = (currentOver.totalByesRun || 0) - run
                        }
                        else if (type === BALL_TYPE_LEG_BYE) {
                            updateBowler["bowlerLegByeBall"] = (bowler.bowlerLegByeBall || 0) - 1
                            updateBowler["bowlerLegByeBallRun"] = (bowler.bowlerLegByeBallRun || 0) - run
                            updateOver["totalLegByesBall"] = (currentOver.totalLegByesBall || 0) - 1
                            updateOver["totalLegByesRun"] = (currentOver.totalLegByesRun || 0) - run
                        }
                    }
                    updateBatter = { ...playersOnPitch[isOnStrikeSame ? ON_STRIKE : NON_STRIKE], ...updateBatter, onStrike: isOnStrikeSame ? false : true }
                    updateBowler = { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
                    setOnPitchPlayers({ ...onPitchPlayers, [CURRENT_BOWLER]: updateBowler })
                    setPlayers({ ...players, [BOWLING_TEAM]: players?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player), })
                    setTeams((prevData) => { return { ...prevData, [BATTING_TEAM]: { ...prevData[BATTING_TEAM], ...updateBattingTeam } } })
                    setCurrentOver((prevOver) => { return { ...prevOver, ...updateOver } })
                    setCurrentPartnership((prevValue) => { return { ...prevValue, ...updatePartnership } })
                }
                setIsUndoBall(undoType)
                setSaveToDb(true)
            }
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
                forNewPlayers = { isPlay: null, onStrike: null }
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
                updatedPlayer["bowlerOver"] = ((player.bowlerOver || 0) + ((player.bowlerTotalBall || 0) / 10) - 1)?.toFixed(1)
                updatedBattingTeam["teamOver"] = (+(updatedBattingTeam.teamOver || 0) + ((player.bowlerTotalBall || 0) / 10) - 1)?.toFixed(1)
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
        // console.log(updatedBattingTeam)
        setTeams({ ...teams, [BATTING_TEAM]: updatedBattingTeam })
        // console.log(updatedBattingPlayerList, updatedBowlingPlayerList)
        // console.log(players[BATTING_TEAM], onPitchPlayers, previousOnPitchPlayer)
        setPlayers({ [BATTING_TEAM]: updatedBattingPlayerList, [BOWLING_TEAM]: updatedBowlingPlayerList })
        setOnPitchPlayers(previousOnPitchPlayer)
        dispatch(undoBallFromCommentary({ "commentaryBallByBallId": currentBall.commentaryBallByBallId }))
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
    return <>
        <CommentaryScreen
            teamDetails={teams}
            onPitchPlayers={onPitchPlayers}
            updateRuns={updateRuns}
            statusList={statusList}
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
                setIsChangeBowler({ isChange: false, isChangePopup: true })
            }}
            updateDisplayStatus={(displayStatus) => {
                dispatch(addCommentaryScreenData({
                    "commentaryDetails": {
                        ...commentaryDetails,
                        "displayStatus": displayStatus
                    },
                }))
            }}
            anyPopup={inningsChangePopup || extrasType || showChangeOverModal || inningsChangePopup || showWicketModal || showUpdateInnings
                || showSwitchBatterModal || undoInningsPopup || completeMatchModal || winnerAnnouncement || isChangeBowler.isChangePopup || changePlayerList}
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
            // teamName={teams.[]}
            />}
        {extrasType && < ExtrasModal
            isOpen={true}
            toggle={() => { setExtrasType(undefined) }}
            extraType={extrasType}
            updateExtras={onExtrasChange} />}
        <ChangeOverModal
            isOpen={showChangeOverModal}
            toggle={() => { setShowChangeOverModal(undefined) }}
            onNoClick={() => { setShowChangeOverModal(undefined) }}
            onYesClick={() => {
                setShowChangeOverModal(undefined);
                setChangeOverOnPopupClick(true)
            }} />
        <ChangeInningsModal
            isOpen={inningsChangePopup}
            toggle={() => { setShowInningsChangePopup(undefined) }}
            onNoClick={() => { setShowInningsChangePopup(undefined) }}
            onYesClick={onInningsChange} />
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
            isOpen={isChangeBowler.isChangePopup}
            toggle={() => { setIsChangeBowler({ isChange: false, isChangePopup: false }) }}
            onBowlerChange={(selectedOption) => {
                setIsChangeBowler({ isChange: true, isChangePopup: false, popupOption: selectedOption })
                changePlayer(CURRENT_BOWLER)
            }}
        />}
    </>
}

export default Commentary

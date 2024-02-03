import { useEffect, useState } from "react"
import { CommentaryScreen } from "./Commentary.jsx"
import _, { isEmpty, isEqual } from "lodash"
import { ALL, BALL_BYE, BALL_LEG_BYE, BALL_TYPE_BYE, BALL_TYPE_LEG_BYE, BALL_TYPE_NO_BALL, BALL_TYPE_REGULAR, BALL_TYPE_WIDE, BALL_WIDE, BAT, BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, EXTRAS_LIST, FOUR, NON_STRIKE, NO_BALL, ON_STRIKE, OVER, RETIRED_OUT, RUN, SIX, WICKET } from "./CommentartConst.js"
import SelectPlayerModal from "./CommentaryModels/SelectPlayerModal.jsx"
import ExtrasModal from "./CommentaryModels/ExtrasModal.jsx"
import ChangeOverModal from "./CommentaryModels/ChangeOverModal.jsx"
import WicketModal from "./CommentaryModels/WicketModal.jsx"
import { generateBall, generateOver, generatePartnership, generateWicket } from "./functions.js"
import { useDispatch, useSelector } from "react-redux"
import { addCommentaryScreenData, clearAddCommentaryScreenData, clearUndoFlag, undoBallFromCommentary, undoOverFromCommentary } from "../../Features/Tabs/commentarySlice.js"
import ChangeInningsModal from "./CommentaryModels/ChangeInningsModal.jsx"
import { useNavigate } from "react-router-dom"
import UpdateInningsModal from "./CommentaryModels/UpdateInningsModal.jsx"
import { compareNumStringValues } from "../../components/Common/Reusables/reusableMethods.js"
import UpdateStrikeModal from "./CommentaryModels/UpdateStrikerModal.jsx"
import WinnerModal from "./CommentaryModels/WinnerModal.jsx"
import UndoInnnigsModal from "./CommentaryModels/UndoInningsModal.jsx"

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
    const [extrasList, setExtrasList] = useState(undefined)
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
    const matchTypeDetails = props.data.matchTypeData
    const commentaryDetails = props.data.commentaryData.commentaryDetails
    const { commentaryDataToUpdate, isCommentaryDataUpdated, isUndoCompleted } = useSelector(state => state.tabsData.commentary);
    let navigate = useNavigate();

    useEffect(() => {
        // console.log(commentaryDetails, matchTypeDetails)
        // console.log(currentBall, currentOver, currentPartnership, currentWicket, onPitchPlayers)
        // console.log(currentOver, currentBall)
        // console.log(ballHistory, overHistory, wicketHistory, partnershipHistory)
        // console.log(ballHistory, overHistory)
    })

    const checkForOverSwitch = (currentOver) => {
        if (currentOver * 10 % 10 >= matchTypeDetails.ballsPerOver) {
            setShowChangeOverModal(true)
        }
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
        if (conditionsToCheck.some(condition => condition)) {
            if (
                teams?.[BOWLING_TEAM].isBattingComplete && isLastInnigs) checkWinner()
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
                "displayStatus": "Innings Break"
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
                commentaryStatus: 2
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
            dispatch(addCommentaryScreenData({ "commentaryDetails": commentaryDetails, "commentaryOvers": { ...currentOver, "isComplete": true }, }))
            setChangeOverOnPopupClick(undefined)
        }
    }, [changeOverOnPopupClick])
    useEffect(() => {
        if (saveToDb) {
            // setting commentary ball by ball id to 0 in order to make sure that every time new ball is created
            let newCurrentBall = undefined
            if (isUndoBall) newCurrentBall = currentBall
            else newCurrentBall = { ...currentBall, commentaryBallByBallId: "0" }
            const objToSave = {
                "commentaryBallByBall": generateBall({ currentBall: newCurrentBall, commentaryDetails, currentOver, onPitchPlayers, teams }),
                "commentaryDetails": commentaryDetails,
                "commentaryOvers": currentOver,
                "commentaryPlayers": [].concat(playerUpdateList, [onPitchPlayers[CURRENT_BOWLER], onPitchPlayers[ON_STRIKE], onPitchPlayers[NON_STRIKE]]).filter(x => x),
                "commentaryPartnership": generatePartnership({ commentaryDetails, currentBall: {}, currentPartnership, teams }),
                "commentaryTeams": [teams[BATTING_TEAM]],
            }
            // console.log(objToSave)
            dispatch(addCommentaryScreenData(objToSave))
            setSaveToDb(false)
            checkInningsSwitch(RUN)
        }
    }, [saveToDb])
    useEffect(() => {
        if (isOverChange) {
            const objToSave = {
                "commentaryDetails": commentaryDetails,
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
                    currentOver = isBattingTeam ? (+teamDetails?.teamOver || 0).toFixed(0) : currentOver
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
                if (isEqual(partnershipDetails.batter1Id, onPitchPlayers[ON_STRIKE]?.commentaryPlayerId) &&
                    isEqual(partnershipDetails.batter2Id, onPitchPlayers[NON_STRIKE]?.commentaryPlayerId)) {
                    currentPartnership = partnershipDetails
                }
            });
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
            checkInningsSwitch(ALL)
            setIsLastInnings(commentaryDetails.currentInnings >= matchTypeDetails.noOfIningsPerSide)
            if (isEmpty(currentPartnership))
                dispatch(addCommentaryScreenData({ "commentaryDetails": commentaryDetails, "commentaryPartnership": generatePartnership({ commentaryDetails, currentBall: {}, currentPartnership: partnershipDetails, teams: currentInningsTeams }), }))
        }
    }, [])
    useEffect(() => {
        if (!isEmpty(commentaryDataToUpdate)) {
            if (isUndoBall) dispatch(undoBallFromCommentary({ "commentaryBallByBallId": currentBall.commentaryBallByBallId }))
            else {
                if (!isEmpty(commentaryDataToUpdate.overdetails) && !isEqual(commentaryDataToUpdate.overdetails.overId, currentOver.overId)) {
                    const updatedOverHistory = overHistory.slice(0, -1)
                    setOverHistory([].concat(updatedOverHistory || [], [currentOver, commentaryDataToUpdate.overdetails]))
                    dispatch(addCommentaryScreenData({ "commentaryDetails": commentaryDetails, "commentaryBallByBall": generateBall({ currentBall: { commentaryBallByBallId: "0", }, commentaryDetails, currentOver: { overId: commentaryDataToUpdate.overdetails.overId }, onPitchPlayers, teams }), }))
                    setCurrentOver(commentaryDataToUpdate.overdetails)
                }
                if (!isEmpty(commentaryDataToUpdate.commentaryBallByBallDetails) && !compareNumStringValues(currentBall?.commentaryBallByBallId, commentaryDataToUpdate.commentaryBallByBallDetails.commentaryBallByBallId)) {
                    setBallHistory([].concat(ballHistory || [], [commentaryDataToUpdate.commentaryBallByBallDetails]))
                    setCurrentBall(commentaryDataToUpdate.commentaryBallByBallDetails)
                }
                if (!isEmpty(commentaryDataToUpdate.commentaryPartnershipDetails) && !currentPartnership?.commentaryPartnershipId) {
                    const updatedPartnershipHistory = partnershipHistory.slice(0, -1)
                    setPartnershipHistory([].concat(updatedPartnershipHistory || [], [currentPartnership, commentaryDataToUpdate.commentaryPartnershipDetails]))
                    setCurrentPartnership(commentaryDataToUpdate.commentaryPartnershipDetails)
                }
                if (!isEmpty(commentaryDataToUpdate.commentaryWicketDetails) && !currentWicket?.commentaryWicketId) {
                    setWicketHistory([].concat(wicketHistory || [], [commentaryDataToUpdate.commentaryWicketDetails]))
                    setCurrentWicket(commentaryDataToUpdate.commentaryWicketDetails)
                }
            }
            setPlayerUpdateList(undefined)
            dispatch(clearAddCommentaryScreenData())
        }
    }, [commentaryDataToUpdate])
    const callWicketToDB = (updatedPlayerObj) => {
        const updatedPlayerList = Object.values(updatedPlayerObj)
        if (isWicketChange && currentBall.commentaryBallByBallId) {
            const partnershipDetails = {
                "batter1Id": updatedPlayerObj[ON_STRIKE]?.commentaryPlayerId,
                "batter1Name": updatedPlayerObj[ON_STRIKE]?.playerName,
                "batter2Id": updatedPlayerObj[NON_STRIKE]?.commentaryPlayerId,
                "batter2Name": updatedPlayerObj[NON_STRIKE]?.playerName,
            }
            const updatedPartnership = generatePartnership({ commentaryDetails, currentBall, currentPartnership: partnershipDetails, teams })
            const updatedBallByBall = generateBall({ currentBall, commentaryDetails, currentOver, onPitchPlayers: updatedPlayerObj, teams })
            const updatedWicket = generateWicket({ commentaryDetails, currentOver, teams, currentWicket, currentBall })
            const objToSave = {
                "commentaryDetails": commentaryDetails,
                "commentaryPartnership": updatedPartnership,
                "commentaryBallByBall": updatedBallByBall,
                "commentaryWicket": updatedWicket,
                "commentaryPlayers": updatedPlayerList,
            }
            dispatch(addCommentaryScreenData(objToSave))
            setIsWicketChange(undefined)
            // setCurrentWicket(undefined)
            setCurrentPartnership(undefined)
            checkForOverSwitch(onPitchPlayers[CURRENT_BOWLER]?.bowlerOver)
        }
    }
    const updateRuns = ({ run, ball, batter, bowler, type, freezePlayers = false }) => {
        if (!freezePlayers) setCurrentBall({})
        const updateBattingTeam = {}
        let updateBatter = {}
        let updateBowler = {}
        const updateOver = {}
        const updatePartnership = {}
        const updateBall = {}
        let isChangeStrike = undefined

        const updatedBowlerOver = ((+bowler.bowlerOver || 0) + 0.1).toFixed(1)
        if (!freezePlayers) checkForOverSwitch(updatedBowlerOver)
        updateBall["ballIsCount"] = ball > 0
        updateBall["ballType"] = BALL_TYPE_REGULAR
        updateBall["ballRun"] = run
        updateBall["batStrikeId"] = onPitchPlayers[ON_STRIKE].commentaryPlayerId
        updateBall["batNonStrikeId"] = onPitchPlayers[NON_STRIKE].commentaryPlayerId
        updateBatter["batRun"] = (batter.batRun || 0) + run
        updateBatter["batBall"] = (batter.batBall || 0) + ball
        updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + run
        updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) + ball
        updateBowler["bowlerOver"] = updatedBowlerOver
        updatePartnership["totalRuns"] = (currentPartnership.totalRuns || 0) + run
        updatePartnership["totalBalls"] = (currentPartnership.totalBalls || 0) + ball
        updateOver["ballCount"] = (currentOver.ballCount || 0) + ball
        updateOver["totalRun"] = (currentOver.totalRun || 0) + run
        updateBattingTeam["teamWicket"] = (+teams[BATTING_TEAM].teamWicket || 0)
        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + run
        updateBattingTeam["teamOver"] =
            ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1)
        if (run === 0) {
            updateBall["ballIsDot"] = true
            updateBatter["batDotBall"] = (batter.batDotBall || 0) + ball
            updateOver["dotBall"] = (currentOver.dotBall || 0) + ball
            updateBowler["bowlerDotBall"] = (bowler.bowlerDotBall || 0) + ball
        } else if (run % 2 === 0) {
            if (type === FOUR) {
                updateBall["ballIsBoundry"] = true
                updateBall["ballFour"] = 1
                updateBatter["batFour"] = (batter.batFour || 0) + 1
                updateOver["totalFour"] = (currentOver.totalFour || 0) + 1
                updateBowler["bowlerFour"] = (bowler.bowlerFour || 0) + 1
            } else if (type === SIX) {
                updateBall["ballIsBoundry"] = true
                updateBall["ballSix"] = 1
                updateBatter["batSix"] = (batter.batSix || 0) + 1
                updateOver["totalSix"] = (currentOver.totalSix || 0) + 1
                updateBowler["bowlerSix"] = (bowler.bowlerSix || 0) + 1
            }
        } else isChangeStrike = freezePlayers ? false : true
        updateBatter = { ...onPitchPlayers[ON_STRIKE], ...updateBatter, onStrike: isChangeStrike ? false : true }
        // console.log(updateBatter)
        updateBowler = { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
        const updateNonStriker = { ...onPitchPlayers[NON_STRIKE], onStrike: isChangeStrike ? true : false }
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
    const updateExtras = (type, runs) => {
        setCurrentBall({})
        const bowler = onPitchPlayers[CURRENT_BOWLER]
        const updateBattingTeam = {}
        const updateOver = {}
        const updateBall = {}
        const updatePartnership = {}
        const updateBowler = {}
        const updatedBowlerOver = ((+bowler.bowlerOver || 0) + 0.1).toFixed(1)
        updateBattingTeam["teamWicket"] = (+teams[BATTING_TEAM].teamWicket || 0)
        if (type === BALL_WIDE) {
            const runToUpdate = (+matchTypeDetails["valueOfWideBall"] || 0) + runs
            updateBowler["bowlerWideBall"] = (bowler.bowlerWideBall || 0) + 1
            updateBowler["bowlerWideBallRun"] = (bowler.bowlerWideBallRun || 0) + runToUpdate
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
            updateOver["totalWideBall"] = (currentOver.totalWideBall || 0) + 1
            updateOver["totalWideRun"] = (currentOver.totalWideRun || 0) + runToUpdate
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runToUpdate
            updateBall["ballIsCount"] = false
            updateBall["ballRun"] = runToUpdate
            updateBall["ballExtraRun"] = runToUpdate
            updateBall["ballType"] = BALL_TYPE_WIDE
            updateBall["batStrikeId"] = onPitchPlayers[ON_STRIKE].commentaryPlayerId
            updateBall["batNonStrikeId"] = onPitchPlayers[NON_STRIKE].commentaryPlayerId
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runToUpdate
            updatePartnership["extras"] = currentPartnership.extras + runToUpdate
        } else if (type === NO_BALL) {
            const runToUpdate = (+matchTypeDetails["valueOfNoBall"] || 0) + runs
            updateBowler["bowlerNoBall"] = (bowler.bowlerNoBall || 0) + 1
            updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) + runToUpdate
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
            updateOver["totalNoball"] = (currentOver.totalNoball || 0) + 1
            updateOver["totalNoBallRun"] = (currentOver.totalNoBallRun || 0) + runToUpdate
            updateOver["totalRun"] = (currentOver.totalRun || 0) + runToUpdate
            updateBall["ballIsCount"] = false
            updateBall["ballRun"] = runToUpdate
            updateBall["ballExtraRun"] = runToUpdate
            updateBall["ballType"] = BALL_TYPE_NO_BALL
            updatePartnership["totalRuns"] = currentPartnership.totalRuns + runToUpdate
            updatePartnership["extras"] = currentPartnership.extras + runToUpdate
        }
        else {
            updateBall["ballIsCount"] = true
            updateBowler["bowlerOver"] = updatedBowlerOver
            updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) + 1
            updateOver["ballCount"] = (currentOver.ballCount || 0) + 1
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
            }
            else if (type === BALL_LEG_BYE) {
                updateBowler["bowlerLegByeBall"] = (bowler.bowlerLegByeBall || 0) + 1
                updateBowler["bowlerLegByeBallRun"] = (bowler.bowlerLegByeBallRun || 0) + runs
                updateOver["totalLegByesBall"] = (currentOver.totalLegByesBall || 0) + 1
                updateOver["totalLegByesRun"] = (currentOver.totalLegByesRun || 0) + runs
                updateBall["ballType"] = BALL_TYPE_LEG_BYE
            }
            checkForOverSwitch(updatedBowlerOver)
        }
        setOnPitchPlayers((prevData) => {
            return { ...prevData, [CURRENT_BOWLER]: { ...prevData[CURRENT_BOWLER], ...updateBowler } }
        })
        setPlayers({ ...players, [BOWLING_TEAM]: players?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player), })
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
        const newOnStrikePlayer = { ...onPitchPlayers[NON_STRIKE], onStrike: "true" }
        const newNonStrikePlayer = { ...onPitchPlayers[ON_STRIKE], onStrike: "false" }
        setOnPitchPlayers(
            (prevValue) => {
                return { ...prevValue, [ON_STRIKE]: newOnStrikePlayer, [NON_STRIKE]: newNonStrikePlayer, }
            })
    }
    const handleWicket = (wicketData) => {
        setCurrentBall({})
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
        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + +wicketData.runs
        updateBattingTeam["teamOver"] =
            ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1)
        updateBowler["bowlerTotalWicket"] = (onPitchPlayers[CURRENT_BOWLER].bowlerTotalWicket || 0) + 1
        const updatedBattingPlayers = players[BATTING_TEAM]?.map((player) => {
            if (isEqual(player.commentaryPlayerId, wicketData.batterId)) {
                updateBall["ballPlayerId"] = player.commentaryPlayerId
                updateWicket["batterId"] = player.commentaryPlayerId
                updateWicket["batterName"] = player.playerName
                updateWicket["batterRuns"] = wicketPlayerDetails.batRun + +wicketData.runs
                updateWicket["batterBalls"] = wicketPlayerDetails.batBall + 1
                wicketPlayerDetails["batRun"] = wicketPlayerDetails.batRun + +wicketData.runs
                wicketPlayerDetails["batBall"] = wicketPlayerDetails.batBall + 1
                const playerDataToList = {
                    ...wicketPlayerDetails,
                    "batBall": wicketPlayerDetails.batBall + 1,
                    "batRun": wicketPlayerDetails.batRun + +wicketData.runs,
                    "isBatterOut": true,
                    "isBatterRetir": wicketData.wicketType === RETIRED_OUT,
                    "wicketType": wicketData.wicketType,
                    "bowlerId": onPitchPlayers[CURRENT_BOWLER].commentaryPlayerId,
                    "fielderId1": wicketData.fielder1,
                    "fielderId2": wicketData.fielder2,
                    "isPlay": null,
                    "onStrike": null
                }
                // setPlayerUpdateList([].concat([playerDataToList], playerUpdateList || []))
                updatedBatter = playerDataToList
                return playerDataToList
            }
            return player
        })
        updateRuns({ run: +wicketData.runs, ball: 1, batter: wicketPlayerDetails, bowler: onPitchPlayers[CURRENT_BOWLER], type: "", freezePlayers: true })
        setPlayers((prevData) => { return { ...prevData, [BATTING_TEAM]: updatedBattingPlayers } })
        setOnPitchPlayers((prevValue) => {
            const updateStriker = isOnStrikeWicket ? updatedBatter : prevValue[ON_STRIKE]
            const udpateNonStriker = !isOnStrikeWicket ? updatedBatter : prevValue[NON_STRIKE]
            return {
                [ON_STRIKE]: updateStriker,
                [NON_STRIKE]: { ...udpateNonStriker, onStrike: false },
                [CURRENT_BOWLER]: { ...prevValue[CURRENT_BOWLER], ...updateBowler }
            }
        })
        let newValue = {}
        setTeams((prevValue) => {
            newValue = { ...teams, [BATTING_TEAM]: { ...prevValue[BATTING_TEAM], ...updateBattingTeam } }
            return newValue
        })
        setCurrentOver((prevValue) => { return { ...prevValue, ...updateOver } })
        setCurrentBall((prevValue) => { return { ...prevValue, ...updateBall, } })
        changePlayer(isOnStrikeWicket ? ON_STRIKE : NON_STRIKE)
        setCurrentWicket((prevValue) => { return { ...prevValue, ...updateWicket } })
        setShowWicketModal(undefined)
        checkInningsSwitch(WICKET)
    }
    const onExtrasChange = (runFromModal) => {
        updateExtras(extrasType, runFromModal)
        setExtrasList(undefined)
        setExtrasType(undefined)
    }
    const onPlayerChange = (newPlayerId) => {
        const teamType = playerToChange === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM
        let newPlayer = undefined
        let oldPlayer = undefined
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
                    oldPlayer = updatedPlayer
                    return updatedPlayer
                }
                if (isEqual(player.commentaryPlayerId, newPlayerId)) {
                    const updatedPlayer = { ...player, "isPlay": true, "onStrike": playerToChange === ON_STRIKE ? true : playerToChange === NON_STRIKE ? false : null }
                    newPlayer = updatedPlayer
                    // setPlayerUpdateList([].concat([updatedPlayer], playerUpdateList || []))
                    return updatedPlayer
                } return player
            })
        })
        setOnPitchPlayers((prevValue) => {
            return { ...prevValue, [playerToChange]: newPlayer }
        })
        if (playerToChange === CURRENT_BOWLER) setIsOverChange(true)
        if (isWicketChange) callWicketToDB({ ...onPitchPlayers, [playerToChange]: newPlayer, oldPlayer })
        if (currentWicket.commentaryId) setShowSwitchBatterModal(true)
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
    const changeOnStrikePlayer = (commentaryPlayerId) => {
        const isPlayerOnNonstrike = compareNumStringValues(onPitchPlayers[NON_STRIKE].commentaryPlayerId, commentaryPlayerId)
        if (isPlayerOnNonstrike) {
            const updatedOnStrikePlayer = { ...onPitchPlayers[NON_STRIKE], onStrike: true }
            const updatedNonStrikePlayer = { ...onPitchPlayers[ON_STRIKE], onStrike: false }
            setOnPitchPlayers({ ...onPitchPlayers, [ON_STRIKE]: updatedOnStrikePlayer, [NON_STRIKE]: updatedNonStrikePlayer })
            const objToSave = {
                "commentaryDetails": commentaryDetails,
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
        if (currentBall.commentaryBallByBallId && (+currentBall.overCount === +teams[BATTING_TEAM].teamOver)) {
            // console.log("clicked")
            // console.log(currentOver, currentOver.over, currentOver.ballCount, currentBall.ballRun)
            if (((currentOver.over || 0) === 0) && ((currentOver.ballCount || 0) === 0)
                && ((currentBall.ballRun || 0) === 0)) {
                setUndoInningsPopup(true)
            } else if ((currentBall.currentOverBalls === 0) && (currentBall.ballRun === 0)) updateAfterOverUndo()
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
                    updateBatter["batBall"] = (batter.batBall || 0) - 1
                    updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) - 1
                    updateOver["ballCount"] = (currentOver.ballCount || 0) - 1
                    updatePartnership["totalBalls"] = (currentPartnership.totalBalls || 0) - 1
                    updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) - run
                    updateBowler["bowlerOver"] = updatedBowlerOver
                    updatePartnership["totalRuns"] = (currentPartnership.totalRuns || 0) - run
                    updateOver["totalRun"] = (currentOver.totalRun || 0) - run
                    updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - run
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
                        updateBowler["bowlerWideBallRun"] = (bowler.bowlerWideBallRun || 0) - run
                        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - run
                        updateOver["totalWideBall"] = (currentOver.totalWideBall || 0) - 1
                        updateOver["totalWideRun"] = (currentOver.totalWideRun || 0) - run
                        updateOver["totalRun"] = (currentOver.totalRun || 0) - run
                        updatePartnership["totalRuns"] = currentPartnership.totalRuns - run
                        updatePartnership["extras"] = currentPartnership.extras - run
                    } else if (type === BALL_TYPE_NO_BALL) {
                        updateBowler["bowlerNoBall"] = (bowler.bowlerNoBall || 0) - 1
                        updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) - run
                        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - run
                        updateOver["totalNoball"] = (currentOver.totalNoball || 0) - 1
                        updateOver["totalNoBallRun"] = (currentOver.totalNoBallRun || 0) - run
                        updateOver["totalRun"] = (currentOver.totalRun || 0) - run
                        updatePartnership["totalRuns"] = currentPartnership.totalRuns - run
                        updatePartnership["extras"] = currentPartnership.extras - run
                    }
                    else {
                        updateBowler["bowlerOver"] = ((+bowler.bowlerOver || 0) - 0.1).toFixed(1)
                        updateBattingTeam["teamOver"] =
                            ((+teams[BATTING_TEAM].teamOver || 0) - 0.1).toFixed(1)
                        updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) - 1
                        updateOver["ballCount"] = (currentOver.ballCount || 0) - 1
                        updateOver["totalRun"] = (currentOver.totalRun || 0) - run
                        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) - run
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
                    updateBowler = { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
                    setOnPitchPlayers({ ...onPitchPlayers, [CURRENT_BOWLER]: updateBowler })
                    setPlayers({ [BOWLING_TEAM]: players?.[BOWLING_TEAM].map(player => compareNumStringValues(player.commentaryPlayerId, updateBowler.commentaryPlayerId) ? updateBowler : player), })
                    setTeams((prevData) => { return { ...prevData, [BATTING_TEAM]: { ...prevData[BATTING_TEAM], ...updateBattingTeam } } })
                    setCurrentOver((prevOver) => { return { ...prevOver, ...updateOver } })
                    setCurrentPartnership((prevValue) => { return { ...prevValue, ...updatePartnership } })
                }
                setIsUndoBall(undoType)
                setSaveToDb(true)
            }
        }
        // console.log(currentBall, teams, playersOnPitch)
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
        // console.log(previousBall)
        const previousOnPitchPlayer = {}
        const updatedBattingTeam = teams[BATTING_TEAM]
        const updatedBowlingPlayerList = players[BOWLING_TEAM].map(player => {
            const updatedPlayer = player
            if (compareNumStringValues(player.commentaryPlayerId, onPitchPlayers[CURRENT_BOWLER].commentaryPlayerId)) updatedPlayer["isPlay"] = null
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
            changePlayer={changePlayer}
            changeOver={() => { setShowChangeOverModal(true) }}
            updateExtras={(extraType) => {
                setExtrasType(extraType)
                setExtrasList(EXTRAS_LIST[extraType])
            }}
            onWicketClick={() => { setShowWicketModal(true) }}
            changeStrike={changeOnStrikePlayer}
            endInnings={() => setShowInningsChangePopup(true)}
            onUndoClick={handleUndoClick}
        />
        {!(inningsChangePopup || props.isDataLoading || winnerAnnouncement || showUpdateInnings) &&
            <SelectPlayerModal isOpen={changePlayerList ? true : false}
                toggle={() => { setChangePlayerList(undefined) }}
                playerList={changePlayerList}
                selectPlayer={onPlayerChange} />}
        <ExtrasModal isOpen={extrasList}
            toggle={() => { setExtrasList(undefined) }}
            runList={extrasList}
            selectExtraRun={onExtrasChange} />
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
                onPitchPlayers={onPitchPlayers} />}
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
        {winnerAnnouncement && <WinnerModal
            isOpen={winnerAnnouncement ? true : false}
            winnerAnnouncement={winnerAnnouncement}
            toggle={() => { setWinnerAnnouncement(undefined) }}
            onExitClick={() => {
                setWinnerAnnouncement(undefined)
                navigate("/commentary")
            }}
        />}
    </>
}

export default Commentary

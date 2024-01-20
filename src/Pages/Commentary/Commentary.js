import { useEffect, useState } from "react"
import { CommentaryScreen } from "./Commentary.jsx"
import { isEmpty, isEqual } from "lodash"
import { BALL_BYE, BALL_LEG_BYE, BALL_TYPE_BYE, BALL_TYPE_LEG_BYE, BALL_TYPE_NO_BALL, BALL_TYPE_REGULAR, BALL_TYPE_WIDE, BALL_WIDE, BAT, BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, EXTRAS_LIST, FOUR, NON_STRIKE, NO_BALL, ON_STRIKE, RETIRED_OUT, SIX } from "./CommentartConst.js"
import SelectPlayerModal from "./CommentaryModels/SelectPlayerModal.jsx"
import ExtrasModal from "./CommentaryModels/ExtrasModal.jsx"
import ChangeOverModal from "./CommentaryModels/ChangeOverModal.jsx"
import WicketModal from "./CommentaryModels/WicketModal.jsx"
import { generateBall, generateOver, generatePartnership, generateWicket } from "./functions.js"
import { useDispatch, useSelector } from "react-redux"
import { addCommentaryScreenData } from "../../Features/Tabs/commentarySlice.js"

const Commentary = (props) => {
    const dispatch = useDispatch();
    const [currentInnings, setCurrentInnings] = useState(undefined)
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
    const matchTypeDetails = props.data.matchTypeData
    const commentaryDetails = props.data.commentaryData.commentaryDetails
    const { commentaryDataToUpdate } = useSelector(state => state.tabsData.commentary);

    useEffect(() => {
        console.log(onPitchPlayers, teams, players)
    })
    const checkForOverSwitch = (currentOver) => {
        // console.log(matchTypeDetails)
        if (currentOver * 10 % 10 >= matchTypeDetails.ballsPerOver) {
            setShowChangeOverModal(true)
        }
    }
    useEffect(() => {
        if (changeOverOnPopupClick) {
            changePlayer(CURRENT_BOWLER)
            changeOver()
            setChangeOverOnPopupClick(undefined)
        }
    }, [changeOverOnPopupClick])
    useEffect(() => {
        if (saveToDb) {
            const objToSave = {
                "commentaryBallByBall": generateBall({ currentBall, commentaryDetails, currentOver, onPitchPlayers, teams }),
                "commentaryDetails": commentaryDetails,
                "commentaryOvers": currentOver,
                "commentaryPlayers": [].concat([onPitchPlayers[CURRENT_BOWLER], onPitchPlayers[ON_STRIKE], onPitchPlayers[NON_STRIKE]], playerUpdateList),
                "commentaryPartnership": generatePartnership({ commentaryDetails, currentBall, currentPartnership, teams }),
                "commentaryTeams": [teams[BATTING_TEAM]],
            }
            // console.log(objToSave)
            dispatch(addCommentaryScreenData(objToSave))
            setSaveToDb(false)
        }
    }, [saveToDb])
    useEffect(() => {
        if (isOverChange) {
            const objToSave = {
                "commentaryDetails": commentaryDetails,
                "commentaryOvers": generateOver({ commentaryDetails, onPitchPlayers, teams }),
                "commentaryPlayers": [].concat([onPitchPlayers[CURRENT_BOWLER], onPitchPlayers[ON_STRIKE], onPitchPlayers[NON_STRIKE]], playerUpdateList),
            }
            dispatch(addCommentaryScreenData(objToSave))
            setIsOverChange(undefined)
        }
    }, [isOverChange])
    useEffect(() => {
        if (isWicketChange) {
            const updatedPartnership = generatePartnership({ commentaryDetails, currentBall, currentPartnership, teams })
            const updatedBallByBall = generateBall({ currentBall, commentaryDetails, currentOver, onPitchPlayers, teams })
            const updatedWicket = generateWicket({ commentaryDetails, currentOver, teams, currentWicket, currentBall })
            const objToSave = {
                "commentaryDetails": commentaryDetails,
                "commentaryPartnership": updatedPartnership,
                "commentaryBallByBall": updatedBallByBall,
                "commentaryWicket": updatedWicket
            }
            dispatch(addCommentaryScreenData(objToSave))
            setIsWicketChange(undefined)
        }
    }, [isWicketChange, commentaryDataToUpdate])
    useEffect(() => {
        if (props.data) {
            const currentInningsTeams = {}
            const battingTeam = []
            const bowlingTeam = []
            const onPitchPlayers = {}
            let currentPartnership = {}
            let currentOver = {}
            props.data.commentaryData.commentaryTeams.forEach(teamDetails => {
                if (isEqual(teamDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = teamDetails.teamStatus === BAT
                    currentInningsTeams[isBattingTeam ? BATTING_TEAM : BOWLING_TEAM] = teamDetails
                    currentOver = isBattingTeam ? (+teamDetails?.teamOver || 0).toFixed(0) : currentOver
                    console.log(currentOver)
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
                    // console.log(partnershipDetails)
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
            setTeams(currentInningsTeams)
            setPlayers({ [BATTING_TEAM]: battingTeam, [BOWLING_TEAM]: bowlingTeam })
            console.log("1", onPitchPlayers)
            setOnPitchPlayers(onPitchPlayers)
            setCurrentPartnership(partnershipDetails)
            setBallHistory(props.data.commentaryDatacommentaryBallByBall || [])
            setOverHistory(props.data.commentaryData.commentaryOvers || [])
            setPartnershipHistory(props.data.commentaryData.commentaryPartnership)
            setWicketHistory(props.data.commentaryData.commentaryWicket)
            setCurrentPartnership({ ...partnershipDetails, ...currentPartnership })
            setCurrentOver(currentOver)
            setCurrentInnings(commentaryDetails.currentInnings)
            if (isEmpty(currentPartnership))
                props.save({
                    "commentaryDetails": commentaryDetails,
                    "commentaryPartnership": generatePartnership({ commentaryDetails, currentBall, currentPartnership: partnershipDetails, teams: currentInningsTeams }),
                })
        }
    }, [])
    useEffect(() => {
        if (!isEmpty(commentaryDataToUpdate)) {
            if (!isEmpty(commentaryDataToUpdate.overdetails)) {
                // setOverHistory(overHistory.push(currentOver))
                setCurrentOver(commentaryDataToUpdate.overdetails)
            }
            // if (!isEmpty(commentaryDataToUpdate.overdetails)) {
            //     setCurrentOver(commentaryDataToUpdate.overdetails)
            // }
            // if (!isEmpty(commentaryDataToUpdate.overdetails)) {
            //     setCurrentOver(commentaryDataToUpdate.overdetails)
            // }
        }
    }, [commentaryDataToUpdate])
    const updateRuns = ({ run, ball, batter, bowler, type, freezePlayers = false }) => {
        // console.log(run, ball, batter, bowler, type, freezePlayers)
        const updateBattingTeam = {}
        let updateBatter = {}
        let updateBowler = {}
        const updateOver = {}
        const updatePartnership = {}
        const updateBall = {}
        let isChangeStrike = undefined

        const updatedBowlerOver = ((+bowler.bowlerOver || 0) + 0.1).toFixed(1)
        checkForOverSwitch(updatedBowlerOver)
        updateBall["ballIsCount"] = ball > 0
        updateBall["ballType"] = BALL_TYPE_REGULAR
        updateBall["ballRun"] = run
        updateBatter["batRun"] = (batter.batRun || 0) + run
        updateBatter["batBall"] = (batter.batBall || 0) + ball
        updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + run
        updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) + ball
        updateBowler["bowlerOver"] = updatedBowlerOver
        updatePartnership["totalRuns"] = currentPartnership.totalRuns + run
        updatePartnership["totalBalls"] = currentPartnership.totalBalls + ball
        updateOver["ballCount"] = (currentOver.ballCount || 0) + ball
        updateOver["totalRun"] = (currentOver.totalRun || 0) + run
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
        updateBowler = { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
        const updateNonStriker = { ...onPitchPlayers[NON_STRIKE], onStrike: isChangeStrike ? true : false }
        //TODO Delete this
        console.log("2", { [ON_STRIKE]: isChangeStrike ? updateNonStriker : updateBatter, [NON_STRIKE]: isChangeStrike ? updateBatter : updateNonStriker, [CURRENT_BOWLER]: updateBowler })
        setOnPitchPlayers({ [ON_STRIKE]: isChangeStrike ? updateNonStriker : updateBatter, [NON_STRIKE]: isChangeStrike ? updateBatter : updateNonStriker, [CURRENT_BOWLER]: updateBowler })
        setTeams((prevData) => { return { ...prevData, [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam } } })
        setCurrentBall((prevValue) => { return { ...prevValue, ...updateBall } })
        setCurrentOver((prevValue) => { return { ...prevValue, ...updateOver, } })
        setCurrentPartnership((prevValue) => { return { ...prevValue, ...updatePartnership, } })
        setSaveToDb(true)
    }
    const updateExtras = (type, runs) => {
        const bowler = onPitchPlayers[CURRENT_BOWLER]
        const updateBattingTeam = {}
        const updateOver = {}
        const updateBall = {}
        const updatePartnership = {}
        const updateBowler = {}
        const updatedBowlerOver = ((+bowler.bowlerOver || 0) + 0.1).toFixed(1)
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
            console.log("3", { ...prevData, [CURRENT_BOWLER]: { ...prevData[CURRENT_BOWLER], ...updateBowler } })
            return { ...prevData, [CURRENT_BOWLER]: { ...prevData[CURRENT_BOWLER], ...updateBowler } }
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
        const newOnStrikePlayer = { ...onPitchPlayers[NON_STRIKE], onStrike: "true" }
        const newNonStrikePlayer = { ...onPitchPlayers[ON_STRIKE], onStrike: "false" }
        setOnPitchPlayers(
            (prevValue) => {
                console.log("5", { ...prevValue, [ON_STRIKE]: newOnStrikePlayer, [NON_STRIKE]: newNonStrikePlayer, })
                return { ...prevValue, [ON_STRIKE]: newOnStrikePlayer, [NON_STRIKE]: newNonStrikePlayer, }
            })
    }
    const handleWicket = (wicketData) => {
        const updateBattingTeam = {}
        const updateBall = {}
        const updateWicket = {}
        let updateBowler = {}
        let updateOver = {}
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
                const playerDataToList = {
                    ...wicketPlayerDetails,
                    "isBatterOut": true,
                    "isBatterRetir": wicketData.wicketType === RETIRED_OUT,
                    "wicketType": wicketData.wicketType,
                    "bowlerId": onPitchPlayers[CURRENT_BOWLER].commentaryPlayerId,
                    "fielderId1": wicketData.fielder1,
                    "fielderId2": wicketData.fielder2,
                }
                setPlayerUpdateList([].concat([playerDataToList], playerUpdateList || []))
                return playerDataToList
            }
            return player
        })
        updateRuns({ run: +wicketData.runs, ball: 1, batter: wicketPlayerDetails, bowler: onPitchPlayers[CURRENT_BOWLER], type: "", freezePlayers: true })
        setPlayers((prevData) => { return { ...prevData, [BATTING_TEAM]: updatedBattingPlayers } })
        setOnPitchPlayers((prevValue) => {
            console.log("6", { [CURRENT_BOWLER]: { ...prevValue[CURRENT_BOWLER], ...updateBowler } })
            const updateStriker = isOnStrikeWicket ? undefined : prevValue[ON_STRIKE]
            const udpateNonStriker = !isOnStrikeWicket ? undefined : prevValue[NON_STRIKE]
            return {
                [ON_STRIKE]: wicketData.switchBatter ? udpateNonStriker : updateStriker,
                [NON_STRIKE]: wicketData.switchBatter ? updateStriker : udpateNonStriker,
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
        changePlayer(isOnStrikeWicket === wicketData.switchBatter ? NON_STRIKE : ON_STRIKE)
        setCurrentWicket((prevValue) => { return { ...prevValue, ...updateWicket } })
        setShowWicketModal(undefined)
        setIsWicketChange(true)
    }
    const onExtrasChange = (runFromModal) => {
        updateExtras(extrasType, runFromModal)
        setExtrasList(undefined)
        setExtrasType(undefined)
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
                    setPlayerUpdateList([].concat([updatedPlayer], playerUpdateList || []))
                    return updatedPlayer
                }
                if (isEqual(player.commentaryPlayerId, newPlayerId)) {
                    const updatedPlayer = { ...player, "isPlay": true, "onStrike": playerToChange === ON_STRIKE ? true : playerToChange === NON_STRIKE ? false : null }
                    newPlayer = updatedPlayer
                    setPlayerUpdateList([].concat([updatedPlayer], playerUpdateList || []))
                    return updatedPlayer
                } return player
            })
        })
        setOnPitchPlayers((prevValue) => {
            console.log("7", { ...prevValue, [playerToChange]: newPlayer })
            return { ...prevValue, [playerToChange]: newPlayer }
        })
        if (playerToChange === CURRENT_BOWLER) setIsOverChange(true)
        setChangePlayerList(undefined)
        setPlayerToChange(undefined)
    }
    const changePlayer = (type) => {
        setPlayerToChange(type)
        setChangePlayerList(players[type === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM]?.filter((player) =>
            player.isPlay === null))
    }

    return <>
        <CommentaryScreen
            teamDetails={teams}
            onPitchPlayers={onPitchPlayers}
            updateRuns={updateRuns}
            changePlayer={changePlayer}
            changeOver={() => {
                setShowChangeOverModal(true)
            }}
            updateExtras={(extraType) => {
                setExtrasType(extraType)
                setExtrasList(EXTRAS_LIST[extraType])
            }}
            onWicketClick={() => { setShowWicketModal(true) }}
        // onUndoClick={handleUndoClick}
        />
        <SelectPlayerModal isOpen={changePlayerList}
            toggle={() => { setChangePlayerList(undefined) }}
            playerList={changePlayerList}
            selectPlayer={onPlayerChange} />
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
        {showWicketModal &&
            <WicketModal
                isOpen={showWicketModal}
                toggle={() => { setShowWicketModal(undefined) }}
                onSubmit={handleWicket}
                bowlingTeam={players[BOWLING_TEAM]}
                onPitchPlayers={onPitchPlayers} />}
    </>
}

export default Commentary
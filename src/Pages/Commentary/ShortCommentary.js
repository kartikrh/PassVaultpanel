import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../../Features/axios"
import { updateToastData } from "../../Features/toasterSlice"
import { ERROR, PERMISSION_VIEW, STRING_SEPERATOR, TAB_COMMENTARY } from "../../components/Common/Const"
import ShortCommentaryScreen from "./ShortCommentary.jsx"
import SpinnerModel from "../../components/Model/SpinnerModel";
import { BAT, BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, NON_STRIKE, ON_STRIKE } from "./CommentartConst"
import { isEqual } from "lodash"
import { checkPermission } from "../../components/Common/Reusables/reusableMethods.js"

const navigateTo = "/commentary"
export const ShortCommentary = () => {
    const pageName = TAB_COMMENTARY
    const [commentaryData, setCommentaryData] = useState(undefined);
    const [teams, setTeams] = useState(undefined)
    const [players, setPlayers] = useState(undefined)
    const [onPitchPlayers, setOnPitchPlayers] = useState({})
    const [currentOver, setCurrentOver] = useState({})
    const [isLastInnigs, setIsLastInnings] = useState(undefined)
    const [matchTypeData, setMatchTypeData] = useState({});
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [formattedDetails, setFormattedDetails] = useState({})
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    const location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            Navigate("/dashboard")
        }
    }, []);

    const commentaryId = location.state?.commentaryId || "0";
    useEffect(() => {
        if (commentaryId !== "0") {
            fetchData(commentaryId);
        }
    }, [commentaryId]);

    const fetchData = async () => {
        setIsDataLoading(true)
        let commentaryDataToUpdate = {}
        let commentaryDetailsToUpdate = {}
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId })
            .then(async (response) => {
                commentaryDataToUpdate = response?.result
                // Get Match type data from matchTypeID
                setIsDataLoading(true)
                await axiosInstance.post('/admin/matchType/byId', { matchTypeId: commentaryDataToUpdate?.commentaryDetails?.matchTypeId })
                    .then((response) => {
                        setMatchTypeData(response?.result);
                        setIsDataLoading(false)
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsDataLoading(false)
                    });
                // Get Event Type data from eventTypeId
                setIsDataLoading(true)
                await axiosInstance.post('/admin/eventType/byId', { eventTypeId: commentaryDataToUpdate?.commentaryDetails?.eventTypeId })
                    .then((response) => {
                        commentaryDetailsToUpdate["eventType"] = response?.result?.eventType;
                        setIsDataLoading(false)
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsDataLoading(false)
                    });
                setIsDataLoading(true)
                await axiosInstance.post('/admin/competition/byId', { competitionId: commentaryDataToUpdate?.commentaryDetails?.competitionId })
                    .then((response) => {
                        commentaryDetailsToUpdate["competition"] = response?.result?.competition;
                        setIsDataLoading(false)
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsDataLoading(false)
                    });
                commentaryDataToUpdate.commentaryDetails = { ...commentaryDataToUpdate.commentaryDetails, ...commentaryDetailsToUpdate }
                setCommentaryData(commentaryDataToUpdate)
                setIsDataLoading(false)
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsDataLoading(false)
            });
        formatData(commentaryDataToUpdate)
    };

    const findPlayersFormList = (commentaryData, innings, teamId) => {
        const toReturn = []
        commentaryData?.commentaryPlayers?.forEach(player => { if ((player.currentInnings === innings) && (player.teamId === teamId)) toReturn.push(player) })
        return toReturn
    }
    const formatData = (commentaryData) => {
        const formattedData = {}
        const totalInnings = matchTypeData.noOfIningsPerSide
        commentaryData?.commentaryTeams?.forEach(team => {
            const key = team.currentInnings + STRING_SEPERATOR + team.teamId
            formattedData[key] = { ...team, "teamPlayers": findPlayersFormList(commentaryData, team.currentInnings, team.teamId) }
        });
        setFormattedDetails(formattedData)
    }
    const handleBackClick = () => {
        navigate(navigateTo);
    };
    return <>
        {isDataLoading && <SpinnerModel />}
        <ShortCommentaryScreen
            commentaryData={commentaryData || {}}
            CommentaryFormatedData={formattedDetails || {}}
            totalInnings={matchTypeData.noOfIningsPerSide}
            backClick={handleBackClick}
        /></>
}
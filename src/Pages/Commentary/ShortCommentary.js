import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../../Features/axios"
import { updateToastData } from "../../Features/toasterSlice"
import { ERROR, PERMISSION_VIEW, STRING_SEPERATOR, TAB_COMMENTARY } from "../../components/Common/Const"
import ShortCommentaryScreen from "./ShortCommentary.jsx"
import SpinnerModel from "../../components/Model/SpinnerModel";
import { isEqual } from "lodash"
import { checkPermission } from "../../components/Common/Reusables/reusableMethods.js"
import { clearLoadingAndError } from "../../Features/Tabs/commentarySlice.js"

const navigateTo = "/commentary"
export const ShortCommentary = () => {
    const pageName = TAB_COMMENTARY
    const [commentaryData, setCommentaryData] = useState(undefined);
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [formattedDetails, setFormattedDetails] = useState({})
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const { isLoading, isRedirect } = useSelector(state => state.tabsData.commentary);
    const location = useLocation();
    const commentaryId = location.state?.commentaryId || "0";
    const dispatch = useDispatch();
    let navigate = useNavigate();

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
        dispatch(clearLoadingAndError())
    }, []);

    useEffect(() => {
        if (commentaryId !== "0") fetchData(commentaryId);
    }, [commentaryId]);

    useEffect(() => {
        if (!isLoading && isRedirect) navigate(navigateTo);
    }, [isRedirect]);

    const fetchData = async () => {
        setIsDataLoading(true)
        let commentaryDataToUpdate = {}
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId })
            .then(async (response) => {
                commentaryDataToUpdate = response?.result
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
        commentaryData?.commentaryTeams?.forEach(team => {
            const oppositTeam = isEqual(team.teamId, commentaryData.commentaryDetails.team1Id) ?
                commentaryData.commentaryDetails.team2Id : commentaryData.commentaryDetails.team1Id
            const key = team.currentInnings + STRING_SEPERATOR + team.teamId
            formattedData[key] = {
                ...team,
                "oppositeTeam": oppositTeam,
                "teamPlayers": findPlayersFormList(commentaryData, team.currentInnings, team.teamId),
                "bowlers": findPlayersFormList(commentaryData, team.currentInnings, oppositTeam)
            }
        });
        setFormattedDetails(formattedData)
    }
    const handleBackClick = () => {
        navigate(navigateTo);
    };
    return <>
        {(isDataLoading || isLoading) ? <SpinnerModel /> :
            <ShortCommentaryScreen
                commentaryData={commentaryData || {}}
                CommentaryFormatedData={formattedDetails || {}}
                totalInnings={commentaryData?.matchTypeDetails?.noOfIningsPerSide}
                backClick={handleBackClick}
            />}

    </>
}
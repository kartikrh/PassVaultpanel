import React, { useEffect, useRef, useState } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import Table from "../../Common/Table";
import axiosInstance from "../../../Features/axios";
import { useDispatch, useSelector } from "react-redux";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR, PERMISSION_VIEW, TAB_COMMENTARY, TAB_COMMENTARY_LIST } from "../../Common/Const";
import SpinnerModel from "../SpinnerModel";
import { Tooltip } from "antd";
import { checkPermission, convertDateUTCToLocalWithoutSec24 } from "../../Common/Reusables/reusableMethods";

const Index = ({
    commentaryPlayedModelVisible,
    setCommentaryPlayedModelVisible,
    playerRecord,
}) => {
    const [playedCommentaries, setPlayedCommentaries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const commmentaryRef = useRef(null);
    const [openCommentaryDetails, setOpenCommentaryDetails] = useState([
        "commentary-details",
    ]);
    const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
    const CommentaryListPage = TAB_COMMENTARY_LIST;
    const CommentaryPage = TAB_COMMENTARY;
    const dispatch = useDispatch();

    const toggle = (id) => {
        setOpenCommentaryDetails((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const fetchTemplateByComm = async (playerId) => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                "/admin/player/playCommentaryList",
                {
                    playerId: playerId,
                }
            );
            setPlayedCommentaries(response?.result)
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            dispatch(
                updateToastData({
                    data: error?.message,
                    title: error?.title,
                    type: ERROR,
                })
            );
        }
    };

    useEffect(() => {
        if (playerRecord?.playerId) {
            fetchTemplateByComm(playerRecord.playerId);
        }
    }, [playerRecord]);

    const commentaryPermission = checkPermission(permissionObj, CommentaryPage, PERMISSION_VIEW);
    const commentaryListPermission = checkPermission(permissionObj, CommentaryListPage, PERMISSION_VIEW);

    const handleCommentaryClick = (details) => {
        const navUrl = (commentaryPermission && commentaryListPermission) ? "/Commentary" : commentaryPermission ? "/Commentary" : commentaryListPermission ? "/CommentaryList" : ''
        const url = new URL(window.location.origin + navUrl);
        sessionStorage.setItem(
            "commentaryEventTypeId",
            "" + details?.eventTypeId
        );
        sessionStorage.setItem(
            "commentaryCompetitionId",
            "" + details?.competitionId
        );
        sessionStorage.setItem(
            "setCommentaryStatusToAll",
            "true"
        );
        sessionStorage.setItem(
            "playedCommentaryId",
            "" + details?.commentaryId
        );
        window.open(url.href, "_blank");
        sessionStorage.removeItem("commentaryEventTypeId");
        sessionStorage.removeItem("commentaryCompetitionId");
        sessionStorage.removeItem("setCommentaryStatusToAll");
        sessionStorage.removeItem("playedCommentaryId");
    };

    const handleCompetitionClick = (details) => {
        const url = new URL(window.location.origin + "/Competition");
        sessionStorage.setItem(
            "playerCompetitionDetails",
            "" + details?.competition
        );
        window.open(url.href, "_blank");
        sessionStorage.removeItem("playerCompetitionDetails");
    };

    const commentaryStatus = {
        1: "Open",
        2: "Toss Done",
        3: "In-Progress",
        4: "Completed",
        5: "Innings Break",
        10: "Cancelled"
    };

    const columns = [
        {
            title: "",
            dataIndex: "commentaryList",
            key: "commentaryList",
            render: (text, record) => {
                return (
                    <Tooltip
                        title={"Commentary List"}
                        color={"#e8e8ea"}
                        overlayInnerStyle={{ color: "#000" }}
                    >
                        <Button
                            color={"primary"}
                            size="sm"
                            className="btn"
                            onClick={() => handleCommentaryClick(record)}
                        >
                            CL
                        </Button>
                    </Tooltip>
                );
            },
            // sort: true,
            style: { width: "5%" },
        },
        {
            title: "CID",
            dataIndex: "commentaryId",
            key: "commentaryId",
            style: { width: "10%" },
            sort: true,
        },
        {
            title: "Event",
            dataIndex: "eventName",
            key: "eventName",
            style: { width: "10%" },
        },
        {
            title: "Competition",
            dataIndex: "competition",
            render: (text, record) => (
                <span style={{ cursor: "pointer" }} onClick={() => { handleCompetitionClick(record) }}>{text}</span>
            ),
            key: "competition",
            style: { width: "10%" },
        },
        {
            title: "Match Type",
            dataIndex: "matchType",
            key: "matchType",
            style: { width: "10%" },
        },
        {
            title: "TPID",
            dataIndex: "tpId",
            key: "tpId",
            style: { width: "10%" },
            sort: true,
        },
        {
            title: "Event Date",
            dataIndex: "eventDate",
            render: (text, record) => (
                <span>
                    {convertDateUTCToLocalWithoutSec24(text, "index")}
                </span>
            ),
            key: "eventDate",
            style: { width: "10%" },
            sort: true,
        },
        {
            title: "Status",
            dataIndex: "commentaryStatus",
            key: "commentaryStatus",
            render: (value) => commentaryStatus[value] || "",
            style: { width: "10%" },
            sort: true,
        },
    ];

    const tableElement = {
        title: "Player Commentary Listing",
        isNonCrud: true,
    };

    return (
        <Modal
            isOpen={commentaryPlayedModelVisible}
            toggle={() => {
                setCommentaryPlayedModelVisible(false);
            }}
            size="xl"
            // style={{ maxWidth: "80%", height: "80vh" }}
            centered
        >
            <ModalHeader
                className="bg-light p-3"
                id="exampleModalLabel"
                toggle={() => {
                    setCommentaryPlayedModelVisible(false);
                }}
            >
                {playerRecord?.playerName} [{playerRecord?.playerId}] Commentary Details
            </ModalHeader>
            <div className="tablelist-form">
                <ModalBody>
                    <div
                        className="d-flex flex-column justify-content-center"
                        id="modal-id"
                    >
                        {isLoading && <SpinnerModel />}
                        <Accordion open={openCommentaryDetails} toggle={toggle}>
                            <AccordionItem>
                                <AccordionHeader targetId={"commentary-details"} className="market-category-header">
                                    <span style={{ color: "green", fontWeight: "600" }}>Commentaries</span>
                                </AccordionHeader>
                                <AccordionBody accordionId={"commentary-details"} className="market-category-body p-0">
                                    <Table
                                        ref={commmentaryRef}
                                        columns={columns}
                                        dataSource={playedCommentaries}
                                        tableElement={tableElement}
                                        maxTableHeight="300px"
                                    />
                                </AccordionBody>
                            </AccordionItem>
                        </Accordion>
                        <div className="hstack justify-content-end mt-4">
                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={() => {
                                    setCommentaryPlayedModelVisible(false);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default Index;
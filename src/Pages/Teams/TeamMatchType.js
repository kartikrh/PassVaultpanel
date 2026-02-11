import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
    Button,
    Collapse,
    Label,
} from "reactstrap";
import { Tooltip, Switch, Avatar } from "antd";
import Select from "react-select";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { isEmpty } from "lodash";
import {
    ERROR,
    PERMISSION_VIEW,
    SUCCESS,
    TAB_TEAMS,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import DeleteModel from "../../components/Model/DeleteModel";
import ImageField from "../../components/Common/Reusables/ImageField";

const TeamMatchType = () => {
    const pageName = TAB_TEAMS;
    const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
    document.title = "Match Type Image Selection";

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [teamId, setTeamId] = useState(
        +sessionStorage.getItem('teamId') || "0"
    );
    const [matchTypes, setMatchTypes] = useState([]);
    const [selectedMatchType, setSelectedMatchType] = useState(null);
    const [openAccordions, setOpenAccordions] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState({}); // {teamMatchTypeId: [{value, label}]}
    const [allPlayers, setAllPlayers] = useState([]);
    const [deleteModelVisible, setDeleteModelVisible] = useState(false);
    const [teamMatchTypeIdToDelete, setTeamMatchTypeIdToDelete] = useState(null);
    const [selectedJerseyImages, setSelectedJerseyImages] = useState({});
    const [jerseyImagePreviews, setJerseyImagePreviews] = useState({});

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fetchData = async (id) => {
        setIsLoading(true);
        await axiosInstance
            .post("/admin/teamMatchType/byTeamId", {
                teamId: id,
            })
            .then((response) => {
                const apiData = response?.result || [];
                setData(apiData);

                // Initialize selected players with existing players from byTeamId response
                const initialSelectedPlayers = {};
                apiData.forEach((matchType) => {
                    initialSelectedPlayers[matchType.teamMatchTypeId] =
                        (matchType.players || []).map(player => ({
                            value: player.refPlayerId,
                            label: player.playerName
                        }));
                });
                setSelectedPlayers(initialSelectedPlayers);

                // Open first accordion by default
                if (apiData.length > 0) {
                    setOpenAccordions([apiData[0].teamMatchTypeId]);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                dispatch(
                    updateToastData({
                        data: error?.message,
                        title: error?.title,
                        type: ERROR,
                    })
                );
                setIsLoading(false);
            });
    };

    // Fetch all match types for dropdown
    const fetchMatchTypes = async () => {
        setIsLoading(true);
        await axiosInstance
            .post("admin/competition/getMatchTypes", {})
            .then((response) => {
                setMatchTypes(response?.result || []);
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);
            });
    };

    // Fetch all players for dropdown
    const fetchPlayerList = async () => {
        await axiosInstance
            .post("/admin/team/playerList", {})
            .then((response) => {
                setAllPlayers(response?.result || []);
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

    // Add new match type
    const handleAdd = async () => {
        if (!selectedMatchType) {
            dispatch(
                updateToastData({
                    data: "Please select a match type",
                    title: "Warning",
                    type: "warning",
                })
            );
            return;
        }

        setIsLoading(true);
        await axiosInstance
            .post("/admin/teamMatchType/save", {
                teamId: teamId,
                matchTypeId: selectedMatchType,
            })
            .then((response) => {
                fetchData(teamId);
                setSelectedMatchType(null);
                dispatch(
                    updateToastData({
                        data: response?.message,
                        title: response?.title,
                        type: SUCCESS,
                    })
                );
            })
            .catch((error) => {
                setIsLoading(false);
                dispatch(
                    updateToastData({
                        data: error?.message,
                        title: error?.title,
                        type: ERROR,
                    })
                );
            });
    };

    // const handleSave = async (teamMatchTypeId) => {
    //     const playerIds = (selectedPlayers[teamMatchTypeId] || []).map(player => player.value);

    //     setIsLoading(true);
    //     await axiosInstance
    //         .post("/admin/teamMatchType/update", {
    //             teamMatchTypeId: teamMatchTypeId,
    //             newPlayerIds: playerIds,
    //         })
    //         .then((response) => {
    //             dispatch(
    //                 updateToastData({
    //                     data: response?.message,
    //                     title: response?.title,
    //                     type: SUCCESS,
    //                 })
    //             );
    //             setIsLoading(false);
    //         })
    //         .catch((error) => {
    //             setIsLoading(false);
    //             dispatch(
    //                 updateToastData({
    //                     data: error?.message,
    //                     title: error?.title,
    //                     type: ERROR,
    //                 })
    //             );
    //         });
    // };

    const handleSave = async (teamMatchTypeId) => {
        const playerIds = (selectedPlayers[teamMatchTypeId] || []).map(
            (player) => player.value
        );

        const formData = new FormData();
        formData.append("teamMatchTypeId", teamMatchTypeId);
        formData.append("newPlayerIds", JSON.stringify(playerIds));

        // Add jersey image if selected
        if (selectedJerseyImages[teamMatchTypeId]) {
            formData.append("jerseyImage", selectedJerseyImages[teamMatchTypeId]);
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.post(
                "/admin/teamMatchType/update",
                formData
            );

            // Clear selected image and preview after successful save
            setSelectedJerseyImages({
                ...selectedJerseyImages,
                [teamMatchTypeId]: null,
            });
            setJerseyImagePreviews({
                ...jerseyImagePreviews,
                [teamMatchTypeId]: null,
            });

            // Refresh data to show updated image
            fetchData(teamId);

            dispatch(
                updateToastData({
                    data: response?.data?.message,
                    title: response?.data?.title,
                    type: SUCCESS,
                })
            );
        } catch (error) {
            dispatch(
                updateToastData({
                    data: error?.response?.data?.message || error?.message,
                    title: error?.response?.data?.title || "Error",
                    type: ERROR,
                })
            );
        } finally {
            setIsLoading(false);
        }
    };



    // Save all changes
    // const handleSaveAll = async () => {
    //     setIsLoading(true);
    //     try {
    //         for (const item of data) {
    //             const playerIds = (selectedPlayers[item.teamMatchTypeId] || []).map(player => player.value);
    //             await axiosInstance.post("/admin/teamMatchType/update", {
    //                 teamMatchTypeId: item.teamMatchTypeId,
    //                 newPlayerIds: playerIds,
    //             });
    //         }
    //         dispatch(
    //             updateToastData({
    //                 data: "All changes saved successfully",
    //                 title: "Success",
    //                 type: SUCCESS,
    //             })
    //         );
    //         setIsLoading(false);
    //     } catch (error) {
    //         setIsLoading(false);
    //         dispatch(
    //             updateToastData({
    //                 data: error?.message,
    //                 title: error?.title,
    //                 type: ERROR,
    //             })
    //         );
    //     }
    // };

    // Toggle active/inactive
    const handleActiveToggle = async (teamMatchTypeId, currentStatus) => {
        setIsLoading(true);
        await axiosInstance
            .post("/admin/teamMatchType/activeInactive", {
                teamMatchTypeId: teamMatchTypeId,
                isActive: !currentStatus,
            })
            .then((response) => {
                fetchData(teamId);
                dispatch(
                    updateToastData({
                        data: response?.message,
                        title: response?.title,
                        type: SUCCESS,
                    })
                );
            })
            .catch((error) => {
                setIsLoading(false);
                dispatch(
                    updateToastData({
                        data: error?.message,
                        title: error?.title,
                        type: ERROR,
                    })
                );
            });
    };

    const handleBackClick = () => {
        navigate("/teams");
    };

    const toggleAccordion = (id) => {
        if (openAccordions.includes(id)) {
            setOpenAccordions(openAccordions.filter((item) => item !== id));
        } else {
            setOpenAccordions([...openAccordions, id]);
        }
    };

    // Handle player selection change
    const handlePlayerSelectionChange = (teamMatchTypeId, selectedPlayerObjects) => {
        setSelectedPlayers({
            ...selectedPlayers,
            [teamMatchTypeId]: selectedPlayerObjects,
        });
    };

    const getAvailablePlayers = (teamMatchTypeId) => {
        const selectedIds = (selectedPlayers[teamMatchTypeId] || []).map(p => p.value);
        return allPlayers.filter(
            player => !selectedIds.includes(player.playerId)
        );
    };

    // Delete match type
    const handleDelete = async () => {
        setIsLoading(true);
        setDeleteModelVisible(false);
        await axiosInstance
            .post("/admin/teamMatchType/delete", {
                teamMatchTypeId: teamMatchTypeIdToDelete,
            })
            .then((response) => {
                fetchData(teamId);
                setTeamMatchTypeIdToDelete(null);
                dispatch(
                    updateToastData({
                        data: response?.message,
                        title: response?.title,
                        type: SUCCESS,
                    })
                );
            })
            .catch((error) => {
                setIsLoading(false);
                dispatch(
                    updateToastData({
                        data: error?.message,
                        title: error?.title,
                        type: ERROR,
                    })
                );
            });
    };

    const handleDeleteClick = (teamMatchTypeId) => {
        setTeamMatchTypeIdToDelete(teamMatchTypeId);
        setDeleteModelVisible(true);
    };

    const handleJerseyImageChange = (teamMatchTypeId, field, event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedJerseyImages({
                ...selectedJerseyImages,
                [teamMatchTypeId]: file,
            });
            setJerseyImagePreviews({
                ...jerseyImagePreviews,
                [teamMatchTypeId]: URL.createObjectURL(file),
            });
        }
    };

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
            navigate("/dashboard");
        }
    }, [permissionObj]);

    useEffect(() => {
        if (teamId !== "0") {
            fetchPlayerList();
            fetchData(teamId);
            fetchMatchTypes();
        }
    }, [teamId]);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Breadcrumbs
                        title="ScoreCard"
                        breadcrumbItem="Match Type Image Selection"
                    />
                    {isLoading && <SpinnerModel />}

                    {/* Header Row with Match Type Filter, Add Button, Save & Back */}
                    <Row className="mb-3">
                        <Col xs={12} md={6} className="d-flex align-items-center gap-2">
                            {/* <Label className="mb-0" style={{ whiteSpace: "nowrap" }}>
                                Match Type:
                            </Label> */}
                            <Select
                                styles={{
                                    control: (provided) => ({ ...provided, width: 250 }),
                                }}
                                placeholder="Select Match Type"
                                classNamePrefix="filter-dropdown"
                                value={
                                    matchTypes.find(
                                        (type) => type.matchTypeId === selectedMatchType
                                    )
                                        ? {
                                            value: selectedMatchType,
                                            label: matchTypes.find(
                                                (type) => type.matchTypeId === selectedMatchType
                                            ).matchType,
                                        }
                                        : null
                                }
                                options={matchTypes.map((type) => ({
                                    value: type.matchTypeId,
                                    label: type.matchType,
                                }))}
                                onChange={(option) => setSelectedMatchType(option?.value)}
                                filterOption={(option, inputValue) =>
                                    option.label
                                        .toLowerCase()
                                        .includes(inputValue.toLowerCase())
                                }
                            />
                            <Button color="primary" size="sm" onClick={handleAdd}>
                                ADD
                            </Button>
                        </Col>
                        <Col xs={12} md={6} className="d-flex justify-content-end align-items-center gap-2">
                            {/* <Button color="primary" onClick={handleSaveAll}>
                                Save
                            </Button> */}
                            <Button color="danger" onClick={handleBackClick}>
                                Back
                            </Button>
                        </Col>
                    </Row>

                    {/* Accordion for Match Types */}
                    {data.length > 0 ? (
                        data.map((matchTypeData) => (
                            <Card key={matchTypeData.teamMatchTypeId} className="mb-3">
                                <CardBody>
                                    {/* Accordion Header */}
                                    <div
                                        className="d-flex justify-content-between align-items-center"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleAccordion(matchTypeData.teamMatchTypeId)}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <i
                                                className={`bx ${openAccordions.includes(matchTypeData.teamMatchTypeId)
                                                    ? "bx-chevron-down"
                                                    : "bx-chevron-right"
                                                    }`}
                                                style={{ fontSize: "20px" }}
                                            ></i>
                                            <h5 className="mb-0">{matchTypeData.matchType}</h5>
                                        </div>
                                        <div className="d-flex align-items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Tooltip title={matchTypeData.isActive ? "Active" : "Inactive"}>
                                                <Switch
                                                    className="primary-switch"
                                                    checked={matchTypeData.isActive}
                                                    onChange={() =>
                                                        handleActiveToggle(
                                                            matchTypeData.teamMatchTypeId,
                                                            matchTypeData.isActive
                                                        )
                                                    }
                                                    checkedChildren="Active"
                                                    unCheckedChildren="Inactive"
                                                />
                                            </Tooltip>
                                            <Button
                                                color="primary"
                                                size="sm"
                                                onClick={() => handleSave(matchTypeData.teamMatchTypeId)}
                                            >
                                                Save
                                            </Button>
                                            <Tooltip title="Delete">
                                                <Button
                                                    color="soft-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(matchTypeData.teamMatchTypeId)}
                                                >
                                                    <i className="ri-delete-bin-2-line"></i>
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    {/* Accordion Content */}
                                    <Collapse isOpen={openAccordions.includes(matchTypeData.teamMatchTypeId)}>
                                        <div className="mt-3">
                                            <Row>
                                                {/* Left Side - Team Jersey Image */}
                                                <Col xs={12} md={3} className="text-center">
                                                    <ImageField
                                                        field={{
                                                            name: `jersey_${matchTypeData.teamMatchTypeId}`,
                                                            isValidateImage: true,
                                                            validateWidth: 664,
                                                            validateHeight: 254,
                                                        }}
                                                        handleImageChange={(field, event) =>
                                                            handleJerseyImageChange(matchTypeData.teamMatchTypeId, field, event)
                                                        }
                                                        src={
                                                            jerseyImagePreviews[matchTypeData.teamMatchTypeId] ||
                                                            matchTypeData.teamJerseyImage ||
                                                            null
                                                        }
                                                    />
                                                </Col>

                                                {/* Right Side - Player Selection Dropdown */}
                                                <Col xs={12} md={9}>
                                                    <Label>Select Players:</Label>
                                                    <Select
                                                        isMulti
                                                        placeholder="Select players"
                                                        classNamePrefix="filter-dropdown"
                                                        value={selectedPlayers[matchTypeData.teamMatchTypeId] || []}
                                                        options={getAvailablePlayers(matchTypeData.teamMatchTypeId).map((player) => ({
                                                            value: player.playerId,
                                                            label: player.playerName,
                                                        }))}
                                                        onChange={(values) =>
                                                            handlePlayerSelectionChange(
                                                                matchTypeData.teamMatchTypeId,
                                                                values || []
                                                            )
                                                        }
                                                        filterOption={(option, inputValue) =>
                                                            option.label
                                                                .toLowerCase()
                                                                .includes(inputValue.toLowerCase())
                                                        }
                                                    />

                                                    {allPlayers.length === 0 && (
                                                        <div className="text-center text-muted mt-3">
                                                            No players available
                                                        </div>
                                                    )}
                                                </Col>
                                            </Row>
                                        </div>
                                    </Collapse>
                                </CardBody>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardBody>
                                <div className="text-center text-muted py-4">
                                    No match types found. Please add a match type.
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </Container>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteModel
                deleteModelVisable={deleteModelVisible}
                setDeleteModelVisable={setDeleteModelVisible}
                handleDelete={handleDelete}
            />
        </React.Fragment>
    );
};

export default TeamMatchType;
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { MatchDetailFields, ExtraInfoFields, PitchDetailsFields, TeamDetailsFields, WeatherDetailsFields } from '../../constants/FieldConst/CommentaryConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_COMMENTARY, TAB_COMMENTARY_LIST, SWITCH, SELECT } from '../../components/Common/Const';
import { addCommentaryToDb, updateSavedState } from '../../Features/Tabs/commentarySlice';
import axiosInstance from '../../Features/axios';
import classnames from "classnames";
import { convertDateLocalToUTC, convertDateUTCToLocal } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from '../../Features/toasterSlice';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { isEmpty } from 'lodash';

const fetchResult = (response) => {
    return Array.isArray(response.result) ? response?.result : [response?.result]
}
const formatMultiSelectDataPlayers = (inputList) => {
    const outputList = [];

    inputList.forEach((item) =>
        item?.displayOrder !== undefined
            ? (outputList[item?.displayOrder - 1] = item?.playerId)
            : outputList.push(item?.playerId)
    );

    return outputList;
};
function AddCommentary() {
    const pageName = TAB_COMMENTARY
    const finalizeRef1 = useRef(null);
    const finalizeRef2 = useRef(null);
    const finalizeRef3 = useRef(null);
    const finalizeRef4 = useRef(null);
    const finalizeRef5 = useRef(null);
    const [savedFormState, setSavedFormState] = useState({});
    const [activeTab, setactiveTab] = useState(1);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const [isFetchApiLoading, setIsFetchApiLoading] = useState(false);
    const [passedSteps, setPassedSteps] = useState([1]);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [competitionList, setCompetitionList] = useState([]);
    const [pythonList, setPythonList] = useState([]);
    const [masterData, setMasterData] = useState({});
    const [disabledFields, setDisabledFields] = useState({});
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.commentary);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const [id, setId] = useState(location.state?.userId || "0");
    const [competitionId, setCompetitionId] = useState(0);
    const [isFormAValid, setIsFormAValid] = useState(false);

    // useEffect(() => {
    //     if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
    //         navigate("/dashboard")
    //     }
    //     fetchMasterData()
    // }, [permissionObj]);
    const updateSavedFormState = (newFormData) => {
        setSavedFormState(prevState => {
            const merged = { ...prevState, ...newFormData };
            return merged;
        });
    };
    useEffect(() => {
      const hasCommentaryPermission = checkPermission(
        permissionObj,
        TAB_COMMENTARY,
        PERMISSION_VIEW
      );
      const hasCommentaryListPermission = checkPermission(
        permissionObj,
        TAB_COMMENTARY_LIST,
        PERMISSION_VIEW
      );

      if (
        !hasCommentaryPermission &&
        !hasCommentaryListPermission &&
        !isEmpty(permissionObj)
      ) {
        navigate("/dashboard");
      }
      fetchMasterData();
    }, [permissionObj]);

    // Add permission from either tab
    const canAdd = !isEmpty(permissionObj) &&
    (checkPermission(permissionObj, TAB_COMMENTARY, PERMISSION_ADD) ||
    checkPermission(permissionObj, TAB_COMMENTARY_LIST, PERMISSION_ADD));

    // Edit permission from either tab
    const canEdit = !isEmpty(permissionObj) &&
    (checkPermission(permissionObj, TAB_COMMENTARY, PERMISSION_EDIT) ||
    checkPermission(permissionObj, TAB_COMMENTARY_LIST, PERMISSION_EDIT));

    const canSaveOrClose = canAdd || canEdit;

    useEffect(() => {
        if (id !== "0") {
            fetchData(id);
            // setDisabledFields({
            //     // "eventTypeId": true,
            //     // "competitionId": true,
            //     // "eventId": true,
            //     // "team1Id": true,
            //     // "team2Id": true,
            //     // "team1Captain": true,
            //     // "team2Captain": true,
            //     // "team1Kipper": true,
            //     // "team2Kipper": true,
            //     // "team1Players": true,
            //     // "team2Players": true,
            //     // "matchTypeId": true,
            //     "addSystemPlayer": true,
            //     // "drsCount": true,
            //     "isVirtual": true,
            //     "isPredictMarket": true,
            //     "team1Id": true,
            //     "team2Id": true,
            // })
        }
    }, [id]);

    useEffect(() => {
        if (initialEditData) {
            const disabled = {
                // "eventTypeId": true,
                // "competitionId": true,
                // "eventId": true,
                // "team1Id": true,
                // "team2Id": true,
                // "team1Captain": true,
                // "team2Captain": true,
                // "team1Kipper": true,
                // "team2Kipper": true,
                // "team1Players": true,
                // "team2Players": true,
                // "matchTypeId": true,
                "addSystemPlayer": true,
                // "drsCount": true,
                "isVirtual": true,
                "isPredictMarket": true,
            };

            if (initialEditData?.commentaryStatus != 1) {
                disabled["team1Id"] = true;
                disabled["team2Id"] = true;
            }

            setDisabledFields(disabled);
        }
    }, [initialEditData]);

    useEffect(() => {
        if (isSaved) {
            dispatch(updateSavedState(undefined))
            if (currentSaveAction === SAVE) { }
            else if (currentSaveAction === SAVE_AND_CLOSE){
                let navLink = state === 'isPredict' ? '/CommentaryList' : "/commentary"
                navigate(navLink)
            }
            else if (currentSaveAction === SAVE_AND_NEW) {
                // console.log("Inside save and new")
                setDisabledFields({})
                setSavedFormState({})
                setInitialEditData(undefined)
                setId("0");
                finalizeRef1.current.resetForm()
                finalizeRef2.current.resetForm()
                finalizeRef3.current.resetForm()
                finalizeRef4.current.resetForm()
                finalizeRef5.current.resetForm()
                setactiveTab(1);
            }
            setCurrentSaveAction(undefined)
        }
    }, [isSaved]);

    const handleFormADataChange = (newFormData) => {
        // setSavedFormState({...savedFormState, ...newFormData});
        const allowedFields = MatchDetailFields.map(field => field.name).filter(Boolean);
        const filteredData = Object.fromEntries(
            Object.entries(newFormData).filter(([key]) => allowedFields.includes(key))
        );
        updateSavedFormState(filteredData);
        setCompetitionId(newFormData["competitionId"]);
        const requiredFields = ["competitionId", "eventTypeId", "matchTypeId", "eventName", "eventDate"];
        const isValid = requiredFields.every(
           (field) => newFormData[field] && newFormData[field] !== "0"
        );
        setIsFormAValid(isValid);

        if (newFormData["competitionId"] && newFormData["competitionId"] != 0 && newFormData["competitionId"] !== savedFormState["competitionId"]) {
            setIsApiLoading(true);
            axiosInstance.post('/admin/commentary/teamList', { competitionId : newFormData["competitionId"] })
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item?.teamName, value: item?.teamId }
                }).filter(element => element.value);
                setMasterData((preData) => ({
                    ...preData,
                    "team1Id": formattedData,
                    "team2Id": formattedData
                }));
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });
        }    
        if (newFormData["eventTypeId"] !== savedFormState["eventTypeId"]) {
            setMasterData((preData) => ({
                ...preData,
                "competitionId": [],
            }));
            if (newFormData["eventTypeId"] !== "0") {
                setIsApiLoading(true);
                axiosInstance.post('/admin/commentary/competitionListByEventTypeId', { eventTypeId: newFormData["eventTypeId"] })
                    .then((response) => {
                        const resultData = fetchResult(response);
                        setCompetitionList(resultData);
                        const formattedData = resultData?.map(item => {
                            return { label: item?.competition, value: item?.competitionId }
                        })
                        setMasterData((preData) => ({
                            ...preData,
                            "competitionId": formattedData,
                        }));
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
            } else {
                setMasterData((preData) => ({
                    ...preData,
                    "competitionId": [],
                }));
            }
        } else if (newFormData["competitionId"] !== savedFormState["competitionId"]) {
            setMasterData((preData) => ({
                ...preData,
                "eventId": [],
            }));
            if (newFormData["competitionId"] !== "0") {
                setIsApiLoading(true);
                axiosInstance.post('/admin/commentary/eventListByCompetitionId', { competitionId: newFormData["competitionId"] })
                    .then((response) => {
                        const resultData = fetchResult(response)
                        const formattedData = resultData?.map(item => {
                            return { label:  `${item?.eventName} - ${convertDateUTCToLocal(item?.eventDate, "index")}`, value: item?.eventId }
                        })
                        setMasterData((preData) => ({
                            ...preData,
                            "eventId": formattedData,
                        }));
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
                const selectedCompetition = competitionList.find(item => item?.competitionId == newFormData["competitionId"]);
                if (selectedCompetition) {
                    const { matchTypeId, drsCount, isVirtual, pythonId, countryId } = selectedCompetition;
                    finalizeRef1.current.updateFormFromParent({ matchTypeId });
                    finalizeRef2.current.updateFormFromParent({ drsCount });
                    finalizeRef3.current.updateFormFromParent({ isVirtual });
                    finalizeRef3.current.updateFormFromParent({ pythonId });
                    finalizeRef4.current.updateFormFromParent({ countryId });
                }
            } else {
                setMasterData((preData) => ({
                    ...preData,
                    "eventId": [],
                }));
            }
        } else if (newFormData["eventId"] !== savedFormState["eventId"]) {
            const resetData = {
                "eventRefId": undefined,
                "eventName": undefined,
                "eventDate": undefined,
                "location": undefined,
            }
            setMasterData((preData) => ({
                ...preData,
                ...resetData
            }));
            if (newFormData["eventId"] !== "0") {
                setIsApiLoading(true);
                axiosInstance.post('/admin/commentary/eventDataById', { eventId: newFormData["eventId"] })
                    .then((response) => {
                        const updatedData = {
                            "eventRefId": response?.result?.refId,
                            "eventName": response?.result?.eventName,
                            "eventDate": convertDateLocalToUTC(response?.result?.eventDate),
                            "location": response?.result?.venue,
                        }
                        setMasterData((preData) => ({
                            ...preData,
                            ...updatedData
                        }));
                        finalizeRef1.current.updateFormFromParent(updatedData)
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
            } else {
                setMasterData((preData) => ({
                    ...preData,
                    ...resetData
                }));
                finalizeRef1.current.updateFormFromParent(resetData)
            }
        }
    }
    const handleFormBDataChange = (newFormData) => {
        // setSavedFormState({...savedFormState, ...newFormData});
        const allowedFields = TeamDetailsFields.map(field => field.name).filter(Boolean);
        const filteredData = Object.fromEntries(
            Object.entries(newFormData).filter(([key]) => allowedFields.includes(key))
        );
        updateSavedFormState(filteredData);;
        
        // if both data are not same then do API call and fetch data
        if (newFormData["team1Id"] !== savedFormState["team1Id"]) {
            if (newFormData["team1Id"] !== "0") {
                // const resetValues = {
                //     team1Captain: null,
                //     team1Kipper: null,
                //     team1Players: []
                // };
                // updateSavedFormState(resetValues);
                // finalizeRef2.current.updateFormFromParent(resetValues);
                setIsApiLoading(true);
                axiosInstance.post('/admin/player/byTeamIdv1', { teamId: newFormData["team1Id"], competitionId})
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item?.playerName, value: item?.playerId }
                        }).filter(element => element.value);
                        setMasterData((preData) => ({
                            ...preData,
                            "team1Captain": formattedData,
                            "team1Kipper": formattedData,
                            "team1Players": formattedData
                        }));
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
            }
            else {
                setMasterData((preData) => ({
                    ...preData,
                    "team1Captain": [],
                    "team1Kipper": [],
                    "team1Players": []
                }));
            }
        } else if (newFormData["team2Id"] !== savedFormState["team2Id"]) {
            if (newFormData["team2Id"] !== "0") {
                // const resetValues = {
                //     team2Captain: null,
                //     team2Kipper: null,
                //     team2Players: []
                // };
                // updateSavedFormState(resetValues);
                // finalizeRef2.current.updateFormFromParent(resetValues);
                setIsApiLoading(true);
                axiosInstance.post('/admin/player/byTeamIdv1', { teamId: newFormData["team2Id"],  competitionId })
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item?.playerName, value: item?.playerId }
                        }).filter(element => element.value);
                        setMasterData((preData) => ({
                            ...preData,
                            "team2Captain": formattedData,
                            "team2Kipper": formattedData,
                            "team2Players": formattedData
                        }));
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
            } else {
                setMasterData((preData) => ({
                    ...preData,
                    "team2Captain": [],
                    "team2Kipper": [],
                    "team2Players": []
                }));
            }
        }
    };

    const handleFormDDataChange = (newFormData) => {
        // setSavedFormState({...savedFormState, ...newFormData});
        const allowedFields = PitchDetailsFields.map(field => field.name).filter(Boolean);
        const filteredData = Object.fromEntries(
            Object.entries(newFormData).filter(([key]) => allowedFields.includes(key))
        );
        updateSavedFormState(filteredData);;
    }
    const handleFormEDataChange = (newFormData) => {
        // setSavedFormState({...savedFormState, ...newFormData});
        const allowedFields = ExtraInfoFields.map(field => field.name).filter(Boolean);
        const filteredData = Object.fromEntries(
            Object.entries(newFormData).filter(([key]) => allowedFields.includes(key))
        );
        updateSavedFormState(filteredData);;
    }

    const handleFormCDataChange = (newFormData) => {
        // setSavedFormState({...savedFormState, ...newFormData});
        const allowedFields = WeatherDetailsFields.map(field => field.name).filter(Boolean);
        const filteredData = Object.fromEntries(
            Object.entries(newFormData).filter(([key]) => allowedFields.includes(key))
        );
        updateSavedFormState(filteredData);;
        if (newFormData["countryId"] && newFormData["countryId"] !== "0") {
            setIsApiLoading(true);
            axiosInstance.post('/admin/list/venueList', { countryId: (newFormData["countryId"]) })
                .then((response) => {
                    const resultData = fetchResult(response);
                    // setCompetitionList(resultData);
                    const formattedData = resultData?.map(item => {
                        return { label: item?.name, value: item?.venueId }
                    })
                    setMasterData((preData) => ({
                        ...preData,
                        "location": formattedData,
                    }));
                    setIsApiLoading(false);
                }).catch((error) => {
                    dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    setIsApiLoading(false);
                });
        } else {
            setMasterData((preData) => ({
                ...preData,
                "location": [],
            }));
        }
    }

    const fetchData = async (id) => {
        let updateScreenData = {}
        let newMasterData = {}
        // setInitialEditData(response?.result);
        setIsFetchApiLoading(true);
        await axiosInstance.post('/admin/commentary/byId', { commentaryId: id })
            .then(async (response) => {
                updateScreenData = {
                    ...response?.result,
                    team1Players: formatMultiSelectDataPlayers(response?.result?.team1Players),
                    team2Players: formatMultiSelectDataPlayers(response?.result?.team2Players),
                    eventDate: convertDateLocalToUTC(response?.result?.eventDate),
                    addSystemPlayer: +response?.result?.systemPlayerCount > 0,
                    delay : String(response?.result?.delay)
                }
                // Fetch Competition Options based on EventTypeId
                await axiosInstance.post('/admin/commentary/competitionListByEventTypeId', { eventTypeId: updateScreenData["eventTypeId"] })
                    .then((response) => {
                        const resultData = fetchResult(response)
                        const formattedData = resultData?.map(item => {
                            return { label: item?.competition, value: item?.competitionId }
                        })
                        newMasterData = { ...newMasterData, competitionId: formattedData }
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    });
                // Fetch Events based on Competition
                await axiosInstance.post('/admin/commentary/eventListByCompetitionId', { competitionId: updateScreenData["competitionId"] })
                    .then((response) => {
                        const resultData = fetchResult(response)
                        const formattedData = resultData?.map(item => {
                            return { label:  `${item?.eventName} - ${convertDateUTCToLocal(item?.eventDate, "index")}`, value: item?.eventId }
                        })
                        newMasterData = { ...newMasterData, eventId: formattedData }
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    });
                await axiosInstance.post('/admin/commentary/playerListByTeamId', { teamId: updateScreenData["team1Id"] })
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item?.playerName, value: item?.playerId }
                        }).filter(element => element.value);
                        newMasterData = {
                            ...newMasterData,
                            "team1Captain": formattedData,
                            "team1Kipper": formattedData,
                            "team1Players": formattedData
                        };
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    });
                await axiosInstance.post('/admin/commentary/playerListByTeamId', { teamId: updateScreenData["team2Id"] })
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item?.playerName, value: item?.playerId }
                        }).filter(element => element.value);
                        newMasterData = {
                            ...newMasterData,
                            "team2Captain": formattedData,
                            "team2Kipper": formattedData,
                            "team2Players": formattedData
                        };
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    });
                // await axiosInstance.post('/admin/list/venueList', { countryId: updateScreenData["countryId"] })
                //     .then((response) => {
                //         const resultData = fetchResult(response);
                //         // setCompetitionList(resultData);
                //         const formattedData = resultData?.map(item => {
                //             return { label: item?.name, value: item?.venueId }
                //         })
                //         setMasterData((preData) => ({
                //             ...preData,
                //             "location": formattedData,
                //         }));
                //         setIsApiLoading(false);
                //     }).catch((error) => {
                //         dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                //         setIsApiLoading(false);
                //     });
                // await axiosInstance
                //     .post("/admin/list/countryList", {})
                //     .then((response) => {
                //         setMasterData((preData) => ({
                //         ...preData,
                //         countryId: response.result?.map((item) => {
                //             return { label: item.countryName, value: item.countryId };
                //         }),
                //         }));
                //     })
                //     .catch((error) => {
                //         dispatch(
                //         updateToastData({
                //             data: error?.message,
                //             title: error?.title,
                //             type: ERROR,
                //         })
                //         );
                //     });
                setIsFetchApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsFetchApiLoading(false);
            });
        setMasterData((preData) => ({
            ...preData,
            ...newMasterData
        }));
        setInitialEditData((preData) => ({
            ...preData,
            ...updateScreenData
        }));
    };

    const fetchMasterData = async () => {
        setIsApiLoading(true);
        axiosInstance.post('/admin/commentary/matchTypeList')
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item?.matchType, value: item?.matchTypeId }
                })
                setMasterData((preData) => ({
                    ...preData,
                    "matchTypeId": formattedData
                }));
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });
        setIsApiLoading(true);
        axiosInstance.post('/admin/commentary/allDifficulties')
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item?.difficulty, value: item?.id }
                })
                setMasterData((preData) => ({
                    ...preData,
                    "difficulty": formattedData
                }));
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });
        axiosInstance.post('/admin/commentary/pythonAPIs')
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item?.developerName, value: item?.id }
                })
                setPythonList(response?.result || []);
                setMasterData((preData) => ({
                    ...preData,
                    "pythonId": formattedData,
                }));
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });
        // setIsApiLoading(true);
        // axiosInstance.post('/admin/commentary/teamList', {})
        //     .then((response) => {
        //         const formattedData = response?.result?.map(item => {
        //             return { label: item?.teamName, value: item?.teamId }
        //         }).filter(element => element.value);
        //         setMasterData((preData) => ({
        //             ...preData,
        //             "team1Id": formattedData,
        //             "team2Id": formattedData
        //         }));
        //         setIsApiLoading(false);
        //     }).catch((error) => {
        //         dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        //         setIsApiLoading(false);
        //     });
        setIsApiLoading(true);
        axiosInstance.post('/admin/commentary/eventTypeList', {})
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item?.eventType, value: item?.eventTypeId }
                })
                setMasterData((preData) => ({
                    ...preData,
                    "eventTypeId": formattedData,
                }));
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });
        
        await axiosInstance
            .post("/admin/list/countryList", {})
            .then((response) => {
                setMasterData((preData) => ({
                ...preData,
                    countryId: response.result?.map((item) => {
                        return { label: item.countryName, value: item.countryId };
                    }),
                }));
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

    const handleSaveClick = async (saveAction) => {
        const dataToSave1 = finalizeRef1.current.finalizeData()
        const dataToSave2 = finalizeRef2.current.finalizeData()
        const dataToSave3 = finalizeRef3.current.finalizeData()
        const dataToSave4 = finalizeRef4.current.finalizeData()
        const dataToSave5 = finalizeRef5.current.finalizeData()

        // Filter each dataToSave to only include fields from their respective tabs
        const filteredDataToSave1 = {};
        const filteredDataToSave2 = {};
        const filteredDataToSave3 = {};
        const filteredDataToSave4 = {};
        const filteredDataToSave5 = {};
        
        // Filter Tab 1 data (Match Details)
        MatchDetailFields.forEach(field => {
            if (field.name && dataToSave1.hasOwnProperty(field.name)) {
                filteredDataToSave1[field.name] = dataToSave1[field.name];
            }
        });
        
        // Filter Tab 2 data (Team Details)
        TeamDetailsFields.forEach(field => {
            if (field.name && dataToSave2.hasOwnProperty(field.name)) {
                filteredDataToSave2[field.name] = dataToSave2[field.name];
            }
        });

        // Filter Tab 3 data (Extra Details)
        // if (dataToSave3 && typeof dataToSave3 === "object") {
            ExtraInfoFields.forEach(field => {
                if (field.name && dataToSave3.hasOwnProperty(field.name)) {
                    filteredDataToSave3[field.name] = dataToSave3[field.name];
                }
            });
        // }
        
        // Filter Tab 4 data (Weather Details)
        WeatherDetailsFields.forEach(field => {
            if (field.name && dataToSave4.hasOwnProperty(field.name)) {
                filteredDataToSave4[field.name] = dataToSave4[field.name];
            }
        });
        
        // Filter Tab 5 data (Pitch Details)
        PitchDetailsFields.forEach(field => {
            if (field.name && dataToSave5.hasOwnProperty(field.name)) {
                filteredDataToSave5[field.name] = dataToSave5[field.name];
            }
        });

        const pythonURI = pythonList && pythonList.length > 0 && pythonList.find((item) => item?.id == dataToSave3?.pythonId)?.URI;
        if (filteredDataToSave1 && filteredDataToSave2 && filteredDataToSave3 && filteredDataToSave4 && filteredDataToSave5) {
            // const dataToSave = {
            //     ...dataToSave1,
            //     ...dataToSave3,
            //     ...dataToSave4,
            //     "isActive": dataToSave1?.isActive ? dataToSave1.isActive : false,
            //     "isTest": dataToSave1?.isTest ? dataToSave1.isTest : false,
            //     "isVirtual": dataToSave1?.isVirtual ? dataToSave1.isVirtual : false,
            //     "isClientShow": dataToSave1?.isClientShow ? dataToSave1.isClientShow : false,
            //     "isCountInPoint": dataToSave1?.isCountInPoint ? dataToSave1.isCountInPoint : false,
            //     "team1Id": dataToSave2.team1Id,
            //     "team2Id": dataToSave2.team2Id,
            //     "team1Captain": dataToSave2.team1Captain,
            //     "team2Captain": dataToSave2.team2Captain,
            //     "team1Kipper": dataToSave2.team1Kipper,
            //     "team2Kipper": dataToSave2.team2Kipper,
            //     "isPredictMarket" : dataToSave1?.isPredictMarket || false,
            //     "team1Players": dataToSave2.team1Players,
            //     "team2Players": dataToSave2.team2Players,
            //     "addSystemPlayer" : dataToSave2?.addSystemPlayer ? dataToSave2.addSystemPlayer : false,
            //     "systemPlayerCount" :dataToSave2.addSystemPlayer ? dataToSave2.systemPlayerCount : "0",
            //     "drsCount": dataToSave2?.drsCount || 0,
            //     "pythonId": dataToSave1?.pythonId,
            //     "pythonURI": pythonURI,
            // }
            const allFields = [
            ...MatchDetailFields,
            ...PitchDetailsFields,
            ...TeamDetailsFields,
            ...WeatherDetailsFields,
            ...ExtraInfoFields
            ];

            const mergedData = {
            ...filteredDataToSave1,
            ...filteredDataToSave2,
            ...filteredDataToSave3,
            ...filteredDataToSave4,
            ...filteredDataToSave5
            };

            const completeData = {};
            allFields.forEach(({ name, type }) => {
            if (!name) return;
            let value = mergedData[name];

            if (value === "" || value === undefined) {
                value = null;
            }
            if (type === SELECT && (value === "0" || !value) && ["team1Captain", "team2Captain", "team1Kipper", "team2Kipper"].includes(name)) {
                completeData[name] = null;
            } else if (type === SELECT) {
                completeData[name] = value ?? 0;
            } else if (type === SWITCH) {
                completeData[name] = value ?? false;
            } else {
                completeData[name] = value ?? null;
            }
            });
            if (Array.isArray(completeData?.team1Players)) {
                completeData.team1Players = completeData.team1Players?.filter(id => id != null);
            }
            if (Array.isArray(completeData?.team2Players)) {
                completeData.team2Players = completeData.team2Players?.filter(id => id != null);
            }
            const extraData = {
                commentaryId: id,
                eventDate: convertDateLocalToUTC(dataToSave1.eventDate),
                pythonURI,
                isSignalROn: dataToSave1?.isSignalROn,
                // marketId: "0", tpId: "0", matchTypeId: "0"
                // , currentInnings: 0
            }
            setCurrentSaveAction(saveAction);
            dispatch(addCommentaryToDb({ ...completeData, ...extraData }))
        }
    };


    function toggleTab(tab) {
        if (activeTab !== tab) {
            var modifiedSteps = [...passedSteps, tab];
            if (tab >= 1 && tab <= 5) {
                setactiveTab(tab);
                setPassedSteps(modifiedSteps);
            }
        }
    }

    const handleBackClick = () => {
        let navLink = state === 'isPredict' ? '/CommentaryList' : "/commentary"
        navigate(navLink);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3 className="modal-header-title">{state === 'isPredict' ? 'Commentary List' : 'Commentary'}</h3>
                        </Col>
                        {(isLoading || isApiLoading || isFetchApiLoading) && <SpinnerModel />}
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col className='mb-3 text-end' xs={12}>
                                        <button className="btn btn-danger mx-1" onClick={handleBackClick}>Back</button>
                                        {activeTab !== 1 &&
                                            <ButtonDropdown
                                                direction="down"
                                                isOpen={drp_up}
                                                toggle={() => setDrp_up(!drp_up)}
                                            >
                                                {/* <Button
                                                    disabled={
                                                        !(checkPermission(permissionObj, pageName, PERMISSION_ADD) ||
                                                            checkPermission(permissionObj, pageName, PERMISSION_EDIT))}
                                                    id="caret" color="primary" onClick={() => { handleSaveClick(SAVE_AND_CLOSE) }}>
                                                    Save & Close
                                                </Button> */}
                                                <Button
                                                    disabled={!canSaveOrClose}
                                                    id="caret" color="primary" onClick={() => { handleSaveClick(SAVE_AND_CLOSE) }}>
                                                    Save & Close
                                                </Button>
                                                <DropdownToggle caret color="primary">
                                                    <i className="mdi mdi-chevron-down" />
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {canEdit 
                                                        && <DropdownItem onClick={() => { handleSaveClick(SAVE) }}>Save</DropdownItem>
                                                    }
                                                    {canAdd 
                                                        && <DropdownItem onClick={() => { handleSaveClick(SAVE_AND_NEW) }}>Save & New</DropdownItem>
                                                    }
                                                </DropdownMenu>
                                            </ButtonDropdown>
                                        }
                                    </Col>
                                </Row>
                                <div id="basic-pills-wizard" className="twitter-bs-wizard">
                                    <ul className="twitter-bs-wizard-nav nav nav-pills nav-justified">
                                        <NavItem className={classnames({ active: activeTab === 1 })}>
                                            <NavLink
                                                data-toggle="tab"
                                                className={classnames({ active: activeTab === 1 })}
                                                onClick={() => {
                                                    setactiveTab(1);
                                                }}
                                            >
                                                <span className="step-number">01</span>
                                                <span className="step-title" style={{ paddingLeft: "10px" }}>Match Details</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className={classnames({ active: activeTab === 2 })}>
                                            <NavLink
                                                data-toggle="tab"
                                                disabled={!isFormAValid}
                                                className={classnames({ active: activeTab === 2 })}
                                                onClick={() => {
                                                    setactiveTab(2);
                                                }}
                                            >
                                                <span className="step-number">02</span>
                                                <span className="step-title" style={{ paddingLeft: "10px" }}>Team Detail</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className={classnames({ active: activeTab === 3 })}>
                                            <NavLink
                                                data-toggle="tab"
                                                disabled={!isFormAValid}
                                                className={classnames({ active: activeTab === 3 })}
                                                onClick={() => {
                                                    setactiveTab(3);
                                                }}
                                            >
                                                <span className="step-number">03</span>
                                                <span className="step-title" style={{ paddingLeft: "10px" }}>Extra Info </span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className={classnames({ active: activeTab === 4 })}>
                                            <NavLink
                                                data-toggle="tab"
                                                disabled={!isFormAValid}
                                                className={classnames({ active: activeTab === 4 })}
                                                onClick={() => {
                                                    setactiveTab(4);
                                                }}
                                            >
                                                <span className="step-number">04</span>
                                                <span className="step-title" style={{ paddingLeft: "10px" }}>Weather Details </span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className={classnames({ active: activeTab === 5 })}>
                                            <NavLink
                                                data-toggle="tab"
                                                disabled={!isFormAValid}
                                                className={classnames({ active: activeTab === 5 })}
                                                onClick={() => {
                                                    setactiveTab(5);
                                                }}
                                            >
                                                <span className="step-number">05</span>
                                                <span className="step-title" style={{ paddingLeft: "10px" }}>Pitch Details </span>
                                            </NavLink>
                                        </NavItem>
                                    </ul>
                                    {activeTab === 2 && savedFormState.eventName && (
                                        <div className="mb-1 p-2 bg-light border">
                                            <h6 className="mb-0 font-medium event-Name">Event Name: {savedFormState.eventName}</h6>
                                        </div>
                                    )}
                                    <TabContent activeTab={activeTab} className="twitter-bs-wizard-tab-content">
                                        <TabPane tabId={1}>
                                            <FormBuilder
                                                ref={finalizeRef1}
                                                // fields={MatchDetailFields}
                                                fields={MatchDetailFields.filter(field => state === 'isPredict' ? field.name !== "isPredictMarket" && field.name !== "isTest" : true)}
                                                editFormData={initialEditData}
                                                masterData={masterData}
                                                disabledFields={disabledFields}
                                                onFormDataChange={handleFormADataChange}
                                                pageName="Commentary"
                                            />
                                        </TabPane>
                                        <TabPane tabId={2}>
                                            <FormBuilder
                                                ref={finalizeRef2}
                                                fields={TeamDetailsFields}
                                                editFormData={initialEditData}
                                                masterData={masterData}
                                                disabledFields={disabledFields}
                                                onFormDataChange={handleFormBDataChange}
                                                pageName="Commentary"
                                            />
                                        </TabPane>
                                        <TabPane tabId={3}>
                                            <FormBuilder
                                                ref={finalizeRef3}
                                                fields={ExtraInfoFields}
                                                editFormData={initialEditData}
                                                masterData={masterData}
                                                disabledFields={disabledFields}
                                                onFormDataChange={handleFormEDataChange}
                                                pageName="Commentary"
                                            />
                                        </TabPane>
                                        <TabPane tabId={4}>
                                            <FormBuilder
                                                ref={finalizeRef4}
                                                fields={WeatherDetailsFields}
                                                editFormData={initialEditData}
                                                masterData={masterData}
                                                onFormDataChange={handleFormCDataChange}
                                                disabledFields={disabledFields}
                                                pageName="Commentary"
                                            />
                                        </TabPane>
                                        <TabPane tabId={5}>
                                            <FormBuilder
                                                ref={finalizeRef5}
                                                fields={PitchDetailsFields}
                                                editFormData={initialEditData}
                                                masterData={masterData}
                                                onFormDataChange={handleFormDDataChange}
                                                disabledFields={disabledFields}
                                                pageName="Commentary"
                                            />
                                        </TabPane>
                                    </TabContent>
                                    <ul className="pager wizard twitter-bs-wizard-pager-link">
                                        {activeTab !== 1 && <li className="previous me-2" >
                                            <Button
                                                color="primary"
                                                className="btn"
                                                onClick={() => {
                                                    toggleTab(activeTab - 1);
                                                }}>Previous</Button>
                                        </li>}
                                        {activeTab !== 5 && <li className="next">
                                            <Button
                                                color="primary"
                                                className="btn"
                                                disabled={!isFormAValid}
                                                onClick={() => {
                                                    toggleTab(activeTab + 1);
                                                }}>
                                                Next
                                            </Button>
                                        </li>}
                                    </ul>
                                </div>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default AddCommentary;

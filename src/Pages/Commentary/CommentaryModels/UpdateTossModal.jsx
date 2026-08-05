import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { ERROR, SUCCESS } from "../../../components/Common/Const";
import axiosInstance from "../../../Features/axios";
import { updateToastData } from "../../../Features/toasterSlice";
import { isEmpty } from "lodash";
import { BAT } from "../CommentartConst";
import SpinnerModel from "../../../components/Model/SpinnerModel";
import Select from "react-select";

export const UpdateTossModal = ({ commentaryDetails, toggle }) => {
    const [commentaryData, setCommentaryData] = useState({});
    const [teamOption, setTeamOption] = useState([]);
    const [tossWonByTeamId, setTossWonByTeamId] = useState({ label: "Select team", value: null });
    const [chooseTo, setChooseTo] = useState({ label: "Select Bat/Bowl", value: null });
    const [isDataLoading, setIsDataLoading] = useState(false);
    const dispatch = useDispatch();

    const fetchData = async () => {
        setIsDataLoading(true);
        const { team1Id, team1Name, team2Id, team2Name, tossWonBy, choseTo = null } = commentaryDetails;
        const team1Option = { label: team1Name, value: team1Id };
        const team2Option = { label: team2Name, value: team2Id };
        setTeamOption([team1Option, team2Option]);
        setTossWonByTeamId(tossWonBy === team1Id ? team1Option : team2Option);
        if (choseTo) {
            setChooseTo({ label: choseTo === BAT ? "Bat" : "Bowl", value: choseTo });
        }
        setIsDataLoading(false);
    };

    const handleUpdateClick = () => {
        const dataToSave = {};
        if (tossWonByTeamId?.value === null) {
            dispatch(updateToastData({ data: "Please Select Toss Won By Team!", title: "Required Error", type: ERROR }));
            return;
        }

        if (chooseTo?.value === null) {
            dispatch(updateToastData({ data: "Please Select Toss win team decision!", title: "Required Error", type: ERROR }));
            return;
        }

        dataToSave["tossWonBy"] = tossWonByTeamId.value;
        dataToSave["choseTo"] = chooseTo.value;

        if (!isEmpty(dataToSave)) {
            saveDataApi(dataToSave);
        }
    }

    const saveDataApi = async (dataToSave) => {
        if (dataToSave) {
            const payload = {
                response: {
                    match_info: {
                        toss: {
                            winnerTeamId: dataToSave.tossWonBy,
                            decision: dataToSave.choseTo
                        }
                    }
                },
                comDetails: commentaryDetails
            };
            setIsDataLoading(true)
            await axiosInstance.post('/admin/commentary/updateCommentaryToss', payload)
                .then(async (response) => {
                    setIsDataLoading(false);
                    dispatch(updateToastData({ data: "Toss Updated Successfully", title: "Toss Update", type: SUCCESS }));
                    toggle();
                }).catch((error) => {
                    dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    setIsDataLoading(false)
                });
        }
    }

    useEffect(() => {
        if (commentaryDetails.commentaryId) {
            fetchData();
        }
    }, [])

    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Update TOSS Details
            </ModalHeader>
            <ModalBody>
                {isDataLoading && <SpinnerModel />}
                <Row>
                    <Col className={"mt-2"} xs={5} md={4} lg={4}>
                        <div className="lablediv small-label-div ">
                            <label
                                htmlFor={"tossWonBy"}
                                className="dynamic-label-right form-label-class small-labels">
                                <span className="text-danger">*&nbsp;</span>
                                TOSS won by: </label>
                        </div>
                    </Col>
                    <Col className={`mb-4`} xs={6} md={8} lg={7}>
                        <Select
                            id={"tossWonBy"}
                            name={"tossWonBy"}
                            classNamePrefix="filter-dropdown"
                            options={[
                                { label: "Select team", value: null },
                                ...teamOption
                            ]}
                            value={tossWonByTeamId}
                            onChange={(selectedOption) => setTossWonByTeamId(selectedOption)}
                            closeMenuOnSelect={true}
                            required={true}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col className={"mt-2"} xs={5} md={4} lg={4}>
                        <div className="lablediv small-label-div ">
                            <label
                                htmlFor={"chooseTo"}
                                className="dynamic-label-right form-label-class small-labels">
                                <span className="text-danger">*&nbsp;</span>
                                Choose to: </label>
                        </div>
                    </Col>
                    <Col className={`mb-4`} xs={6} md={8} lg={7}>
                        <Select
                            id={"chooseTo"}
                            name={"chooseTo"}
                            classNamePrefix="filter-dropdown"
                            value={chooseTo}
                            options={[
                                { label: "Select Bat/Bowl", value: null },
                                { label: "Bat", value: 1 },
                                { label: "Bowl", value: 2 }
                            ]}
                            onChange={(selectedOption) => setChooseTo(selectedOption)}
                            closeMenuOnSelect={true}
                            required={true}
                        />
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" className="decision-Button" onClick={handleUpdateClick}>Update</Button>
            </ModalFooter>
        </Modal>
    )
}
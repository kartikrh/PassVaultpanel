import React, { useState } from 'react';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import "../CommentaryCss.css";
import { NO_BALL_BYE, NO_BALL_LEG_BYE } from '../CommentartConst';
import RunsModal from './RunsModal';
import { useDispatch } from 'react-redux';
import { updateToastData } from '../../../Features/toasterSlice';
import axiosInstance from '../../../Features/axios';
import SpinnerModel from "../../../components/Model/SpinnerModel";
import RevertModal from "../CommentaryModels/RevertCommentary"

const CommentaryAction = ({
    toggle,
    updateExtras,
    handleRuns,
    changeOver,
    endInnings,
    paneltyRuns,
    retiredHurt,
    commentaryId,
    toggleUndoInnings,
    showInningsButton }) => {
    const [showRunsPopup, setShowRunsPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showRevertModal, setShowRevertModal] = useState(false);
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleRevertToToss = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post('/admin/commentary/revertCommentary', { commentaryId, password });

            dispatch(updateToastData({
                data: response?.message || 'Successfully reverted to toss',
                title: response?.title || 'Success',
                type: 'SUCCESS'
            }));
            setIsLoading(false);
            window.location.reload();
        } catch (error) {
            setIsLoading(false);
            dispatch(updateToastData({
                data: error?.message || 'Failed to revert to toss',
                title: error?.title || 'Error',
                type: 'ERROR'
            }));
        }
    };

    return (
        <>
            {isLoading && <SpinnerModel />}
            <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} keyboard={false} toggle={toggle}>
                <ModalHeader>
                    Actions
                </ModalHeader>
                <ModalBody>
                    <div className='m-3'>Please Select an Action :</div>
                    <Row>
                         <Col role="button" className="score-button green-success-button" xs={4} md={4} lg={4}
                            onClick={changeOver}>
                            <img className="button-icon" src="icons/end-over.png" alt="Icon" />
                            End Over
                        </Col>
                        <Col role="button" className="score-button" xs={4} md={4} lg={4}
                            onClick={() => updateExtras(NO_BALL_LEG_BYE)}>
                            No Ball Leg Bye
                        </Col>
                         <Col role="button" className="score-button red-warning-button" xs={4} md={4} lg={4}
                            onClick={endInnings}>
                            <img className="button-icon" src="icons/end-innings.png" alt="Icon" />
                            End Innings
                        </Col>
                         <Col role="button" className="score-button" xs={4} md={4} lg={4}
                            onClick={() => updateExtras(NO_BALL_BYE)}>
                            No Ball Bye
                        </Col>
                        <Col role="button" className="score-button" xs={4} md={4} lg={4}
                            onClick={paneltyRuns}>
                            <img className="button-icon" src="icons/p.png" alt="Icon" />
                            enalty
                        </Col>
                        <Col role="button" className="score-button" xs={4} md={4} lg={4}
                            onClick={() => setShowRunsPopup(true)}>
                            <img className="button-icon" src="icons/5.png" alt="Icon" />
                        </Col>
                        <Col role="button" className="score-button yellow-information-button" xs={4} md={4} lg={4}
                            onClick={() => setShowRevertModal(true)}>
                            <img className="button-icon" src="icons/revert.png" alt="Icon" />
                            Revert to Toss
                        </Col>
                          <Col role="button" className="score-button" xs={4} md={4} lg={4}
                            onClick={retiredHurt}>
                            <img className="button-icon" src="icons/r.png" alt="Icon" />
                            etired Hurt
                        </Col>
                        {showInningsButton && <Col role="button" className="score-button yellow-information-button" xs={4} md={4} lg={4}
                            onClick={() => toggleUndoInnings()}>
                            <img className="button-icon" src="icons/revert.png" alt="Icon" />
                            Undo Innings
                        </Col>}
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" className="decision-Button text-right" onClick={() => toggle()}>Close</Button>
                </ModalFooter>
            </Modal>
            {showRunsPopup && (
                <RunsModal
                    toggle={() => setShowRunsPopup(false)}
                    onSubmitClick={(runs) => handleRuns(runs, 1)}
                />
            )}
            <RevertModal
                isOpen={showRevertModal}
                toggle={() => setShowRevertModal(false)}
                onYesClick={() => {
                    handleRevertToToss();
                    setShowRevertModal(false);
                }}
                onNoClick={() => setShowRevertModal(false)}
                password={password}
                setPassword={setPassword}
            />
        </>
    );
};

export default CommentaryAction;
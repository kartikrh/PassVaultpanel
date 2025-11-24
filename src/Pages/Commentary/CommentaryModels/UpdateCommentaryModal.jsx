import React, { useEffect } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, Input } from 'reactstrap';
import "../CommentaryCss.css";

const UpdateCommentaryModal = ({ isOpen, toggle, onYesClick, onNoClick, password, setPassword }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.shiftKey) onNoClick();
        else if (e.key === 'Enter') onYesClick();
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyPress);
            return () => {
                document.removeEventListener('keydown', handleKeyPress);
            };
        }
    }, [isOpen, password]);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    return (
        <Modal backdrop="static" className="commentary-modal yellow-information-modal" zIndex={1000} isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                Update Commentary
            </ModalHeader>
            <ModalBody className="py-0">
                <span>Are you sure you want to update this commentary? To Update, Please provide password.</span>
                <FormGroup className="d-flex align-items-center gap-2 my-2">
                    <Label className="margin-right-10 label-width" for="password">Enter Password</Label>
                    <Input
                        className="form-control date-width"
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button" onClick={onYesClick}>Yes</Button>
                <Button color="danger" className="decision-Button text-right" onClick={onNoClick}>No</Button>
            </ModalFooter>
        </Modal>
    );
};

export default UpdateCommentaryModal;
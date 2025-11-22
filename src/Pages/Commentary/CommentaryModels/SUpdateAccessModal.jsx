import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, Input } from 'reactstrap';
import "../CommentaryCss.css";

const SUpdateAccessModal = ({ isOpen, toggle, onYesClick, onNoClick, password, setPassword }) => {
    const [showPassword, setShowPassword] = useState(false);
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
                Go to S-Update Page
            </ModalHeader>
            <ModalBody className="py-0">
                <span style={{ marginBottom: "15px", display: "block" }}>Before redirecting to S-Update, please provide a valid password</span>
                <FormGroup className="password-group">
                    <Label for="password" className="password-label">Enter Password</Label>

                    <div className="password-input-wrapper">
                        <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            className="password-input"
                        />

                        <span
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`bx ${showPassword ? "bx-show" : "bx-hide"}`}></i>
                        </span>
                    </div>
                </FormGroup>

            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button" onClick={onYesClick}>Yes</Button>
                <Button color="danger" className="decision-Button text-right" onClick={onNoClick}>No</Button>
            </ModalFooter>
        </Modal>
    );
};

export default SUpdateAccessModal;
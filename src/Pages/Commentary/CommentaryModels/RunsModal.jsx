import React, { useEffect, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const RunsModal = ({ toggle, onSubmitClick }) => {
    const [runs, setRuns] = useState(0)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.shiftKey) toggle();
        else if (e.key === 'Enter') onSubmitClick()
    };
    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [])
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
            <ModalHeader toggle={toggle}> Runs</ModalHeader>
            <ModalBody>
                Please Enter Runs:
                <input
                    className="form-control"
                    type="number"
                    value={runs}
                    id={"runs"}
                    onChange={(e) => setRuns(e.target.value)}
                    min={0}
                    max={99}
                    step={1}
                />
            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button" onClick={() => onSubmitClick(+runs)}>Submit</Button>
                <Button color="danger" className="decision-Button text-right " onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    )
}

export default RunsModal
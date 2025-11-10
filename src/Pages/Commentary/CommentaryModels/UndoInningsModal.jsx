// import React from 'react'
// import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
// import "../CommentaryCss.css"
// const UndoInnnigsModal = ({ isOpen, toggle, onPlayerSelectionClick, onLastInningsClick }) => {
//     return (
//         <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
//             <ModalHeader>
//                 Change Innings
//             </ModalHeader>
//             <ModalBody>
//                 What do you want to perform?
//             </ModalBody>
//             <ModalFooter>
//                 <Button color="success" className="decision-Button" onClick={onPlayerSelectionClick}>Player Selection</Button>
//                 <Button color="light" className="decision-Button text-right mx-2" onClick={() => toggle()}>Close</Button>
//             </ModalFooter>
//         </Modal>
//     )
// }

// export default UndoInnnigsModal

import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const UndoInnnigsModal = ({ isOpen, toggle, onPlayerSelectionClick, onLastInningsClick }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader>
                Undo Innings
            </ModalHeader>
            <ModalBody>
                Are you sure you want to undo end innings?
            </ModalBody>
            <ModalFooter>
                <Button color="danger" className="decision-Button" onClick={onLastInningsClick}> Undo Innings</Button>
                {/* <Button color="success" className="decision-Button" onClick={onPlayerSelectionClick}>Player Selection</Button> */}
                <Button color="light" className="decision-Button text-right mx-2" onClick={() => toggle()}>Cancel</Button>
            </ModalFooter>
        </Modal>
    )
}

export default UndoInnnigsModal
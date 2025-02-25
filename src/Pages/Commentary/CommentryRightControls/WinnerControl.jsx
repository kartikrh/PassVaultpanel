import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const WinnerControl = ({ isOpen, winnerAnnouncement, onExitClick }) => {
    return (
        <div className="col-8 d-flex flex-column m-0 p-0">
        <div>
          <div>Winner Announcement</div>
          <div>{winnerAnnouncement}</div>
        </div>
        <div className="d-flex gap-2 mt-4">
          <div className="col-12" onClick={onExitClick}>
            <button className="score-control-confirm-ball-btns">Exit</button>
          </div>
        </div>
      </div>
    )
}

export default WinnerControl
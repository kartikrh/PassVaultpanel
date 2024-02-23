import React from 'react'
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import CardComponent from '../CardComponent';
import "../CommentaryCss.css"

const ChangeStatusModal = ({ statusList, toggle, isOpen, onSubmit }) => {


    return (
        <Modal backdrop="static" size='xl' className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}> <div className='modal-header-style'>Wicket</div> </ModalHeader>
            <ModalBody>
                Update Commentary Display Status
                <Row>
                    {statusList.map((status, index) => (
                        <Col
                            key={index}
                            xs={6} md={4} lg={3}
                            onClick={() => onSubmit(status.displayStatus)}
                        >
                            <CardComponent
                                title={status.displayStatus}
                                selectIcon={"bx bxs-check-circle"}
                                onClickColor={"#099680"}
                                bgColor={"#55c6b4"}
                            // check={status === currentStatus}
                            />
                        </Col>
                    ))}
                </Row>
            </ModalBody>
        </Modal >
    )
}

export default ChangeStatusModal
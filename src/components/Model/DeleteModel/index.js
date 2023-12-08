import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  Row,
  ModalHeader,
} from "reactstrap";
import Flatpickr from "react-flatpickr";

const Index = ({ deleteModelVisable, setDeleteModelVisable, handleDelete }) => {
  const [modal_delete, setmodal_delete] = useState(true);
  function tog_delete() {
    setmodal_delete(!modal_delete);
  }
  return (
    <Modal
      isOpen={deleteModelVisable}
      toggle={() => {
        setDeleteModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setDeleteModelVisable(false);
        }}
      >
        Delete Tab
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to delete this?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setDeleteModelVisable(false);
                }}
              >
                Close
              </button>
              <button className="btn btn-danger" id="add-btn" onClick={()=>{handleDelete()}}>
                Delete
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default Index;

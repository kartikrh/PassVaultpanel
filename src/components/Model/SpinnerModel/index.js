import React from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { Spinner } from "reactstrap";
const index = () => {
  return (
    <Modal size="sm" isOpen={true} centered>
      <ModalBody className="d-flex justify-content-center">
        <Spinner color="primary">Loading...</Spinner>
      </ModalBody>
    </Modal>
  );
};

export default index;

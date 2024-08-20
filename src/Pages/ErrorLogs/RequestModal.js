import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const RequestModal = ({ isOpen, toggle, data, fetchData }) => {
  const handleYesClick = () => {
    toggle();
  };
  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-json-modal">
        <ModalHeader toggle={toggle}>Request Modal</ModalHeader>
        <ModalBody className="modal-body">
          {data && (
            <>
             {JSON.stringify(data)}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleYesClick}>
            Ok
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default RequestModal;
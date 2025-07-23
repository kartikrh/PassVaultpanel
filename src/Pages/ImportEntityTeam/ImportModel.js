import {
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

const ImportModel = ({
  isOpen,
  toggle,
  handleImport,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={toggle}
      >
        Import All Teams
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column align-items-center" id="modal-id">
            <span className="mt-4 mb-4">
              Are you sure you want to import all teams? This process may take a few minutes.
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={toggle}
              >
                Close
              </button>
              <button
                className="btn btn-success"
                id="add-btn"
                onClick={() => {
                  handleImport();
                }}
              >
                yes
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default ImportModel;

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import JsonViewer from "../../components/Common/Reusables/JsonViewer/JsonViewer";

const ReqResModal = ({ isOpen, toggle, data, fetchData }) => {
  const handleYesClick = () => {
    toggle();
  };

  const handleCopyClick = () => {
    if (data?.data) {
      const jsonData = JSON.stringify(data.data, null, 2); // Stringify with indentation
      navigator.clipboard.writeText(jsonData)
        .then(() => {
          alert('Copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
        });
    }
  };
  
  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-json-modal">
        <ModalHeader toggle={toggle}>{data?.type || "Data"} Modal</ModalHeader>
        <ModalBody className="modal-body">
          {data && (
            <>
             <JsonViewer data={data.data} />
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleYesClick}>
            Ok
          </Button>
          <Button color="secondary" onClick={handleCopyClick}>Copy</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ReqResModal;
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { convertDateUTCToLocal2_24, convertDateUtcFormat24 } from "../../components/Common/Reusables/reusableMethods";

const ResponseModal = ({ isOpen, toggle, data, recordRefType }) => {
  const dateTyp = JSON.parse(localStorage.getItem("DateType"));
  const handleYesClick = () => {
    toggle();
  };

  const handleCopyClick = () => {
    if (data) {
      const jsonData = JSON.stringify(data, null, 2);
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
        <ModalHeader toggle={toggle}>Response Modal
          {data && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '50px' }}>
              {/* Left part */}
              <div>
                <div>Ref ID:<strong> {data.refId} </strong></div>
                <div>Type:<strong> {recordRefType} </strong></div>
              </div>

              {/* Right part */}
              <div>
                <div>Date:<strong> {dateTyp?.value == 1
                  ? convertDateUTCToLocal2_24(data?.date, "index")
                  : convertDateUtcFormat24(data?.date, "index")
                }</strong></div>
              </div>
            </div>
          )}
        </ModalHeader>
        <ModalBody className="modal-body">
          {data && (
            <>
              {JSON.stringify(data.response)}
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

export default ResponseModal;
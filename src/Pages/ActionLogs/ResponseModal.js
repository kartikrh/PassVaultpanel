import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const ResponseModal = ({ isOpen, toggle, data, fetchData }) => {
  const handleYesClick = () => {
    toggle();
  };

  
    // Function to format the date

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
    
      // Extract day, day name, and year
      const day = date.getDate();
      const dayName = date.toLocaleString('en-US', { weekday: 'short' }); // e.g., 'Wed'
      const year = date.getFullYear();
    
      // Extract hours and minutes
      const hours = date.getHours().toString().padStart(2, '0'); // Ensure two digits for hours
      const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
    
      return `${day} ${dayName} ${year} ${hours}:${minutes}`;
    };
    
    // Function to copy the JSON data
    const handleCopyClick = () => {
      if (data) {
        const jsonData = JSON.stringify(data, null, 2); // Stringify with indentation
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
        <ModalHeader toggle={toggle}> Response Modal  {data && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              {/* Left part */}
              <div>
                <div>Commentary Id: <strong> {data.commentaryId}</strong></div>
                <div>Created By: <strong> {data.createdBy}</strong></div>
                <div>Date:<strong> {formatDate(data.createdAt)}</strong></div>
              </div>

              {/* Right part */}
              {/* <div>
                 <div>Event Name:<strong> {data.eventName}</strong></div>
                     
              </div> */}
            </div>
          )}</ModalHeader>
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
          <Button color="secondary" onClick={handleCopyClick}>Copy</Button> {/* Copy button */}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ResponseModal;
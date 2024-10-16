import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const RequestModal = ({ isOpen, toggle, data }) => {
  const handleYesClick = () => {
    toggle();
  };

    // Function to format the date

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
    
      // Extract day (date), month, day name, and year
      const day = date.getDate(); // e.g., 15
      const month = date.toLocaleString('en-US', { month: 'short' }); // e.g., 'Oct'
      const year = date.getFullYear(); // e.g., 2024
    
      // Extract hours and minutes
      const hours = date.getHours().toString().padStart(2, '0'); // Ensure two digits for hours
      const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
    
      return `${day} ${month} ${year} ${hours}:${minutes}`; // e.g., '15 Oct 2024 14:00'
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
        <ModalHeader toggle={toggle}> Request Modal
        {data && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              {/* Left part */}
              <div>
                <div>ID:<strong> {data.id}</strong></div>
                <div>Ref ID:<strong> {data.eventRefId}</strong></div>
                <div>Date:<strong> {formatDate(data.createdDate)}</strong></div>
              </div>

              {/* Right part */}
              <div>
                 <div>Event Name:<strong> {data.eventName}</strong></div>
                     
              </div>
            </div>
          )}
        </ModalHeader>
        <ModalBody className="modal-body">
          {data && (
            <>
             {JSON.stringify(data.requestBody)}
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

export default RequestModal;
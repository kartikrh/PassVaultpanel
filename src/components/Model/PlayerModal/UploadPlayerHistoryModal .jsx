import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, Button, Input, Alert } from "reactstrap";

export const UploadPlayerHistoryModal = ({ importExportPlayerHistoryModelVisable, setImportExportPlayerHistoryModelVisable ,handleDownloadPlayerHistory ,UploadFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Allowed file types
  const allowedExtensions = [".xlsx", ".xls", ".xlt", ".csv"];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fileExtension = file?.name?.substring(file.name.lastIndexOf("."));

    // Validate file extension
    if (!allowedExtensions.includes(fileExtension)) {
      setErrorMessage("Invalid file type. Only .xlsx, .xls, .xlt, and .csv files are allowed.");
      setSelectedFile(null); // Reset file input
    } else {
      setErrorMessage(""); // Clear error message
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      UploadFile(selectedFile); 
      //console.log("Uploading file:", selectedFile);
    } else {
      setErrorMessage("Please select a valid file before uploading.");
    }
  };

  return (
    <Modal isOpen={importExportPlayerHistoryModelVisable} toggle={() => {setImportExportPlayerHistoryModelVisable(false)}}>
      <div className="modal-header">
        <h5 className="modal-title">Upload Players History</h5>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
          onClick={() => {setImportExportPlayerHistoryModelVisable(false)}}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <ModalBody>
        {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
        <Input
          type="file"
          accept=".xlsx,.xls,.xlt,.csv"
          onChange={handleFileChange}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleUpload}>
          Upload
          <a
                className="bx bx-export"
                style={{ color: "white", fontSize: "20px", marginLeft: "10px" }}
              ></a>
        </Button>
        <Button color="warning" onClick={() => {handleDownloadPlayerHistory()}}>
          Download Player History
          <a className="bx bx-import"
                              style={{ color: "white", fontSize: "20px", marginLeft: "10px" }}
                              ></a>
        </Button>
        <Button color="secondary" onClick={() => {setImportExportPlayerHistoryModelVisable(false)}}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
import React, { useState, useRef } from "react";
import { Modal, ModalBody, ModalHeader, Row, Col, Input, Table, CardBody, Button } from 'reactstrap';
import { toPng } from 'html-to-image';

const decodeHtml = (html) => {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = html;
  return textArea.value;
};

const CricketMatchSummary = ({ escapedHtml, isOpen, onClose }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const contentRef = useRef(null);  // Reference to the modal content
  const decodedHtml = decodeHtml(escapedHtml);

  const handleDownloadImage = () => {
    console.log("fsg")
    if (contentRef.current) {
      toPng(contentRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'match-summary.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => console.error("Error generating image", error));
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg">
      <ModalHeader toggle={onClose}>Cricket Match Summary</ModalHeader>
      <ModalBody>
        <CardBody>
          <div ref={contentRef}>
            {escapedHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: decodedHtml }}
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </CardBody>
        <Row>
          <Col sm="12">
            <Input type="text" placeholder="Add your comment" />
          </Col>
        </Row>
        <Button color="success" onClick={handleDownloadImage}>Download as PNG</Button>
      </ModalBody>
    </Modal>
  );
};

export default CricketMatchSummary;

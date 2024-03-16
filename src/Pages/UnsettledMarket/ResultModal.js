import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

const ResultModal = ({ isOpen, toggle, data }) => {
  const [result, setResult] = useState("");

  const handleYesClick = () => {
    console.log("result", result);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-modal">
      <ModalHeader toggle={toggle}>Set Result Market</ModalHeader>
      <ModalBody>
        {data && (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Id</th>
                <th>Event Name</th>
                <th>Competition</th>
                <th>Event</th>
                <th>Market</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.eventDate}</td>
                <td>{data.eventMarketId}</td>
                <td>{data.eventTypeName}</td>
                <td>{data.competitionName}</td>
                <td>{data.eventName}</td>
                <td>{data.marketName}</td>
              </tr>
            </tbody>
          </table>
        )}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Label for="result">Enter Result</Label>
          <Input
            type="text"
            id="result"
            placeholder="Enter result"
            value={result}
            style={{ width: "400px", marginLeft: "8px" }}
            onChange={(e) => setResult(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleYesClick}>
          Set Result
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ResultModal;

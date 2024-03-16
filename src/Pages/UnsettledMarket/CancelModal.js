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

const CancelModal = ({ isOpen, toggle, data }) => {
  const [password, setPassword] = useState("");

  const handleYesClick = () => {
    console.log("Password:", password);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-modal">
      <ModalHeader toggle={toggle}>Cancel Market</ModalHeader>
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
          <Label for="pass">Enter Password</Label>
          <Input
            type="password"
            id="pass"
            placeholder="Enter your password"
            value={password}
            style={{ width: "400px", marginLeft: "8px" }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={handleYesClick}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CancelModal;

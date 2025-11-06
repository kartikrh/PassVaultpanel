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
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import CancelMarketModel from "../../components/Model/CancelMarketModel";

const CancelModal = ({ isOpen, toggle, data, fetchData }) => {
  const [password, setPassword] = useState("");
  const [closeModelVisable, setCloseModelVisable] = useState(false);
  const dispatch = useDispatch();

  const handleYesClick = () => {
    setCloseModelVisable(true)
    toggle();
  };

  const handleClose = async () => {
    await axiosInstance
    .post("/admin/eventMarket/cancelSettleMarket", {
      eventMarketId: data.eventMarketId,
      commentaryId: data.commentaryId,
      password: password,
    })
    .then((response) => {
      fetchData();
      setCloseModelVisable(false);
      setPassword("");
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    })
    .catch((error) => {
      setCloseModelVisable(false);
      setPassword("");
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    });
  };

  return (
    <>
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-modal">
      {/* <ModalHeader toggle={toggle}>Cancel Market {data?.marketName}</ModalHeader> */}
      <ModalHeader toggle={toggle}>
        <h5 className="modal-title" style={{ color: "#ff3d60" }}>
          Cancel Market {data?.marketName}
        </h5>
      </ModalHeader>
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
                <td>
                  <span style={{ cursor: "pointer" }}>
                    {convertDateUTCToLocal(data.eventDate, "index")}
                  </span>
                </td>
                <td>{data.eventMarketId}</td>
                <td>{data.eventTypeName}</td>
                <td>{data.competitionName}</td>
                <td>{data.eventName}</td>
                <td>{data.marketName}</td>
              </tr>
            </tbody>
          </table>
        )}
        <div className="d-flex align-items-center">
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
        <Button color="primary" onClick={handleYesClick}>
          Ok
        </Button>
      </ModalFooter>
    </Modal>
    <CancelMarketModel
      closeModelVisible={closeModelVisable}
      setCloseModelVisable={setCloseModelVisable}
      handleClose={handleClose}
      data={data}
    />
    </>
  );
};

export default CancelModal;
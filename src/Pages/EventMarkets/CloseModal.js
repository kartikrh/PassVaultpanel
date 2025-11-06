import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, SUCCESS, WARNING } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import CloseMarketModel from "../../components/Model/CloseMarketModel";
import { useState } from "react";

const CloseModal = ({ isOpen, toggle, data, fetchData }) => {
  const [closeModelVisable, setCloseModelVisable] = useState(false);
  const dispatch = useDispatch();

  const handleYesClick = () => {
    setCloseModelVisable(true)
    toggle();
  };

  const handleClose = async () => {
    await axiosInstance
      .post(`/admin/eventMarket/setMarketClose`, {
        eventMarketId: data.eventMarketId,
        commentaryId: data.commentaryId,
      })
      .then((response) => {
        fetchData();
        setCloseModelVisable(false);
        if(response?.result?.callPrediction?.predictioncallSuccess === false) {
          const predictionMessage = response?.result?.callPrediction?.predictionMessage;
          const endPoint = response?.result?.callPrediction?.endPoint;
          dispatch(
            updateToastData({
              data: `${endPoint}\n${predictionMessage}`,
              title: "Call Prediction",
              type: WARNING,
            })
          );
        } else {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
       }
      })
      .catch((error) => {
        setCloseModelVisable(false);
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
      {/* <ModalHeader toggle={toggle}>Close Market {data?.marketName}</ModalHeader> */}
      <ModalHeader toggle={toggle}>
        <h5 className="modal-title" style={{ color: "#ff3d60" }}>
          Close Market {data?.marketName}
        </h5>
      </ModalHeader>
      <ModalBody>
        {data && (
          <>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Id</th>
                <th>Event Name</th>
                <th>Competition</th>
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
              </tr>
            </tbody>
          </table>
          <div className="d-flex">
                <div style={{ marginRight: "20px" }}>
                  <span style={{ marginRight: "10px", fontWeight: "700" }}>
                    Event:
                  </span>
                  <span>{data.eventName}</span>
                </div>
                <div>
                  <span style={{ marginRight: "10px", fontWeight: "700" }}>
                    Market:
                  </span>
                  <span>{data.marketName}</span>
                </div>
          </div>
        </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleYesClick}>
          Ok
        </Button>
      </ModalFooter>
    </Modal>
    <CloseMarketModel
      closeModelVisible={closeModelVisable}
      setCloseModelVisable={setCloseModelVisable}
      handleClose={handleClose}
      data={data}
    />
    </>
  );
};

export default CloseModal;

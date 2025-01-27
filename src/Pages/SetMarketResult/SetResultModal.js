import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";

const SetResultModal = ({ isOpen, toggle, data, fetchData }) => {
  const dispatch = useDispatch();
  const handleSetResult = async () => {
    await axiosInstance
      .post(`/admin/eventMarket/setMarketIsResult`, {
        eventMarketId: data.eventMarketId,
        isResult: !data.isResult,
      })
      .then((response) => {
        fetchData();
        toggle();
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
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
        <ModalHeader toggle={toggle}>Set Market Result {data.marketName}</ModalHeader>
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
                  <th>Result</th>
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
                  <td className="text-center">{data.resultRunner}</td>
                </tr>
              </tbody>
            </table>
        <div className="d-flex mb-3">
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
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                toggle();
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              id="add-btn"
              onClick={() => {
                handleSetResult();
              }}
            >
              Ok
            </button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SetResultModal;

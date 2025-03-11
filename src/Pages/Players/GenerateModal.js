import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import { useDispatch } from "react-redux";

const GenerateModal = ({ isOpen, toggle, data, fetchData }) => {
  const dispatch = useDispatch();

  const handleGenerateImage = async () => {
    await axiosInstance
      .post(`/admin/player/mergeImage`, {
        playerId: [data?.playerId],
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
        toggle();
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
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={toggle}
      >
        Generate {data?.playerName ? data.playerName : ""} Image
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to generate{" "}
              {data?.playerName ? data.playerName : ""} Player Image?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button type="button" className="btn btn-light" onClick={toggle}>
                Cancel
              </button>
              <button
                className="btn btn-success"
                id="add-btn"
                onClick={() => {
                  handleGenerateImage();
                }}
              >
                Ok
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default GenerateModal;

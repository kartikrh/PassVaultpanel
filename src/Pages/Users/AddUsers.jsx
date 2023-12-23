import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { UserFields } from "../../constants/FieldConst/UserConst";
import {
  Button,
  ButtonDropdown,
  Card,
  CardBody,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  SAVE,
  SAVE_AND_CLOSE,
  SAVE_AND_NEW,
} from "../../components/Common/Const";
import { addUserToDb } from "../../Features/Users/usersSlice";
import axiosInstance from "../../Features/axios";

function AddUsers() {
  const finalizeRef = useRef(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [disabledFields, setDisabledFields] = useState({});
  const { isSaved, isLoading, error } = useSelector(state => state.usersData)
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || "0";

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (userId !== "0") {
      fetchData(userId);
      setDisabledFields({
        parentId: true,
        displayType: true,
      });
    }
  }, [userId]);

  useEffect(() => {
    if (isSaved) {
      if (currentSaveAction === SAVE)
        setSnackbarMessage("Data saved successfully!");
      else if (currentSaveAction === SAVE_AND_CLOSE) navigate("/users");
      else if (currentSaveAction === SAVE_AND_NEW)
        finalizeRef.current.resetForm();
    }
  },[]);

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/user/byId", { userId })
      .then((response) => {
        setInitialEditData(response?.result);
      })
      .catch((error) => {
        // setIsLoading(false)
      });
  };

  const fetchMasterData = async () => {
    await axiosInstance
      .post("/admin/user/all")
      .then((response) => {
        console.log("Users ===>", response)
        setMasterData((preData) => ({
          ...preData,
          parentName: response.result?.map((item) => {
            return { label: item.name, value: item.userId };
          }),
        }));
      })
      .catch((error) => {
        // setIsLoading(false)
      });
    await axiosInstance
      .post("/admin/roles/all")
      .then((response) => {
        console.log("Roles ===>", response)
        setMasterData((preData) => ({
          ...preData,
          roleId: response.result?.map((item) => {
            return { label: item.roleName, value: item.roleId };
          }),
        }));
      })
      .catch((error) => {
        // setIsLoading(false)
      });
  };
  const handleSaveClick = async (saveAction) => {
    setCurrentSaveAction(saveAction);
    dispatch(addUserToDb({ ...finalizeRef.current.finalizeData(), userId }));
  };
  const handleBackClick = () => {
    navigate("/users");
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3>Users </h3>
            </Col>

            <Card>
              <CardBody>
                <Row>
                  <Col
                    className="mb-3"
                    xs={12}
                    md={{ span: 4, offset: 8 }}
                    lg={{ span: 3, offset: 9 }}
                  >
                    <button
                      className="btn btn-danger mx-1"
                      onClick={handleBackClick}
                    >
                      Back
                    </button>
                    <ButtonDropdown
                      direction="down"
                      isOpen={drp_up}
                      toggle={() => setDrp_up(!drp_up)}
                    >
                      <Button
                        id="caret"
                        color="primary"
                        onClick={() => {
                          handleSaveClick(SAVE_AND_CLOSE);
                        }}
                      >
                        Save & Close
                      </Button>
                      <DropdownToggle caret color="primary">
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem
                          onClick={() => {
                            handleSaveClick(SAVE);
                          }}
                        >
                          Save
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            handleSaveClick(SAVE_AND_NEW);
                          }}
                        >
                          Save & New
                        </DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </Col>
                </Row>
                <FormBuilder
                  ref={finalizeRef}
                  fields={UserFields}
                  editFormData={initialEditData}
                  masterData={masterData}
                  disabledFields={disabledFields}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default AddUsers;

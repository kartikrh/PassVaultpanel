import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import createSocket from "../../../Features/socket";
import { isEmpty } from "lodash";
import { CONNECT_COMMENTARY, ERROR } from "../../../components/Common/Const";
import { updateToastData } from "../../../Features/toasterSlice";
import { Button } from "reactstrap";

const TossScreen = ({ data, next, save }) => {
  document.title = "Toss";
  const theme = useSelector((state) => state.layout.panelTheme);
  const [commentaryDetails, setCommentaryDetails] = useState({});
  const [commentaryTeams, setCommentaryTeams] = useState([]);
  const [winnerTeam, setWinnerTeam] = useState({});
  const [restTeams, setRestTeams] = useState([]);
  const [currentInningTeams, setCurrentInningTeams] = useState([]);
  const [values, setValues] = useState({
    choseTo: null,
    tossWonBy: null,
  });
  const socket = createSocket();
  const dispatch = useDispatch();
  const handleDetails = (key, value) => {
    setValues((preValue) => {
      return {
        ...preValue,
        [key]: value,
      };
    });
  };
  const handleSave = () => {
    const updatedTeam = {
      ...winnerTeam,
      teamStatus: values.choseTo,
      teamBattingOrder: values.choseTo,
    };
    const alternateStatus = updatedTeam?.teamStatus == 2 ? 1 : 2;
    const UpdatedCurrentInningTeams = currentInningTeams.map((team) =>
      team.teamId === values?.tossWonBy
        ? updatedTeam
        : {
            ...team,
            teamStatus: alternateStatus,
            teamBattingOrder: alternateStatus,
          }
    );
    const newData = {
      commentaryId: commentaryDetails.commentaryId,
      commentaryDetails: {
        ...commentaryDetails,
        ...values,
        rmk: `${winnerTeam?.shortName} opt to ${
          values.choseTo == 1 ? "Bat" : "Ball"
        }`,
        displayStatus: `${winnerTeam?.shortName} opt to ${
          values.choseTo == 1 ? "Bat" : "Ball"
        }`,
        commentaryStatus: "2",
      },
      commentaryTeams: UpdatedCurrentInningTeams,
    };
    save(newData, 2, {
      ...data,
      ...newData,
      commentaryTeams: [...restTeams, ...UpdatedCurrentInningTeams],
    });
  };

  useEffect(() => {
    if (!isEmpty(commentaryDetails)) {
      if (socket) {
        socket.emit(CONNECT_COMMENTARY, {
          commentaryId: commentaryDetails?.commentaryId,
          eventRefId: commentaryDetails?.eventRefId,
        });
      }
    }
  }, [commentaryDetails]);

  useEffect(() => {
    setCommentaryDetails(data?.commentaryDetails);
    //separating teams of the current inning
    const currentInning = data?.commentaryDetails.currentInnings;
    const currentInningTeams = data?.commentaryTeams.filter((val) => {
      return val.currentInnings === currentInning;
    });
    setCurrentInningTeams(currentInningTeams);
    const restTeams = data?.commentaryTeams.filter((val) => {
      return val.currentInnings !== currentInning;
    });
    setRestTeams(restTeams);
    setCommentaryTeams(data?.commentaryTeams);
    //setting values with the data comming from DB
    setValues({
      choseTo: data?.commentaryDetails?.choseTo,
      tossWonBy: data?.commentaryDetails?.tossWonBy,
    });
    if (data?.commentaryDetails?.tossWonBy !== null) {
      const winnerTeam = currentInningTeams.find((val) => {
        return data?.commentaryDetails?.tossWonBy === val?.teamId;
      });
      setWinnerTeam(winnerTeam);
    }
  }, []);
  return (
    // <div className="col-6 control-card bg-secondary">
    //   <h5 className="modal-header-title">Toss selection</h5>
    //   <span>Toss Won By ?</span>
    //   <div className="d-flex row row-cols-2 g-2 col-12">
    //     <div className="col-6">
    //       <button className="toss-screen-select-btn">
    //         <span className="pe-2">{imageRender(value.playerType)}</span>
    //         {value.playerName}
    //       </button>
    //     </div>
    //     <div className="col-6">
    //       <button className="toss-screen-select-btn">
    //         <span className="pe-2">{imageRender(value.playerType)}</span>
    //         {value.playerName}
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <React.Fragment>
      <div className="col-6 control-card bg-secondary m-4">
        <div className="my-4">
          <div className="shadow-none toss-card p-2">
            <div className="p-0">
              <h5 className="modal-header-title">Toss Selection</h5>
            </div>
            <div className="mt-4">
              <span className="ms-2 gray-text">Toss Won By ?</span>
              <div className="d-flex row row-cols-2 g-2 col-12">
                {currentInningTeams?.map((val, index) => (
                  // <div
                  //   key={index}
                  //   onClick={() => {
                  //     handleDetails("tossWonBy", val?.teamId);
                  //     setWinnerTeam(val);
                  //   }}
                  // >
                  // </div>
                  <div
                    className="col-6"
                    onClick={() => {
                      handleDetails("tossWonBy", val?.teamId);
                      setWinnerTeam(val);
                    }}
                  >
                    <button
                      className={`toss-screen-select-btn ${
                        winnerTeam?.teamId == val?.teamId ? "active" : ""
                      } `}
                    >
                      {/* <span className="pe-2">{imageRender(value.playerType)}</span> */}
                      {val.teamName}
                      {/* check={val.teamId === values?.tossWonBy} */}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {values?.tossWonBy !== null && (
              <div className="mt-4">
                {/* <h5 style={{ color: "unset" }}>Choose To?</h5> */}
                <span className="ms-2 gray-text">Choose To ?</span>
                <div className="d-flex row row-cols-2 g-2 col-12">
                  <div
                    className="col-6"
                    onClick={() => {
                      handleDetails("choseTo", 1);
                    }}
                  >
                    <button
                      className={`toss-screen-select-btn d-flex justify-content-center ${
                        values.choseTo == 1 ? "active" : ""
                      }`}
                    >
                      <span className="">
                        <img src="icons/bater.png" width={20} />
                      </span>
                      {/* {value.playerName} */}
                      Batting
                    </button>
                  </div>
                  <div
                    className="col-6 d-flex justify-content-center"
                    onClick={() => {
                      handleDetails("choseTo", 2);
                    }}
                  >
                    <button
                      className={`toss-screen-select-btn d-flex justify-content-center ${
                        values.choseTo == 2 ? "active" : ""
                      }`}
                    >
                      <span className="">
                        <img src="icons/bowler.png" width={20} />
                      </span>
                      Bowling
                    </button>
                    {/* <CardComponent
                        title="Bowling"
                        titleIcon="CommentaryIcons/ball1.png"
                        selectIcon={"bx bx-circle"}
                        onClickColor={"#FCB92C"}
                        bgColor={"#ffcd6b"}
                        check={values?.choseTo === 2}
                      /> */}
                  </div>
                </div>
              </div>
            )}
          </div>
          {values?.choseTo != null && (
            <div className="d-flex align-items-center justify-content-end px-4 pt-4">
              <Button
                className="d-flex align-items-center"
                id="caret"
                color="primary"
                onClick={() => {
                  if ((values.choseTo != null) & (values.tossWonBy != null)) {
                    handleSave();
                  } else {
                    return dispatch(
                      updateToastData({
                        data: `Check The Required Fields`,
                        title: "Toss Selection",
                        type: ERROR,
                      })
                    );
                  }
                }}
              >
                <span>Save & Next</span>
                <i className="bx bxs-right-arrow ms-1"></i>
              </Button>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default TossScreen;

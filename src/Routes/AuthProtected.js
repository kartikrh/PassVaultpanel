import React, { useEffect, useState } from "react";
import { Navigate, Route, useNavigate } from "react-router-dom";

import { useProfile } from "../Hooks/UserHooks";
import { io } from "socket.io-client";
import axios from "axios";
import { getToken } from "../helpers/api_helper";


const AuthProtected = (props) => {
  const { userProfile, loading } = useProfile();
  const navigate = useNavigate();
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  /*
    redirect is un-auth access protected routes via url
  */

  const goToLogout = () => navigate("/logout");

  const verifyToken = async () => {
    await axios
    .post(
      `${process.env.REACT_APP_BASE_URL}/verifyToken`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    )
    .then((response) => {
      if (response.status !== 200) goToLogout()
    })
    .catch(goToLogout);
  }

  const storageChange = (event) => {
    if (event.key === 'loggedIn') {
      const newValue = JSON.parse(event.newValue || false);
      if (!newValue) goToLogout()
    }
  }

  useEffect(() => {
    window.addEventListener('storage', storageChange, false);
    return () => window.removeEventListener('storage', storageChange, false);
  }, []);

  useEffect(() => {
    if (userProfile?.token) {
      const socket = io.connect(process.env.REACT_APP_BASE_URL, {
        auth: {
          token: userProfile.token
        }
      });
      socket.on("connect", () => {
        setIsSocketConnected(true);
        console.log("socket connected")
      });
      socket.on("disconnect", (reason) => {
        setIsSocketConnected(false);
        console.log("disconnected", reason);
      });
      socket.on("logout", goToLogout)
    }
  }, [userProfile]);

  useEffect(() => {
    let interval;
    if (!isSocketConnected) {
      interval = setInterval(verifyToken, process.env.REACT_APP_API_INTERVAL);
    }
    return () => {
      clearInterval(interval);
    }
  }, [isSocketConnected])


  if (!userProfile && loading) {
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  }

  return <>{props.children}</>;
};

const AccessRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        return (<> <Component {...props} /> </>);
      }}
    />
  );
};

export { AuthProtected, AccessRoute };
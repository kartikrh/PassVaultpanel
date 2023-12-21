import React, { useEffect, useState } from "react";
import { Navigate, Route, useNavigate } from "react-router-dom";

import { useProfile } from "../Hooks/UserHooks";
import { io } from "socket.io-client";
import axiosInstance from "../Features/axios";
import { useSelector } from "react-redux";


const AuthProtected = (props) => {
  const { userProfile, loading } = useProfile();
  const token = useSelector((state) => state.user.token);

  const navigate = useNavigate();
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  /*
    redirect is un-auth access protected routes via url
  */

  const goToLogout = () => navigate("/logout");

  const verifyToken = async () => {
    await axiosInstance
      .post(`/verifyToken`)
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
    let socket;
    if (token) {
      socket = io.connect(process.env.REACT_APP_BASE_URL, {
        auth: {
          token: token
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
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [token]);

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
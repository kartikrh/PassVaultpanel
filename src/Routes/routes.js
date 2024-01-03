import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import Dashboard from "../Pages/Dashboard";

//Pages
import Tabs from '../Pages/Tabs'
import Roles from '../Pages/Roles'
import EventTypes from '../Pages/EventTypes'
import Players from '../Pages/Players'
import Teams from '../Pages/Teams'
import MatchType from '../Pages/MatchType'
import PenaltyRuns from '../Pages/PenaltyRuns'
import Competition from '../Pages/Competition'
import Events from '../Pages/Events'
import Commentary from '../Pages/Commentary'
import Users from '../Pages/Users'
import AddTabs from "../Pages/Tabs/AddTabs.jsx";
import AddRoles from "../Pages/Roles/AddRoles.jsx";
import AddEventTypes from "../Pages/EventTypes/AddEventType.jsx";
import AddPlayers from "../Pages/Players/AddPlayers.jsx";
import AddTeams from "../Pages/Teams/AddTeams.jsx";
import AddMatchType from "../Pages/MatchType/AddMatchTypes.jsx";
import AddPenaltyRuns from "../Pages/PenaltyRuns/AddPaneltyRuns.jsx";
import AddCompetition from "../Pages/Competition/AddCompetition.jsx";
import AddEvents from "../Pages/Events/AddEvents.jsx";
import AddCommentary from "../Pages/Commentary/AddCommentary.jsx";
import AddUsers from "../Pages/Users/AddUsers.jsx";
import ChangePassword from '../Pages/ChangePassword'
// Import Authentication pages
import Login from "../Pages/Authentication/Login";
// import ForgetPasswordPage from "../Pages/Authentication/ForgetPassword";
import Logout from "../Pages/Authentication/Logout";
// import Register from "../Pages/Authentication/Register";

// Import Authentication Inner Pages
import Login1 from "../Pages/AuthenticationPages/Login";
// import Register1 from "../Pages/AuthenticationPages/Register";
// import RecoverPassword from "../Pages/AuthenticationPages/RecoverPassword";
// import LockScreen from "../Pages/AuthenticationPages/LockScreen";

// Import Utility Pages
import Maintenance from "../Pages/Utility/Maintenance-Page.js";
import ComingSoon from "../Pages/Utility/ComingSoon-Page.js";
import Error404 from "../Pages/Utility/Error404-Page.js";
import Error500 from "../Pages/Utility/Error500-Page.js";
import { LOGOUT } from "../components/Common/Const.js";

const authProtectedRoutes = [
  //dashboard
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/tabs", component: <Tabs /> },
  { path: '/addTabs', component: <AddTabs /> },
  { path: "/roles", component: <Roles /> },
  { path: "/addRoles", component: <AddRoles /> },
  { path: "/eventType", component: <EventTypes /> },
  { path: "/addEventType", component: <AddEventTypes /> },
  { path: '/events', component: <Events /> },
  { path: '/addEvents', component: <AddEvents /> },
  { path: "/Players", component: <Players /> },
  { path: "/addPlayer", component: <AddPlayers /> },
  { path: '/Teams', component: <Teams /> },
  { path: '/addTeams', component: <AddTeams /> },
  { path: '/matchType', component: <MatchType /> },
  { path: '/addMatchType', component: <AddMatchType /> },
  { path: '/penalty', component: <PenaltyRuns /> },
  { path: '/addPenalty', component: <AddPenaltyRuns /> },
  { path: '/competition', component: <Competition /> },
  { path: '/addCompetition', component: <AddCompetition /> },
  { path: '/commentary', component: <Commentary /> },
  { path: '/addCommentary', component: <AddCommentary /> },
  { path: '/users', component: <Users /> },
  { path: '/addUsers', component: <AddUsers /> },
  {
    path: '/changePassword', component:<ChangePassword/>
  },
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
];
const publicRoutes = [

  // Authentication Page
  { path: LOGOUT, component: <Logout /> },
  { path: "/login", component: <Login /> },
  // { path: "/forgot-password", component: <ForgetPasswordPage /> },
  // { path: "/register", component: <Register /> },

  // Authentication Inner Pages
  { path: "/auth-login", component: <Login1 /> },
  // { path: "/auth-register", component: <Register1 /> },
  // { path: "/auth-recoverpw", component: <RecoverPassword /> },
  // { path: "/auth-lock-screen", component: <LockScreen /> },

  // Utility Pages
  { path: "/pages-404", component: <Error404 /> },
  { path: "/pages-500", component: <Error500 /> },
  { path: "/pages-maintenance", component: <Maintenance /> },
  { path: "/pages-comingsoon", component: <ComingSoon /> },
];

export { authProtectedRoutes, publicRoutes };

import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import Dashboard from "../Pages/Dashboard";

//Pages
import Tabs from "../Pages/Tabs";
import Roles from "../Pages/Roles";
import EventTypes from "../Pages/EventTypes";
import Players from "../Pages/Players";
import Teams from "../Pages/Teams";
import MatchType from "../Pages/MatchType";
import PenaltyRuns from "../Pages/PenaltyRuns";
import Competition from "../Pages/Competition";
import Events from "../Pages/Events";
import Commentary from "../Pages/Commentary";
import Users from "../Pages/Users";
import ImportMarket from "../Pages/ImportMarket";
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
import ChangePassword from "../Pages/ChangePassword";
import Toss from "../Pages/Commentary/Toss.jsx";
import CommentaryMaster from "../Pages/Commentary/CommentaryMaster.js";
import AddBlock from "../Pages/Blocks/AddBlock.jsx";
import Blocks from "../Pages/Blocks";
import AddConfig from "../Pages/Config/AddConfig.jsx";
import Config from "../Pages/Config";
import PageFormat from "../Pages/PageFormat";
import AddPageFormat from "../Pages/PageFormat/AddPageFormat.jsx";
import AddPage from "../Pages/Page/AddPage.jsx";
import Page from "../Pages/Page";
import MenuList from '../Pages/menuList'
import AddMenuType from '../Pages/menuList/AddMenuType.js'
import AddMenuItem from '../Pages/menuList/AddMenuItem.js'
import News from '../Pages/News'
import Subscribers from '../Pages/Subscribers'

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
import AddNews from "../Pages/News/AddNews.jsx";
import { ShortCommentary } from "../Pages/Commentary/ShortCommentary.js";
import MatchTypePredictor from "../Pages/MatchType/MatchTypePredictor.jsx";

const authProtectedRoutes = [
  //dashboard
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/tabs", component: <Tabs /> },
  { path: "/addTabs", component: <AddTabs /> },
  { path: "/roles", component: <Roles /> },
  { path: "/addRoles", component: <AddRoles /> },
  { path: "/eventType", component: <EventTypes /> },
  { path: "/addEventType", component: <AddEventTypes /> },
  { path: "/events", component: <Events /> },
  { path: "/addEvents", component: <AddEvents /> },
  { path: "/Players", component: <Players /> },
  { path: "/addPlayer", component: <AddPlayers /> },
  { path: "/Teams", component: <Teams /> },
  { path: "/addTeams", component: <AddTeams /> },
  { path: "/matchType", component: <MatchType /> },
  { path: "/addMatchType", component: <AddMatchType /> },
  { path: "/matchTypePredictor", component: <MatchTypePredictor /> },
  { path: "/penalty", component: <PenaltyRuns /> },
  { path: "/addPenalty", component: <AddPenaltyRuns /> },
  { path: "/competition", component: <Competition /> },
  { path: "/addCompetition", component: <AddCompetition /> },
  { path: "/commentary", component: <Commentary /> },
  { path: "/addCommentary", component: <AddCommentary /> },
  { path: "/commentaryMaster", component: <CommentaryMaster /> },
  { path: "/shortCommentary", component: <ShortCommentary /> },
  { path: "/importMarket", component: <ImportMarket /> },
  { path: "/Toss", component: <Toss /> },
  { path: "/users", component: <Users /> },
  { path: "/addUsers", component: <AddUsers /> },
  { path: "/blocks", component: <Blocks /> },
  { path: "/addblocks", component: <AddBlock /> },
  { path: "/config", component: <Config /> },
  { path: "/addConfig", component: <AddConfig /> },
  { path: "/addPageFormat", component: <AddPageFormat /> },
  { path: "/PageFormat", component: <PageFormat /> },
  { path: "/addPage", component: <AddPage /> },
  { path: "/Page", component: <Page /> },
  { path: "/menuList", component: <MenuList /> },
  { path: "/addMenuType", component: <AddMenuType /> },
  { path: "/addMenuItem", component: <AddMenuItem /> },
  { path: "/news", component: <News /> },
  { path: "/addNews", component: <AddNews /> },
  {path:"/subscribers", component: <Subscribers/>},
  {
    path: "/changePassword",
    component: <ChangePassword />,
  },
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
];
const publicRoutes = [
  // Authentication Page
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },

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

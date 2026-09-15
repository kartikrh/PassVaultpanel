/* eslint-disable react/jsx-no-undef */
import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import Dashboard from "../Pages/Dashboard";

//Pages
import Tabs from "../Pages/Tabs";
import Roles from "../Pages/Roles";
import Package from "../Pages/Package";
import Users from "../Pages/Users";
import AddTabs from "../Pages/Tabs/AddTabs.jsx";
import AddRoles from "../Pages/Roles/AddRoles.jsx";
import AddUsers from "../Pages/Users/AddUsers.jsx";
import ChangePassword from "../Pages/ChangePassword";
import AddBlock from "../Pages/Blocks/AddBlock.jsx";
import Blocks from "../Pages/Blocks";
import AddConfig from "../Pages/Config/AddConfig.jsx";
import Config from "../Pages/Config";
import PageFormat from "../Pages/PageFormat";
import AddPageFormat from "../Pages/PageFormat/AddPageFormat.jsx";
import AddPage from "../Pages/Page/AddPage.jsx";
import Page from "../Pages/Page";
import MenuList from "../Pages/menuList";
import AddMenuType from "../Pages/menuList/AddMenuType.js";
import AddMenuItem from "../Pages/menuList/AddMenuItem.js";
import News from "../Pages/News";
import PhotoLibrary from "../Pages/PhotoLibrary";
import Photos from "../Pages/PhotoLibrary/Photos.js";
import AddPhotoLibrary from "../Pages/PhotoLibrary/AddPhotoLibrary.jsx";
import VideoLibrary from "../Pages/VideoLibrary";
import AddVideoLibrary from "../Pages/VideoLibrary/AddVideoLibrary.jsx";
import Banner from "../Pages/Banner";
import API from "../Pages/API";
import APIEndpoints from "../Pages/APIEndpoints";
import Notification from "../Pages/Notification";
import MailSettings from "../Pages/MailSettings";
import ClientSocket from "../Pages/ClientSocket";
import Template from "../Pages/Template";
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
import AddClientSocket from "../Pages/ClientSocket/AddClientSocket.jsx";
import AddBanner from "../Pages/Banner/AddBanner.jsx";
import AddAPI from "../Pages/API/AddAPI.jsx";
import AddAPIEndpoint from "../Pages/APIEndpoints/AddAPIEndpoint.jsx";
import AddNotification from "../Pages/Notification/AddNotification.jsx";
import AddMailSettings from "../Pages/MailSettings/AddMailSettings.jsx";
import ErrorLogs from "../Pages/ErrorLogs";
import AddSocialMedia from "../Pages/SocialMedia/AddSocialMedia.jsx";
import SocialMedia from "../Pages/SocialMedia";
import AddPhotos from "../Pages/PhotoLibrary/AddPhotos.jsx";
import CountryCode from "../Pages/CountryCode";
import AddCountryCode from "../Pages/CountryCode/AddCountryCode.jsx";
import AddPackage from "../Pages/Package/AddPackage.jsx";
import PaymentMethod from "../Pages/PaymentMethod";
import AddPaymentMethod from "../Pages/PaymentMethod/AddPaymentMethod.jsx";
import PlanUpgradeRequests from "../Pages/PlanUpgradeRequests";
import NotificationConfig from "../Pages/NotificationConfig";
import AddNotificationConfig from "../Pages/NotificationConfig/AddNotificationConfig.jsx";
import WhiteLabel from "../Pages/WhiteLabel";
import AddWhiteLabel from "../Pages/WhiteLabel/AddWhiteLabel.jsx";
import { ShowHide } from "../Pages/WhiteLabel/EventType/index.js";
import Advertise from "../Pages/Advertise";
import AddAdvertise from "../Pages/Advertise/AddAdvertise.jsx";
import AddTemplate from "../Pages/Template/AddTemplate.jsx";
import Clients from "../Pages/Clients";
import ClientDetail from "../Pages/Clients/ClientDetail.jsx";
import History from "../Pages/History";

const authProtectedRoutes = [
  //dashboard

  { path: "/dashboard", component: <Dashboard /> },
  { path: "/tabs", component: <Tabs /> },
  { path: "/addTabs", component: <AddTabs /> },
  { path: "/roles", component: <Roles /> },
  { path: "/addRoles", component: <AddRoles /> },
  { path: "/package", component: <Package /> },
  { path: "/addPackage", component: <AddPackage /> },
  { path: "/paymentMethod", component: <PaymentMethod /> },
  { path: "/addPaymentMethod", component: <AddPaymentMethod /> },
  { path: "/planUpgradeRequests", component: <PlanUpgradeRequests /> },
  { path: "/socialMedia", component: <SocialMedia /> },
  { path: "/addSocialMedia", component: <AddSocialMedia /> },
  { path: "/countryCode", component: <CountryCode /> },
  { path: "/addCountryCode", component: <AddCountryCode /> },
  { path: "/notificationConfig", component: <NotificationConfig /> },
  { path: "/addNotificationConfig", component: <AddNotificationConfig /> },
  { path: "/whiteLabel", component: <WhiteLabel /> },
  { path: "/addWhiteLabel", component: <AddWhiteLabel /> },
  { path: "/whiteLabelEventData", component: <ShowHide /> },
  { path: "/photos", component: <Photos /> },
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
  { path: "/clientSocket", component: <ClientSocket /> },
  { path: "/addClientSocket", component: <AddClientSocket /> },
  { path: "/banner", component: <Banner /> },
  { path: "/addBanner", component: <AddBanner /> },
  { path: "/apis", component: <API /> },
  { path: "/addApi", component: <AddAPI /> },
  { path: "/apiEndpoints", component: <APIEndpoints /> },
  { path: "/addApiEndpoint", component: <AddAPIEndpoint /> },
  { path: "/notification", component: <Notification /> },
  { path: "/addNotification", component: <AddNotification /> },
  { path: "/mailSettings", component: <MailSettings /> },
  { path: "/addMailSetting", component: <AddMailSettings /> },
  { path: "/errorLogs", component: <ErrorLogs /> },
  { path: "/photoLibrary", component: <PhotoLibrary /> },
  { path: "/addPhotoLibrary", component: <AddPhotoLibrary /> },
  { path: "/addPhotos", component: <AddPhotos /> },
  { path: "/videoLibrary", component: <VideoLibrary /> },
  { path: "/AddVideoLibrary", component: <AddVideoLibrary /> },
  { path: "/advertise", component: <Advertise /> },
  { path: "/addAdvertise", component: <AddAdvertise /> },
  { path: "/template", component: <Template /> },
  { path: "/addTemplate", component: <AddTemplate /> },
  { path: "/clients", component: <Clients /> },
  { path: "/clientDetail", component: <ClientDetail /> },
  { path: "/history", component: <History /> },
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

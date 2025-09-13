/* eslint-disable react/jsx-no-undef */
import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import Dashboard from "../Pages/Dashboard";

//Pages
import Tabs from "../Pages/Tabs";
import Roles from "../Pages/Roles";
import EventTypes from "../Pages/EventTypes";
import Players from "../Pages/Players";
import Package from "../Pages/Package";
import Teams from "../Pages/Teams";
import MatchType from "../Pages/MatchType";
import PenaltyRuns from "../Pages/PenaltyRuns";
import Competition from "../Pages/Competition";
import Events from "../Pages/Events";
import Commentary from "../Pages/Commentary";
import IccRankings from "../Pages/IccRankings";
import CommentaryList from "../Pages/CommentaryList";
import CommentaryHistory from "../Pages/CommentaryHistory";
import Users from "../Pages/Users";
import ImportMarket from "../Pages/ImportMarket";
import ManualEvent from "../Pages/ManualEvent";
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
import AddMarketTemplate from "../Pages/MarketTemplate/AddMarketTamplate.js";
import UpdateWicketDismisalMarket from "../Pages/MarketTemplate/DismisalDataTemplate.js";
import ChangePassword from "../Pages/ChangePassword";
import Toss from "../Pages/Commentary/Toss.jsx";
import CommentaryMaster from "../Pages/Commentary/CommentaryMaster.js";
import AddBlock from "../Pages/Blocks/AddBlock.jsx";
import Blocks from "../Pages/Blocks";
import CardType from "../Pages/CardType";
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
import Template from "../Pages/Template";
import RegisteredUsers from "../Pages/RegisteredUsers";
import RegistrationPending from "../Pages/RegistrationPending";
import MailSettings from "../Pages/MailSettings";
import Subscribers from "../Pages/Subscribers";
import MarketTemplate from "../Pages/MarketTemplate";
import EventMarkets from "../Pages/EventMarkets";
import AddEventMarket from "../Pages/EventMarkets/AddEventMarket.jsx";
import UnsettledMarket from "../Pages/UnsettledMarket";
import SetMarketResult from "../Pages/SetMarketResult";
import SetSessionResult from "../Pages/SetSessionResult";
import Vendor from "../Pages/Vendor";
import DisplayStatus from "../Pages/DisplayStatus";
import AddDisplayStatus from "../Pages/DisplayStatus/AddDisplayStatus.jsx";
import ClientSocket from "../Pages/ClientSocket";
import ThirdPartyApi from "../Pages/ThirdPartyApi";
// Import Authentication pages
import Login from "../Pages/Authentication/Login";
// import ForgetPasswordPage from "../Pages/Authentication/ForgetPassword";
import Logout from "../Pages/Authentication/Logout";
// import Register from "../Pages/Authentication/Register";
import ManualOddMarketsPage from '../Pages/ManualOddMarketsPage'
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
import UpdateCommentaryPlayer from "../Pages/Commentary/UpdateCommentaryPlayer.jsx";
import { CreateEventMarket } from "../Pages/Commentary/CreateEventMarket.js";
import { OpenMarket } from "../Pages/Commentary/OpenMarket.jsx";
import { CommentaryMarketRunner } from "../Pages/Commentary/CommentaryMarketRunner.js";
import { CommentaryFeatures } from "../Pages/Commentary/CommentaryFeatures.jsx";
import MarketTemplateRunner from "../Pages/MarketTemplate/MarketTemplateRunner.js";
import { OddsView } from "../Pages/Commentary/OddsView.jsx";
import MarketLogs from "../Pages/EventMarkets/MarketLogs.jsx";
import MarketDataLogs from "../Pages/EventMarkets/MarketDataLogs.jsx";
import AutoImportData from "../Pages/AutoImportData";
import AddVendor from "../Pages/Vendor/AddVendor.js";
import VendorIpList from "../Pages/Vendor/VendorIpList.js";
import AddClientSocket from "../Pages/ClientSocket/AddClientSocket.jsx";
import AddBanner from "../Pages/Banner/AddBanner.jsx";
import AddAPI from "../Pages/API/AddAPI.jsx";
import AddAPIEndpoint from "../Pages/APIEndpoints/AddAPIEndpoint.jsx";
import PredictorApiLogs from "../Pages/Commentary/PredictorApiLogs.jsx";
import AddNotification from "../Pages/Notification/AddNotification.jsx";
import AddTemplate from "../Pages/Template/AddTemplate.jsx";
import AddRegisteredUsers from "../Pages/RegisteredUsers/AddRegisteredUsers.jsx";
import AddRegistrationPending from "../Pages/RegistrationPending/AddRegistrationPending.jsx";
import AddMailSettings from "../Pages/MailSettings/AddMailSettings.jsx";
import CommentaryLogs from "../Pages/CommentaryLogs";
import ThirdpartyLogs from "../Pages/ThirdpartyLogs";
import ErrorLogs from "../Pages/ErrorLogs";
import PredictorLogs from "../Pages/PredictorLogs";
import UndoLogs from "../Pages/UndoLogs";
import ScoringLogs from "../Pages/ScoringLogs";
import EventMarketLogs from "../Pages/EventMarketLogs";
import AddSocialMedia from "../Pages/SocialMedia/AddSocialMedia.jsx";
import SocialMedia from "../Pages/SocialMedia";
import AddAward from "../Pages/Awards/AddAwards.jsx";
import Awards from "../Pages/Awards";
import CommentaryMarketTemplate from "../Pages/Commentary/CommentaryMarketTemplate.jsx";
import PlayerHistory from "../Pages/Players/PlayerHistory.jsx";
import TournamentTeamPoints from "../Pages/Competition/TournamentTeamPoints.jsx";
import TournamentCompetitionPoints from "../Pages/Teams/TournamentCompetitionPoints.jsx";
import { CommentaryEventSnap } from "../Pages/Commentary/CommentaryEventSnap.jsx";
import MatchHistory from "../Pages/Players/MatchHistory.jsx";
import MarketType from "../Pages/MarketType";
import AddPhotos from "../Pages/PhotoLibrary/AddPhotos.jsx";
import ShotType from "../Pages/ShotType";
import AddShotType from "../Pages/ShotType/AddShotType.jsx";
import EventResult from "../Pages/EventResult";
import { ManualOddsMarket } from "../Pages/Commentary/ManualOddsMarket.jsx";
import { UpdateManualOdds } from "../Pages/Commentary/UpdateManualOdds.jsx";
import DataproviderPage from "../Pages/DataProvider/Dataprovider.jsx";
import EventDetails from "../Pages/DataProvider/EventDetails.jsx";
import BowlingPredictor from "../Pages/MatchType/BowlingPredictor.jsx";
import CountryCode from "../Pages/CountryCode";
import AddCountryCode from "../Pages/CountryCode/AddCountryCode.jsx";
import AddPackage from "../Pages/Package/AddPackage.jsx";
import NotificationConfig from "../Pages/NotificationConfig";
import AddNotificationConfig from "../Pages/NotificationConfig/AddNotificationConfig.jsx";
import PlayerDetails from "../Pages/Players/PlayerDetails.jsx";
import WhiteLabel from "../Pages/WhiteLabel";
import AddWhiteLabel from "../Pages/WhiteLabel/AddWhiteLabel.jsx";
import { ShowHide } from "../Pages/WhiteLabel/EventType/index.js";
import Venue from "../Pages/Venue";
import AddVenue from "../Pages/Venue/AddVenue.jsx";
import AddCardType from "../Pages/CardType/AddCardType.jsx";
import ImportEntity from "../Pages/ImportEntity/ImportEntityTable.js";
import PythonApi from "../Pages/PythonApi";
import AddPythonAPI from "../Pages/PythonApi/AddPythonApi.jsx";
import { AddManualOdds } from "../Pages/Commentary/AddManualOdds.jsx";
import { NewUpdateManualOdds } from "../Pages/Commentary/NewUpdateManualOdds.jsx";
import ImportEntityEvent from "../Pages/ImportEntityEvent/ImportEntityEventTable.js";
import ImportEntityTeam from "../Pages/ImportEntityTeam/ImportEntityTeamTable.js";
import ImportEntityPlayer from "../Pages/ImportEntityPlayer/ImportEntityPlayer.js";
import AddRankings from "../Pages/IccRankings/AddRankings.jsx";
import StreamingList from "../Pages/Commentary/StreamingList.js";
import StreamingTable from "../Pages/Commentary/StreamingTable.js";
import StreamWatch from "../Pages/Commentary/StreamWatch.js";

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
  { path: "/PlayerDetails", component: <PlayerDetails /> },
  { path: "/package", component: <Package /> },
  { path: "/addPlayer", component: <AddPlayers /> },
  { path: "/addPackage", component: <AddPackage /> },
  { path: "/playerHistory", component: <PlayerHistory /> },
  { path: "/playerEventHistory", component: <MatchHistory /> },
  { path: "/marketType", component: <MarketType /> },
  { path: "/Teams", component: <Teams /> },
  { path: "/addTeams", component: <AddTeams /> },
  { path: "/matchType", component: <MatchType /> },
  { path: "/addMatchType", component: <AddMatchType /> },
  { path: "/matchTypePredictor", component: <MatchTypePredictor /> },
  { path: "/bowlingPredictor", component: <BowlingPredictor /> },
  { path: "/penalty", component: <PenaltyRuns /> },
  { path: "/addPenalty", component: <AddPenaltyRuns /> },
  { path: "/competition", component: <Competition /> },
  { path: "/tournamentTeamPoints", component: <TournamentTeamPoints /> },
  {
    path: "/tournamentCompetitionPoints",
    component: <TournamentCompetitionPoints />,
  },
  { path: "/socialMedia", component: <SocialMedia /> },
  { path: "/addSocialMedia", component: <AddSocialMedia /> },
  { path: "/awards", component: <Awards /> },
  { path: "/addAward", component: <AddAward /> },
  { path: "/addCompetition", component: <AddCompetition /> },
  { path: "/countryCode", component: <CountryCode /> },
  { path: "/addCountryCode", component: <AddCountryCode /> },
  { path: "/commentary", component: <Commentary /> },
  { path: "/commentaryList", component: <CommentaryList /> },
  { path: "/commentaryHistory", component: <CommentaryHistory /> },
  { path: "/addCommentary", component: <AddCommentary /> },
  { path: "/commentaryMaster", component: <CommentaryMaster /> },
  { path: "/shortCommentary", component: <ShortCommentary /> },
  { path: "/updateCommentaryFeature", component: <CommentaryFeatures /> },
  { path: "/updateCommentaryPlayer", component: <UpdateCommentaryPlayer /> },
  { path: "/predictorApiLogs", component: <PredictorApiLogs /> },
  { path: "/notificationConfig", component: <NotificationConfig /> },
  { path: "/addNotificationConfig", component: <AddNotificationConfig /> },
  { path: "/whiteLabel", component: <WhiteLabel /> },
  { path: "/addWhiteLabel", component: <AddWhiteLabel /> },
  { path: "/whiteLabelEventData", component: <ShowHide /> },
  { path: "/venue", component: <Venue /> },
  { path: "/addVenue", component: <AddVenue /> },
  { path: "/importEntity", component: <ImportEntity /> },
  { path: "/ImportEntityEvent", component: <ImportEntityEvent /> },
  { path: "/ImportEntityTeam", component: <ImportEntityTeam /> },
  { path: "/ImportEntityPlayer", component: <ImportEntityPlayer /> },
  { path: "/pythonAPI", component: <PythonApi /> },
  { path: "/addpythonAPI", component: <AddPythonAPI /> },
  {
    path: "/commentaryMarketTemplate",
    component: <CommentaryMarketTemplate />,
  },
  {
    path: "/commentaryMarkets",
    component: <CreateEventMarket />,
  },
  {
    path: "/commentaryEventSnap",
    component: <CommentaryEventSnap />,
  },
  { path: "/openMarket", component: <OpenMarket /> },
  { path: "/commentaryMarketRunner", component: <CommentaryMarketRunner /> },
  { path: "/photos", component: <Photos /> },
  { path: "/oddsView", component: <OddsView /> },
  { path: "/autoEvent", component: <ImportMarket /> },
  { path: "/manualEvent", component: <ManualEvent /> },
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
  { path: "/shotType", component: <ShotType /> },
  { path: "/addShotType", component: <AddShotType /> },
  { path: "/subscribers", component: <Subscribers /> },
  { path: "/marketTemplate", component: <MarketTemplate /> },
  { path: "/addMarketTemplate", component: <AddMarketTemplate /> },
  { path: "/wicketDismisalMarket", component: <UpdateWicketDismisalMarket /> },
  { path: "/marketTemplateRunner", component: <MarketTemplateRunner /> },
  { path: "/eventMarkets", component: <EventMarkets /> },
  { path: "/manualOddsMarkets", component: <ManualOddMarketsPage /> },
  { path: "/addEventMarket", component: <AddEventMarket /> },
  { path: "/marketLogs", component: <MarketLogs /> },
  { path: "/autoImport", component: <AutoImportData /> },
  { path: "/marketDataLogs", component: <MarketDataLogs /> },
  { path: "/unsettledMarket", component: <UnsettledMarket /> },
  { path: "/setMarketResult", component: <SetMarketResult /> },
  { path: "/setSessionResult", component: <SetSessionResult /> },
  { path: "/vendors", component: <Vendor /> },
  { path: "/addVendor", component: <AddVendor /> },
  { path: "/vendorIpList", component: <VendorIpList /> },
  { path: "/displaystatus", component: <DisplayStatus /> },
  { path: "/addDisplayStatus", component: <AddDisplayStatus /> },
  { path: "/clientSocket", component: <ClientSocket /> },
  { path: "/thirdPartyApi", component: <ThirdPartyApi /> },
  { path: "/addClientSocket", component: <AddClientSocket /> },
  { path: "/banner", component: <Banner /> },
  { path: "/addBanner", component: <AddBanner /> },
  { path: "/apis", component: <API /> },
  { path: "/addApi", component: <AddAPI /> },
  { path: "/apiEndpoints", component: <APIEndpoints /> },
  { path: "/addApiEndpoint", component: <AddAPIEndpoint /> },
  { path: "/notification", component: <Notification /> },
  { path: "/addNotification", component: <AddNotification /> },
  { path: "/template", component: <Template /> },
  { path: "/addTemplate", component: <AddTemplate /> },
  { path: "/registeredUsers", component: <RegisteredUsers /> },
  { path: "/addRegisteredUsers", component: <AddRegisteredUsers /> },
  { path: "/registrationPending", component: <RegistrationPending /> },
  { path: "/addRegistrationPending", component: <AddRegistrationPending /> },
  { path: "/mailSettings", component: <MailSettings /> },
  { path: "/addMailSetting", component: <AddMailSettings /> },
  { path: "/commentaryLogs", component: <CommentaryLogs /> },
  { path: "/thirdpartyLogs", component: <ThirdpartyLogs /> },
  { path: "/errorLogs", component: <ErrorLogs /> },
  { path: "/predictorLogs", component: <PredictorLogs /> },
  { path: "/undoLogs", component: <UndoLogs /> },
  { path: "/scoringLogs", component: <ScoringLogs /> },
  { path: "/EventMarketLogs", component: <EventMarketLogs /> },
  { path: "/eventResult", component: <EventResult /> },
  { path: "/photoLibrary", component: <PhotoLibrary /> },
  { path: "/addPhotoLibrary", component: <AddPhotoLibrary /> },
  { path: "/addPhotos", component: <AddPhotos /> },
  { path: "/videoLibrary", component: <VideoLibrary /> },
  { path: "/CardType", component: <CardType /> },
  { path: "/addCardType", component: <AddCardType /> },
  { path: "/addManualOddsMarket", component: <AddManualOdds /> },
  { path: "/manualOddsMarket", component: <ManualOddsMarket /> },
  // { path: "/updateManualOdds", component: <UpdateManualOdds /> },
  { path: "/updateManualOdds", component: <NewUpdateManualOdds /> },
  { path: "/AddVideoLibrary", component: <AddVideoLibrary /> },
  { path: "/dataprovider", component: <DataproviderPage /> },
  { path: "/dataproviderMarkets", component: <EventDetails /> },
  { path: "/iccRanking", component: <IccRankings /> },
  { path: "/addRanking", component: <AddRankings /> },
  { path: "/streamingList", component: <StreamingList /> },
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

const streamingRoutes = [
  { path: "/streamwatch", component: <StreamWatch /> },
  { path: "/streamingTable", component: <StreamingTable /> },
]

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

export { authProtectedRoutes, publicRoutes, streamingRoutes };

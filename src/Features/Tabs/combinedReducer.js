import { combineReducers } from "@reduxjs/toolkit";
import TabSlice from "./tabsSlice";
import CommentarySlice from "./commentarySlice";
import MatchTypeSLice from "./matchTypeSlice";
import usersSlice from "./usersSlice";
import playerSlice from "./playerSlice";
import PenaltyRunSlice from "./penaltyRunsSlice";
import EventTypeSlice from "./eventTypesSlice";
import eventSlice from "./eventsSlice";
import roleSlice from "./roleSlice";
import CompetitionSlice from "./competitionSlice";
import TeamSlice from "./teamSlice";
import changePasswordSlice from "./changePasswordSlice";
import importMarketSlice from "./importMarketSlice";
import BlockSlice from "./BlockSlice";
import ConfigSlice from "./ConfigSlice";
import pageFormatSlice from "./pageFormatSlice";
import pageSlice from "./pageSlice";
import MenuTypeSlice from "./menuTypeSlice";
import NewsSlice from "./newsSlice";
import photoLibrarySlice from "./photoLibrarySlice";
import videoLibrarySlice from "./videoLibrarySlice";
import photosSlice from "./photosSlice";
import marketTemplateSlice from "./marketTemplateSlice";
import eventMarketSlice from "./eventMarketSlice";
import addVendorSlice from "./addVendorSlice";
import displayStatusSlice from "./displayStatusSlice";
import clientSocketSlice from './clientSocketSlice';
import bannerSlice from "./bannerSlice";
import manualEventSlice from "./manualEventSlice";
import addApiSlice from "./addApiSlice";
import addApiEndpointSlice from "./addApiEndpointSlice";
import addNotificationSlice from "./addNotificationSlice";
import addTemplateSlice from "./addTemplateSlice";
import addClientSlice from "./addClientSlice";
import addMailSettingsSlice from "./addMailSettingsSlice";
import socialMediaSlice from "./socialMediaSlice";
import awardSlice from "./awardSlice";
import shotTypeSlice from "./shotTypeSlice";

const rootReducer = combineReducers({
  tab: TabSlice,
  commentary: CommentarySlice,
  matchType: MatchTypeSLice,
  user: usersSlice,
  player: playerSlice,
  penaltyRun: PenaltyRunSlice,
  eventType: EventTypeSlice,
  event: eventSlice,
  competition: CompetitionSlice,
  team: TeamSlice,
  role: roleSlice,
  changePassword: changePasswordSlice,
  importMarket: importMarketSlice,
  block: BlockSlice,
  config: ConfigSlice,
  pageFormat: pageFormatSlice,
  page: pageSlice,
  menuType: MenuTypeSlice,
  news: NewsSlice,
  photoLibrary : photoLibrarySlice,
  videoLibrary : videoLibrarySlice,
  photos : photosSlice,
  marketTemplate: marketTemplateSlice,
  eventMarket: eventMarketSlice,
  vendors: addVendorSlice,
  displayStatus: displayStatusSlice,
  clientSocket: clientSocketSlice,
  banner: bannerSlice,
  manualEvent: manualEventSlice,
  apis: addApiSlice,
  apiEndpoints: addApiEndpointSlice,
  notification: addNotificationSlice,
  template: addTemplateSlice,
  client: addClientSlice,
  mailSettings: addMailSettingsSlice,
  award: awardSlice,
  socialMedia: socialMediaSlice,
  shotType: shotTypeSlice,
});

export default rootReducer;

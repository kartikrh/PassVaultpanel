import { combineReducers } from "@reduxjs/toolkit";
import TabSlice from "./tabsSlice";
import usersSlice from "./usersSlice";
import roleSlice from "./roleSlice";
import changePasswordSlice from "./changePasswordSlice";
import BlockSlice from "./BlockSlice";
import ConfigSlice from "./ConfigSlice";
import pageFormatSlice from "./pageFormatSlice";
import pageSlice from "./pageSlice";
import MenuTypeSlice from "./menuTypeSlice";
import NewsSlice from "./newsSlice";
import photoLibrarySlice from "./photoLibrarySlice";
import videoLibrarySlice from "./videoLibrarySlice";
import photosSlice from "./photosSlice";
import clientSocketSlice from "./clientSocketSlice";
import bannerSlice from "./bannerSlice";
import addApiSlice from "./addApiSlice";
import addApiEndpointSlice from "./addApiEndpointSlice";
import addNotificationSlice from "./addNotificationSlice";
import addClientSlice from "./addClientSlice";
import addMailSettingsSlice from "./addMailSettingsSlice";
import socialMediaSlice from "./socialMediaSlice";
import countryCodeSlice from "./countryCodeSlice";
import notificationConfigSlice from "./notificationConfigSlice";
import packageSlice from "./packageSlice";
import paymentMethodSlice from "./paymentMethodSlice";
import WhiteLabelSlice from "./WhiteLabelSlice";
import advertiseSlice from "./advertiseSlice";
import addTemplateSlice from "./addTemplateSlice";

const rootReducer = combineReducers({
  tab: TabSlice,
  user: usersSlice,
  role: roleSlice,
  changePassword: changePasswordSlice,
  block: BlockSlice,
  config: ConfigSlice,
  pageFormat: pageFormatSlice,
  page: pageSlice,
  menuType: MenuTypeSlice,
  news: NewsSlice,
  photoLibrary: photoLibrarySlice,
  videoLibrary: videoLibrarySlice,
  photos: photosSlice,
  clientSocket: clientSocketSlice,
  banner: bannerSlice,
  apis: addApiSlice,
  apiEndpoints: addApiEndpointSlice,
  notification: addNotificationSlice,
  client: addClientSlice,
  mailSettings: addMailSettingsSlice,
  socialMedia: socialMediaSlice,
  countryCode: countryCodeSlice,
  package: packageSlice,
  paymentMethod: paymentMethodSlice,
  notificationConfig: notificationConfigSlice,
  whiteLabel: WhiteLabelSlice,
  advertise: advertiseSlice,
  template: addTemplateSlice,
});

export default rootReducer;

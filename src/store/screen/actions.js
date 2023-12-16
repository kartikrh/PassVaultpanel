import {
  GET_TAB_SCREEN_REF_DATA,
  GET_TAB_SCREEN_DATA,
  SAVE_TAB_SCREEN_DATA,
  GET_TAB_SCREEN_REF_DATA_ERROR,
  SAVE_TAB_SCREEN_DATA_ERROR,
} from "./actionTypes"

export const getTabScreenData = data => {
  return {
    type: GET_TAB_SCREEN_REF_DATA,
    payload: { data },
  }
}
export const errorGetTabScreenData = err => {
  return {
    type: GET_TAB_SCREEN_REF_DATA_ERROR,
    payload: { err },
  }
}

export const getTabScreenRefData = user => {
  return {
    type: GET_TAB_SCREEN_DATA,
    payload: user,
  }
}

export const saveTabScreenData = data => {
  return {
    type: SAVE_TAB_SCREEN_DATA,
    payload: { data },
  }
}
export const eerrorSaveTabScreenData = err => {
  return {
    type: SAVE_TAB_SCREEN_DATA_ERROR,
    payload: { err },
  }
}

/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'FILE',
  selectedFile: null,
  selectedUrl: null,
  isLoading: false,
  temp:0,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
      state.selectedFile = null;
      state.selectedUrl = null;
    },
    setSelectedFile(state, action) {
      state.selectedFile = action.payload;
    },
    setSelectedUrl(state, action) {
      state.selectedUrl = action.payload;
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setTemp(state,action){
      state.temp = state.temp+1
    },
    resetState(state) {
      state.activeTab = 'FILE';
      state.selectedFile = null;
      state.selectedUrl = null;
      state.isLoading = false;
    },
  },
});

export const {
  setActiveTab,
  setSelectedFile,
  setSelectedUrl,
  setIsLoading,
  setTemp,
  resetState
} = homeSlice.actions;

export default homeSlice.reducer;

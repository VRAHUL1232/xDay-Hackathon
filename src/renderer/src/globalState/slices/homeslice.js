/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'FILE',
  selectedFile: null,
  selectedFolder: null,
  folderName: null,
  isLoading: false,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
      state.selectedFile = null;
      state.selectedFolder = null;
      state.folderName = null;
    },
    setSelectedFile(state, action) {
      state.selectedFile = action.payload;
    },
    setSelectedFolder(state, action) {
      state.selectedFolder = action.payload.files;
      state.folderName = action.payload.folderName;
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    resetState(state) {
      state.activeTab = 'FILE';
      state.selectedFile = null;
      state.selectedFolder = null;
      state.folderName = null;
      state.isLoading = false;
    },
  },
});

export const {
  setActiveTab,
  setSelectedFile,
  setSelectedFolder,
  setIsLoading,
  resetState
} = homeSlice.actions;

export default homeSlice.reducer;

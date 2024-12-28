/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './slices/homeslice';

export const store = configureStore({
  reducer: {
    home: homeReducer,
  },
});

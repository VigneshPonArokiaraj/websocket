import { createSlice } from "@reduxjs/toolkit";

const underlyingInitialState = { 
    underlyingList: []
};

export const UnderlyingSlice = createSlice({
    name: 'category',
     initialState: underlyingInitialState,
     reducers: {
        getUnderlyingList(state) {
            return state.underlyingList;
        },
        setUnderlyingList(state, action) {
            state.underlyingList = action.payload.underlyingList;
        }
     }
})

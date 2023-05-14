import { createSlice } from "@reduxjs/toolkit";

const derivativeInitialState = { 
    derivativeList: []
};

export const DerivativeSlice = createSlice({
    name: 'category',
     initialState: derivativeInitialState,
     reducers: {
        getDerivativeList(state) {
            return state.derivativeList;
        },
        setDerivativeList(state, action) {
            state.derivativeList = action.payload.derivativeList;
        }
     }
})

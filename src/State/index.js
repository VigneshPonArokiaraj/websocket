import { configureStore } from '@reduxjs/toolkit';

import { UnderlyingSlice } from './Slices/UnderlyingSlice';
import { DerivativeSlice } from './Slices/DerivativeSlice';

const Store = configureStore({
    reducer: { 
        underlyings: UnderlyingSlice.reducer,
        derivatives: DerivativeSlice.reducer
    }
})

export const underlyingAction = UnderlyingSlice.actions;
export const derivativeAction = DerivativeSlice.actions;

export default Store;
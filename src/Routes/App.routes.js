
import { Navigate } from "react-router-dom";

import Derivatives from "../Components/Derivatives";
import Underlyings from "../Components/Underlyings";


export const routes = [
    { path: '/', element: <Navigate to="underlying"/> },
    { path: 'underlying', element: <Underlyings /> },
    { path: 'derivatives/:token', element: <Derivatives /> },
    {
        path: '*',
        element: <Navigate to="/underlying"/>
    }
];
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './App.css';
import { routes } from './Routes/App.routes';

const router = createBrowserRouter(routes);
function App() {
  return <>
    <RouterProvider router={router}></RouterProvider>
  </>;
}

export default App;

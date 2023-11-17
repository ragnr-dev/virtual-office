import React from 'react';
// import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import routes from "./routes";
import {initializeIcons} from "@fluentui/react";
import ReactDOM from 'react-dom';

initializeIcons();

const router = createBrowserRouter(routes);

// Temporarily disabled. Downgrading React & ReactDOM for compatibility with @fluid-experimental/react-inputs
// const root = ReactDOM.createRoot(
//     document.getElementById('root') as HTMLElement
// );
// root.render(
//     // <React.StrictMode>
//     <RouterProvider router={router}/>
//     // </React.StrictMode>
// );
ReactDOM.render(
    // <React.StrictMode>
    <RouterProvider router={router}/>
// </React.StrictMode>
    , document.getElementById('root') as HTMLElement
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

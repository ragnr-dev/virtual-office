import {RouteObject} from "react-router-dom";
import Landing from "./Landing";
import Room from "./Room";
import React from "react";
import App from "./App";

const routes: RouteObject[] = [
    {
        path: "/",
        element: <App/>,
        children: [
            {index: true, element: <Landing/>},
            ...["/room/:roomId", "/room/:roomId/:containerId"].map((path) => ({
                path: path,
                element: <Room/>,
            })),
            {path: "*", element: <>Not Found</>},
        ],
    },
];

export default routes;
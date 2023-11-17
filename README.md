# Virtual Office

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Purpose

This tool provides a unified audio/video meeting experience alongside a collaborative note pad that can be shared by
users. Simply create a room then copy the link and share.

Azure Communication Services (ACS) provides the audio/video features, in combination with their Communications UI
library.

The Azure Fluid Relay Service (FRS) provides the real-time synchronization of the shared note pad.

#### -+- Disclaimer -+-

This is a proof of concept application, so you will find it lacking test coverage.

Shortcuts were taken to avoid setting up additional backend resources beyond ACS and FS, thus there are some security
concerns with this implementation:

- The connection to ACS is managed using a connection string, which includes an access key.
    - This was done to simplify creating users, rooms, and adding participants to rooms.
    - However, connection strings/access keys should not be exposed to the client.
    - Such operations could be done using an appropriate token credential provided by some backend, such as a serverless
      function, and potentially coupled with an authentication mechanism (e.g. MSAL).
- The connection to FRS uses an insecure token provider, which requires a tenant id and key.
    - This was done to simplify creating and connecting to fluid relay containers.
    - As above, keys should not be exposed to the client.
    - An alternative token credential provider can request tokens from some endpoint, perhaps a serverless function, and
      tie into an authentication mechanism as previously mentioned.

Additional work should also be done to:
- Clean up expired fluid containers (likely a scheduled job, possibly a serverless function)
- Handle errors connecting to an expired fluid container, perhaps creating another as replacement
- Associating ACS room IDs and FRS container IDs in some backend data store, associated to a separate unique ID to support better link sharing (to cleanly handle room/container expiration)


## Pre-requisites

Create a `.env` file at the root of the project. The `sample.env` can be used for reference.

Create an Azure Communication Services resource [[Reference Docs](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/create-communication-resource)]

Provision an Azure Fluid Relay service [[Reference Docs](https://learn.microsoft.com/en-us/azure/azure-fluid-relay/how-tos/provision-fluid-azure-portal)]

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more
information.

### `yarn run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will
remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right
into your project so you have full control over them. All of the commands except `eject` will still work, but they will
point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you
shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t
customize it when you are ready for it.

## Learn More

You can learn more in
the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

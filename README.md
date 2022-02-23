# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

| File or Folder | Purpose                              |
| -------------- | ------------------------------------ |
| `app/`         | content for UI frontends goes here   |
| `db/`          | your domain models and data go here  |
| `srv/`         | your service models and code go here |
| `package.json` | project metadata and configuration   |
| `readme.md`    | this getting started guide           |

## Prerequesites

- You need to have an account (trial or productive) on SAP BTP
- Install Cloud Foundry CLI. [This tutorial](https://developers.sap.com/tutorials/cp-cf-download-cli.html) shows you how to get it.
- On top of that you'll need the SAP Multi-Apps plugin. [Get it here](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/27f3af39c2584d4ea8c15ba8c282fd75.html).
- Create a `default-env.json` in the root folder of your project(download its contents after first deployment of the app): copy the content of the xsuaa-entry from the environment variables of the deployed OData-Service.
- Configure the .env file with your secrets

  ```.env
  AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN=***

  MS_GRAPH_CLIENT_SECRET=***
  ```

  For Azure Devops generate an access token with (TODO: which scope?). Follow [this blog post by Robert Ejipe](https://blogs.sap.com/2020/10/12/consuming-microsoft-365-api-in-the-cloud-application-programming-cap-model/) in order to connect to MS Graph:

## Getting started

- Install dependencies `npm i`
- If you want to use HANA during development you'll need to start your HANA-Cloud instance via [HANA Cloud Central](https://hana-cockpit.cfapps.eu20.hana.ondemand.com/hcs/sap/hana/cloud/index.html#/org/50d59471-be89-4951-b445-af9b039a65d0/space/f9a3b50a-0aa6-4c57-888a-3be68783b304/databases?databaseguid=c6dfb27b-84cf-4c14-a27e-d52239d8a773)
- Start the app locally with `npm run start:all`. This starts
  - the approuter (for authentication and for obtaining the JWT-token)
  - the srv
  - the UI5 apps
    Go to http://localhost:5000/index.html. This address will route you to your IDP where you log in and get your token. Afterwards it will route to http://localhost:8080/fiori.html where your development-launchpad waits.

## Explanations

### MS Graph

- TODO: Ergänzung mit Link auf MSGraph API

### The app-router during development

- The approuter is configured via [xs-app.json](./xs-app.json). It listens to all requests and routes them to the frontend-app or backend-destinations depending on the matched route. When you start the UI5-app a UI5-simple-proxy will re-route all backend-requests to the approuter-address (e.g. to http://localhost:5000). From there it will be routed to the CAP-Service (listening on http://localhost:4004). This mechanism guarantess that the JWT-token is passed to the backend while at the same time CORS-errors are prevented.

## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.

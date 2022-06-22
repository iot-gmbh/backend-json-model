# Overview

[[_TOC_]]

Welcome to _project-planning_ - the successor of "IOT Projektaufschreibung".

It contains these folders and files, following our recommended project layout:

| File or Folder | Purpose                              |
| -------------- | ------------------------------------ |
| `app/`         | content for UI frontends goes here   |
| `db/`          | your domain models and data go here  |
| `srv/`         | your service models and code go here |
| `package.json` | project metadata and configuration   |
| `readme.md`    | this getting started guide           |

# Prerequisites

- You need to have an account (trial or productive) on SAP BTP
- Install Cloud Foundry CLI. [This tutorial](https://developers.sap.com/tutorials/cp-cf-download-cli.html) shows you how to get it.
- On top of that you'll need the SAP Multi-Apps plugin. [Get it here](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/27f3af39c2584d4ea8c15ba8c282fd75.html).
- Create a `default-env.json` in the root folder of your project (download its contents after first deployment of the app): copy the content from the environment variables of the deployed OData-Service.
- Configure the .env file with your secrets

  ```dotenv
  AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN=***

  MS_GRAPH_CLIENT_SECRET=***
  ```

  For Azure Devops generate an access token with READ-authorizations for issues / work-items. Follow [this blog post by Robert Ejipe](https://blogs.sap.com/2020/10/12/consuming-microsoft-365-api-in-the-cloud-application-programming-cap-model/) in order to connect to MS Graph (see ).

# Getting started

- Install dependencies `npm i`
- If you want to use HANA during development you'll need to start your HANA-Cloud instance via [HANA Cloud Central](https://hana-cockpit.cfapps.eu20.hana.ondemand.com/hcs/sap/hana/cloud/index.html#/org/50d59471-be89-4951-b445-af9b039a65d0/space/f9a3b50a-0aa6-4c57-888a-3be68783b304/databases?databaseguid=c6dfb27b-84cf-4c14-a27e-d52239d8a773)
- Start the app locally with `npm run start:all`. This starts
  - the approuter (for authentication and for obtaining the JWT-token)
  - the srv
  - the UI5 apps
    Go to http://localhost:5000/index.html. This address will route you to your IDP where you log in and get your token. Afterwards it will route to http://localhost:8080/fiori.html where your development-launchpad waits.

# UI5-apps

The most important app is the [single-planning-calendar](/app/single-planning-calendar/). New work-items are registered via this app. Multiple admin apps provide functionality to edit projects, users or customers (...). The single-planning-calendar is as of 2022-03-02 the only "UI5-app", all other apps are "Fiori elements apps" - generated out of the service's annotations.

# The data model

You find the data model in [/db/schema.cds](/db/schema.cds). There are users, projects, packages, work-items and customers. Each user can be allocated to a project by adding an entry in the `n:m`-allocation-table `Users2Projects`. This allocation decides, whether the project is shown for the user to select when he/she edits work-items via the dialog in the single-planning-calendar.

# Integrations

At this point in time, the application provides for two integrations:

- Azure DevOps and
- MS Graph

Further integrations (e.g. GitLab) are possible.

Both existing integrations are used to provide unconfirmed work-items that are to be confirmed by the user. During the alpha-test (performed by employees of IOT GmbH) the MS Graph integration turned out to be an essential feature, whereas the Azure DevOps integration has not been used a lot. Anyhow in order to start the app, both integrations have to be configured: During development, the secrets for connecting to DevOps / MS Graph are stored in the `.env`-file in the root of the project:

```dotenv
AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN=***

MS_GRAPH_CLIENT_SECRET=***
```

For the deployed application, the secrets have to be provided differently:

- The Azure DevOps secret is provided as a "User-Provided Variable" on the deployed service. Get the token by generating a new token with "READ" authorization for Issues.
- The MS-Graph token needs to be entered for the destination "MicrosoftGraphIOTGmbH" (see mta.yaml) within the BTP-UI after the app has been deployed for the first time. Get the token by creating tokens for the registered app (see the following linked blogpost).

The Azure DevOps integration was inspired by [this blog post by Robert Ejipe](https://blogs.sap.com/2020/10/12/consuming-microsoft-365-api-in-the-cloud-application-programming-cap-model/). We are using [his library](https://github.com/sapmentors/cds-scp-api) for connecting to MS Graph.

For each integration there is a .cds-file and a respective .js-implementation (see [/srv/msgraph-service](/srv/msgraph-service.cds) or [/srv/azure-devops](/srv/azure-devops.cds)). Thus each integration is encapsulated in an (OData)-service respectively.

# Work-items

Each unit of work is documented through a "work-item". A work-item documents a duration of work, carried out by an employee and allocates it to a project and a customer consequently. Work-items come from different sources: either your O365 calendar (=> MS Graph integration) or your Azure DevOps board (=> DevOps integration) or you create an entirely new work-item.

Work-items from an integration will be shown as a proposal (expressed through dotted-lines) in the single-planning-calendar. When a user confirms them and allocates them to the project-hierarchy, a reference to the work-item and its allocation will be persisted. The work-item will appear in a straight line after it has been confirmed. The CRUD-functionality for work-items (see [/srv/timetracking-service.cds](/srv/timetracking-service.cds)) is overwriting the standard-functionality.

# Technical Explanations

## Databases

During its lifetime the project has been targeting different databases:

- SQLite during local development (this is CAP's recommendend development-DB and works smoothely)
- HANA for production (since as of 2022-03-02 it's the only officially supported DB). The cheapest variant of HANA means operating costs of ~800€ / month which is very expensive. In order to look it up, first go to the [capacity-estimator](https://hcsizingestimator.cfapps.eu10.hana.ondemand.com/), then calculate the price for capacity-units based on your licence-model via the [BTP-estimator](https://www.sap.com/products/business-technology-platform/price-list/estimator-tool.html).
- PostgreSQL as alternative for production. There are multiple files (e.g. package.json and mta.yaml) which still contain artifacts that have been used to connect to a Postgres-DB via the according [open-source adapter made by the SAP mentors](https://github.com/sapmentors/cds-pg). In order to deploy the app and migrate its data, another open-source library has been used [cds-dbm](https://github.com/mikezaschka/cds-dbm). Yet, cds-dbm does not seem to receive regular support, so the Postgres-support of this repo (project-planning) has not been followed up for a couple of months (as of 2022-03-02). The folder /db-deployer-apt/... contains files with a workaround for shortcomings of the cds-dbm module.
  There are also Docker-files in this repo, that have been used to test Postgres locally. This [repo of Gregor Wolf](https://github.com/gregorwolf/pg-beershop) served as a major source of inspiration.
  Meanwhile SAP has announced to officially support a Postgres-adapter: https://twitter.com/wolf_gregor/status/1496865985739079687/photo/2

## Deployment to Heroku

## Authentication with Microsoft MSAL

The app is designed to be running standalone without BTP. Thus we cannot use BTP XSUAA-service for authentication. As we want to provide access to users from Azure AD, we need to integrate [MSAL (Microsoft Authentication Library)](https://www.npmjs.com/package/@azure/msal-node). MSAL is available for different products: Single-Page-Apps (SPA's), NodeJS-Apps and others. We decided for msal-node as the application contains a full nodejs backend including API. According to this [discussion on GitHub](https://github.com/AzureAD/microsoft-authentication-library-for-js/discussions/3549), msal-browser is used for SPA's with an existing API. The MSAL-integration is explained in detail on the [MS-tutorial-page](https://docs.microsoft.com/de-de/azure/active-directory/develop/msal-node-migration). The authentication flow is inspired by this [MSAL-sample-application](https://github.com/Azure-Samples/ms-identity-node).

The MSAL-authentication flow for CAP is extracted into its own package: `cds-msal-auth` (https://github.com/BenediktHoelker/cds-msal-auth.git)

## The app-router during development

The approuter is configured via [xs-app.json](./xs-app.json). It listens to all requests and routes them to the frontend-app or backend-destinations depending on the matched route. When you start the UI5-app a UI5-simple-proxy will re-route all backend-requests to the approuter-address (e.g. to http://localhost:5000). From there it will be routed to the CAP-Service (listening on http://localhost:4004). This mechanism guarantess that the JWT-token is passed to the backend while at the same time CORS-errors are prevented.

## Analytics

For analytic purposes, data can be analyzed with an analytic list page (see [/app/](/app/workitems-alp/)). This allows users to drill down through their work and derive reasoned decisions in the future.

# Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.

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

- Azure AD tenant

Provide a .env file, corresponding to the .env-example file and fill out all the entries with the corresponding information from Azure AD

# Getting started

- Install dependencies `npm i`
- Run `npm start`

# UI5-apps

The most important app is the [single-planning-calendar](/app/single-planning-calendar/). New work-items are registered via this app. Multiple admin apps provide functionality to edit projects, users or customers (...). The single-planning-calendar is as of 2022-03-02 the only "UI5-app", all other apps are "Fiori elements apps" - generated out of the service's annotations.

# The data model

You find the data model in [/db/schema.cds](/db/schema.cds). There are users, projects, packages, work-items and customers. Each user can be allocated to a project by adding an entry in the `n:m`-allocation-table `Users2Projects`. This allocation decides, whether the project is shown for the user to select when he/she edits work-items via the dialog in the single-planning-calendar.

# Integrations

At this point in time, the application provides for two integrations:

- Azure DevOps and
- MS Graph

Further integrations (e.g. GitLab) are possible.

Both existing integrations are used to provide unconfirmed work-items that are to be confirmed by the user. During the alpha-test (performed by employees of IOT GmbH) the MS Graph integration turned out to be an essential feature, whereas the Azure DevOps integration has not been used a lot. Anyhow in order to start the app, both integrations have to be configured: During development, the secrets for connecting to DevOps / MS Graph are stored in the `.env`-file in the root of the project.

For each integration there is a .cds-file and a respective .js-implementation (see [/srv/msgraph-service](/srv/msgraph-service.cds) or [/srv/azure-devops](/srv/azure-devops.cds)). Thus each integration is encapsulated in an (OData)-service respectively.

# Work-items

Each unit of work is documented through a "work-item". A work-item documents a duration of work, carried out by an employee and allocates it to a project and a customer consequently. Work-items come from different sources: either your O365 calendar (=> MS Graph integration) or your Azure DevOps board (=> DevOps integration) or you create an entirely new work-item.

Work-items from an integration will be shown as a proposal (expressed through dotted-lines) in the single-planning-calendar. When a user confirms them and allocates them to the project-hierarchy, a reference to the work-item and its allocation will be persisted. The work-item will appear in a straight line after it has been confirmed. The CRUD-functionality for work-items (see [/srv/timetracking-service.cds](/srv/timetracking-service.cds)) is overwriting the standard-functionality.

# Technical Explanations

## Databases

During its lifetime the project has been targeting different databases:

- SQLite during local development (this is CAP's recommendend development-DB and works smoothely)
- PostgreSQL for test and production

### SQLite

SQLite is used for development. Section [Switching Profiles](#switching-profiles) explains how to activate the `development` profile.

### Postgres

Postgres is used for test and production (again see [Switching Profiles](#switching-profiles)). The local Postgres-DB can be instantiated with docker and this [docker-compose.yaml](./docker-compose.yaml) respectively. To setup the DB, Docker needs to be installed on the local machine. Afterwards run the script `docker:start:pg`. This will instantiate a docker container with a database listening on port 5432.

> Note:
> If Postgres is also installed locally on Windows there might be conflicts. If you get a message like `wrong password for user *Windows_User*` probably you are trying to reach the local Postgres. The solution is to open Task manager and stop the Postgres-Service.

The connection to the Postgres-DB is created by `cds-pg`, DB-deployment is done with `cds-dbm`. Both adapters are created by the CAP-community and are open-source products.

> Note:
> Heroku requires certain SSL-configurations when deploying to its Postgres-Service. Thus we needed to perform slight modifications of `cds-dbm`'s `PostgresAdapter.ts`. Atm the package is referenced locally via `file:../cds-dbm`, so it needs to be cloned first (https://github.com/BenediktHoelker/cds-dbm).

## Deployment to Heroku

Deploying to Heroku is inspired by Gregor Wolf's [pg-beershop] (https://github.com/gregorwolf/pg-beershop). Atm project-planning is using Benedikt's private Heroku-account.

In order to deploy the DB to Heroku you configure the connection information in default-env.json. `cds-dbm` is running long when a lot of data needs to be processed (due to large initial data sets). The latency can be reduced by performing the DB-deployment from within Heroku. In order to do so you proceed like the following:

Connect to the Heroku dyno by running

```sh
heroku ps:exec
```

`cds-dbm` is using liquibase for DB-migrations. Liquibase in turn needs a JAVA runtime. The JAVA runtime can be added as a buildpack (like Heroku explain in their [FAQ](https://help.heroku.com/2FSHO0RR/how-can-i-add-java-to-a-non-java-app)).

<!-- TODO: Add IOT Heroku deployment -->

## Authentication with Microsoft MSAL

The app is designed to be running standalone without BTP. Thus we cannot use BTP XSUAA-service for authentication. As we want to provide access to users from Azure AD, we need to integrate [MSAL (Microsoft Authentication Library)](https://www.npmjs.com/package/@azure/msal-node). MSAL is available for different products: Single-Page-Apps (SPA's), NodeJS-Apps and others. We decided for msal-node as the application contains a full nodejs backend including API. According to this [discussion on GitHub](https://github.com/AzureAD/microsoft-authentication-library-for-js/discussions/3549), msal-browser is used for SPA's with an existing API. The MSAL-integration is explained in detail on the [MS-tutorial-page](https://docs.microsoft.com/de-de/azure/active-directory/develop/msal-node-migration). The authentication flow is inspired by this [MSAL-sample-application](https://github.com/Azure-Samples/ms-identity-node).

The MSAL-authentication flow for CAP is extracted into its own package: `cds-msal-auth` (https://github.com/BenediktHoelker/cds-msal-auth.git). The library is referenced as custom-authentication-implementation in `.cdsrc`:

```json
    "requires": {
        "auth": {
            "impl": "cds-msal-auth",
```

## Switching Profiles

CAP-profiles are used to distinguish between development, test and production setup locally. _Development_ uses an SQLite-DB, _test_ uses a local Postgres-DB and _production_ uses a remote Postgres-DB, hosted on Heroku. On Unix (or Windows git-bash) the profile is switched in the following way:

```sh
export NODE_ENV=**development/test/production**
```

Furthermore, the corresponding `default-env.json` needs to be configured (telling CAP how to connect to the development-, test-, or production-database). The information for each environment is stored in `/default-envs/development` resp. `/default-envs/test` resp. `/default-envs/production`. The production file contains secrets thus it is not tracked by git.

In order to switch the environment you run the corresponding script:

```json
    "set:dev": "bash ./set-env.sh development",
    "set:test": "bash ./set-env.sh test",
    "set:prod": "bash ./set-env.sh production"
```

The idea for switching environment information via scripts is from a [blogpost](https://blogs.sap.com/2022/01/20/solving-the-complexity-of-using-default-env.json-in-a-project-with-multiple-tiers-or-targets/) by Pieter Janssens.

> Note:
> Setting NODE_ENV and copying default-env-variables cannot be combined into the same script, as the NODE_ENV variable cannot be set via a script.

In production the `dist` folder is served where the UI5-apps have been copied to.

## Analytics

For analytic purposes, data can be analyzed with an analytic list page (see [/app/](/app/workitems-alp/)). This allows users to drill down through their work and derive reasoned decisions in the future.

# Learn More

Update.
Learn more at https://cap.cloud.sap/docs/get-started/.

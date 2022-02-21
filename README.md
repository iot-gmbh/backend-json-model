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

## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).

## Prerequesites

- An account (trial or productive) on SAP BTP
- Cloud Foundry CLI. Get it like this: https://developers.sap.com/tutorials/cp-cf-download-cli.html
- On top of that you'll need the SAP Multi-Apps plugin: https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/27f3af39c2584d4ea8c15ba8c282fd75.html
- Configure the default-env.json (download after first deployment of the app)
- Configure the .env file:

```.env
AZURE_PERSONAL_ACCESS_TOKEN=ywu5maqh3skzvdrfacgbz3dsxcrvdwz2xaez2ugg3nxblubw2cpq

MS_GRAPH_CLIENT_SECRET=RrIF3pAn-LMo52PjY~4_y7I~I3~7S.QiJ1
```

## Getting started

- Install dependencies `npm i`
- HANA-Cloud-Instanz starten per HANA Cloud Central: https://hana-cockpit.cfapps.eu20.hana.ondemand.com/hcs/sap/hana/cloud/index.html#/org/50d59471-be89-4951-b445-af9b039a65d0/space/f9a3b50a-0aa6-4c57-888a-3be68783b304/databases?databaseguid=c6dfb27b-84cf-4c14-a27e-d52239d8a773

- test

## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.

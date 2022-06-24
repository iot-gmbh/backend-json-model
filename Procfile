web: export cds_requires_postgres_credentials_connectionString=$DATABASE_URL && cds run --profile production
release: npm run parse-heroku-creds && npm run deploy:pg
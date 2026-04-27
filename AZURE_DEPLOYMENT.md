# Azure Web App Deployment Guide

This application is configured to run on Azure App Service (Linux).

## Deployment Steps

1. **Create an Azure Web App**:
   - Publish: Code
   - Runtime stack: Node 20 or 22 LTS
   - Operating System: Linux

2. **Configure Environment Variables**:
   In the Azure Portal, go to **Settings > Configuration** and add the following App Settings:
   - `SERVICENOW_HOST`: Your ServiceNow instance URL (e.g., `https://devXXXXX.service-now.com`)
   - `SERVICENOW_USERNAME`: Your ServiceNow username
   - `SERVICENOW_PASSWORD`: Your ServiceNow password
   - `NODE_ENV`: `production`

3. **Deploy the Code**:
   - You can deploy via GitHub Actions, Local Git, or by uploading a ZIP.
   - Azure will automatically run `npm install`, `npm run build`, and `npm start`.

## Important Configuration

- The server listens on `process.env.PORT` as required by Azure.
- The `npm start` command uses `tsx server.ts` to support TypeScript on the server.
- Static files from the React build are served from the `dist/` directory in production mode.

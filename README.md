# Media QA Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A read-only reconciliation service that detects human setup errors by comparing Asana (Source of Truth) against live campaign settings in Google Ads and Meta.

## Features
- **Asana Integration**: Pulls approved campaign flight dates and budgets.
- **Google Ads & Meta Integration**: Fetches live campaign settings.
- **Rules Engine**: Detects mismatches in:
  - Start/End Dates
  - Missing End Dates
  - Daily vs Lifetime Budget mistakes
  - Budget Mismatches (>5% variance)
- **Exception Logging**: Stores all detected errors in a local SQLite database.
- **Automated Feedback**: Posts comments directly to the relevant Asana tasks.

## Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- npm

### 2. Installation
```bash
npm install
```

### 3. Configuration
1. Copy `.env.example` to `.env`.
2. Fill in the required API credentials for Asana, Google Ads, and Meta.
   - **Asana**: Personal Access Token and Project ID.
   - **Google Ads**: Developer Token, Client ID/Secret, and Refresh Token.
   - **Meta**: Access Token and Ad Account ID.

### 4. Running the Bot
To run a reconciliation manually:
```bash
npm start
```

For development mode (with auto-reload):
```bash
npm run dev
```

## Data Model & Normalization
The bot uses a `CampaignData` interface to normalize data from different platforms, allowing for platform-agnostic validation rules.

## Deployment Documentation
- **Local Deployment**: Run as a cron job or a scheduled task on a local server.
- **Cloud Deployment**: Can be deployed as a Lambda function (AWS), Cloud Function (GCP), or a simple Docker container.
- **Security**: All credentials are managed via environment variables. Ensure `.env` is never committed to version control.

## Exception History
Detected exceptions are stored in `./data/history.sqlite`. You can query this database to generate historical reports.

## License

[MIT](LICENSE)

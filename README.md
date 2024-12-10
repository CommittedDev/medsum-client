#Committed guide:


# Medplum Development Setup Guide

This guide outlines the steps required to set up the Medplum clone project, consisting of both the server and client components.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** version 20 or higher.
- **Docker** (for containerized services).

## Step 1: Clone the Repositories

Clone the server and client repositories to your local machine:

```bash
  git clone https://github.com/CommittedDev/medsum-medplum-srv.git
  git clone https://github.com/CommittedDev/medsum-client.git
```

## Step 2: Validate Environment
Make sure your Node.js version is 20+ and Docker is running. You can check your Node.js version with:

```bash
  node -v
```
## Step 3: Install Dependencies
Navigate to the server and client directories and install the necessary dependencies:

For the server (medsum-medplum-srv):

```bash
cd medsum-medplum-srv
npm ci
```

For the client (medsum-client):

```bash
cd medsum-client
npm install
```

## Step 4: Start Docker and Build
Start Docker Compose from the root folder:

```bash
docker-compose up
```

Build the client with the following command:

```bash
npm run build:fast
```

## Step 5: Start the Server
To start the server:

Navigate to the medsum-medplum-srv directory:

```bash
cd medsum-medplum-srv/packages/server/
```

Run the development server:

```bash
npm run dev
```

Validate that the server is running by visiting the health check endpoint:

http://localhost:8103/healthcheck

## Step 6: Start the Client
To run the client:

Navigate to the medsum-client directory:

```bash
cd medsum-client
```

Start the client development server:

```bash
npm run dev
```

After this, you should be able to access the application at http://localhost:3000. You will see an empty list of patients.

## Step 7: Set Up Admin User
To login user the admin user, use the following credentials:

Email: admin@example.com
Password: medplum_admin
Log in at http://localhost:3000.

# Step 8: Run the Admin App
Navigate to the medsum-medplum-srv directory and start the Admin app:

```bash
cd medsum-medplum-srv/packages/app/
npm run dev
```

Download the sample data files from the Medplum documentation:
https://www.medplum.com/docs/tutorials/importing-sample-data

Importing Sample Data
Import the JSON files through the Admin app at http://localhost:3001/batch.

## Step 9: Verify Data
After importing the sample data, you should see two patients listed in the client application at http://localhost:3000.

## Conclusion
You have successfully set up the Medplum clone locally! You can now begin developing and testing the application.




<h1 align="center">Medplum Hello World</h1>
<p align="center">A starter application for using the Medplum platform.</p>
<p align="center">
<a href="https://github.com/medplum/medplum-hello-world/blob/main/LICENSE.txt">
    <img src="https://img.shields.io/badge/license-Apache-blue.svg" />
  </a>
</p>

This example app demonstrates the following:

- Creating a new React app with Vite and TypeScript
- Adding Medplum dependencies
- Adding basic URL routing
- Using the [Medplum client](https://www.medplum.com/docs/sdk/classes/MedplumClient) to search for FHIR resources
- Using [Medplum GraphQL](https://graphiql.medplum.com/) queries to fetch linked resources
- Using [Medplum React Components](https://storybook.medplum.com/?path=/docs/medplum-introduction--docs) to display FHIR data

### Getting Started

If you haven't already done so, follow the instructions in [this tutorial](https://www.medplum.com/docs/tutorials/register) to register a Medplum project to store your data.

[Fork](https://github.com/medplum/medplum-hello-world/fork) and clone the repo.

Next, install the dependencies

```bash
npm install
```

Then, run the app

```bash
npm run dev
```

This app should run on `http://localhost:3000/`

### About Medplum

[Medplum](https://www.medplum.com/) is an open-source, API-first EHR. Medplum makes it easy to build healthcare apps quickly with less code.

Medplum supports self-hosting, and provides a [hosted service](https://app.medplum.com/). Medplum Hello World uses the hosted service as a backend.

- Read our [documentation](https://www.medplum.com/docs)
- Browse our [react component library](https://storybook.medplum.com/)
- Join our [Discord](https://discord.gg/medplum)

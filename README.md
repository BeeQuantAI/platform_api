# BeeQuant Core platform_api
Platform api is a GraphQL-based server-side application that interacts with a PostgreSQL database. This project is set up using Node.js and can be utilized as a starting point for building robust backend services.

## Environment setup

Before you begin, make sure you have Node.js and Yarn package manager installed on your machine. You will also need PostgreSQL installed and running locally.

Follow these steps to set up your environment:

### Database Setup

1. Set up your local PostgreSQL database.
2. Ensure that PostgreSQL is running on port `5432` (or update the `.env` file with your custom port).

### Application Setup

1. Clone this repository to your local machine.
2. Navigate to the project root directory in your terminal.
3. Run `yarn` to install all the necessary dependencies.
4. Create a `.env` file in the root directory and add the following environment variables:

```sh
DB_NAME=bqCore
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CORE_ADMIN
JWT_SECRET=hello_beeQuant
```

Make sure to replace `CORE_ADMIN` with the actual password for your local PostgreSQL instance.

### Start Developing Work

Once the environment setup is complete, you can start the development server:

Run `yarn start` for a production server or `yarn start:dev` for a development server.
Navigate to `http://localhost:3000/graphql` in your web browser to test queries and mutations using the interactive GraphQL playground.

### Test

The project comes with pre-configured unit and end-to-end (e2e) tests. To run these tests and check code coverage, use the following commands:

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

These tests are essential for ensuring your application runs correctly before deployment.


## Running public queries 
Navigate to web app: http://localhost:5173/, to create(register) users
Make sure the project is running at: http://localhost:3000/graphql
Running an example query like:

```
query GetUsers {
  getUsers {
    id
    email
  }
}
```

## To run a PostgreSQL database locally:

1. Install docker locally:https://www.docker.com/get-started
2. Pull the PostgreSQL Image:
   ```
   docker pull postgres
   ```
3. Run a PostgreSQL Container:
   ```
   docker run --name bqCore -e POSTGRES_PASSWORD=CORE_ADMIN -e POSTGRES_DB=bqCore -p 5432:5432 -d postgres
   ```
4. Wait for the Container to Start and check the container's status:

   ```
   docker ps
   ```

5. Download a DBeaver: https://dbeaver.io/download/, connect your db using DBeaver by using the following config:
   ```
   Host: localhost
   Port: 5432
   Database: bqCore
   Username: postgres
   Password: CORE_ADMIN
   ```

6 (optional). Stop and remove the container: (you need to run step 3 again once you remove it):

```
docker stop bqCore
docker rm bqCore
```
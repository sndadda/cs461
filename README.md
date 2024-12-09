# cs461 Student Evaluation
In order to use this application, you need to have both Node.js and PostgreSQL installed.

### Install Node.js
You can download Node.js here: [Node.js](https://nodejs.org/en)

To check if you have Node.js installed, you can run:

```bash
node -v
```

### Install PostgreSQL
You can download PostgreSQL here: [PostgreSQL](https://www.postgresql.org/download/)

To check if you have PostgreSQL installed, you can run:

```bash
psql --version
```

## Getting Started
### 1. Clone the Repository Locally
Click the green **Code** button and copy the url. Then, open the terminal and `cd` to the directory you want to store the project in.

Run the following command to clone the repository:
```bash
git clone <repository-url>
```

### 2. Install Dependencies
Once you have cloned the repository, navigate to where the project files are located and `cd` to the `peer-eval` folder.
```bash
cd <your-project-directory>/peer-eval
```

We then have to install all the necessary dependencies by running the following command:
```bash
npm i
```

### 3. Setup Environment Variables
Create a `env.json` file inside the backend folder with the following information:

This can be found in the `env_template.json` file inside the backend folder
```json
{
  "DB_USER": "Your PostgreSQL username",
  "DB_HOST": "localhost",
  "DB_NAME": "Name of your Database",
  "DB_PASSWORD": "Your PostgreSQL password",
  "DB_PORT": 5432
}
```

### 4. Start the Frontend Server
Open a terminal and navigate to the `peer-eval` folder of the project using the following command:
```bash
cd <your-project-directory>/peer-eval
```

After you are in this folder, run:
```bash
npm start
```

Now, the development server should be running. We then have to start the backend server.

### 5. Start Backend Server
Open a new terminal and navigate to the `backend` folder of the project using the following command:
```bash
cd <your-project-directory>/peer-eval/backend
```

After you are in this folder, run:
```bash
node server.js
```

Now you are all set!
## Local Setup Instructions

Follow these steps to get the application running locally on your machine:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/TasksTodayFE.git
cd TasksTodayFE
```

### 2. Install dependencies

Make sure you have Node.js installed (version 14 or higher recommended).

Install the project dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root of the project to configure environment variables.

Here is an example `.env` file:

```
VITE_API_BASE_URL=https://api.example.com
VITE_OTHER_ENV_VAR=value
```

- `VITE_API_BASE_URL`: The base URL for your API endpoints.
- Add any other environment variables your app requires, prefixed with `VITE_`.

### 4. Run the development server

Start the local development server with:

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).
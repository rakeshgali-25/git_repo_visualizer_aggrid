🧩 GitHub Org Repos — AG Grid Viewer

A modern React + Vite application that fetches all repositories of any GitHub organization and displays them in a stylish AG Grid table with CSV export, sorting, filtering, and pagination.

🚀 Features
🔍 GitHub Organization Search

Enter any GitHub organization name (e.g., philips-software).

Handles invalid org names gracefully (404 handling).

📊 Full Repository Analytics

Fetched fields include:

Repository Name

Language

Stars ⭐

Forks 🍴

Open Issues

Archived Status

Last Push Date

🖥️ AG Grid Table

Sorting / Filtering

Resizable columns

Clean Quartz UI

Smooth row animations

Row height customization

Right-click CSV export & dedicated Export CSV button

📤 Export Options

CSV Export (built-in)

Excel export (only if AG Grid Enterprise is installed)

📸 UI Preview
Main Interface

🛠️ Tech Stack

React 18

Vite

AG Grid (Community Edition)

GitHub REST API

📦 Installation & Setup
1️⃣ Clone this repo
git clone https://github.com/your-username/github-org-repos-aggrid.git
cd github-org-repos-aggrid

2️⃣ Install dependencies
npm install

3️⃣ Start development server
npm run dev


Vite will serve the project at:
👉 http://localhost:5173/

🧠 How It Works
Fetching Repositories

The app fetches all pages of repos until no further data is available:

while (true) {
  const res = await fetch(
    `https://api.github.com/orgs/${trimmed}/repos?per_page=100&page=${page}`
  );
  ...
}

Error Handling

Invalid org names are caught:

if (res.status === 404) {
  setError(`Organization "${trimmed}" not found.`);
}

CSV Export

AG Grid built-in exporter:

gridRef.current.api.exportDataAsCsv({
  fileName: `${org}-repos.csv`
});


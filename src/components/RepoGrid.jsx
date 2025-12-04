import React, { useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./RepoGrid.css"; // optional: your component specific styles

ModuleRegistry.registerModules([AllCommunityModule]);

const DEFAULT_ORG = "philips-software";

export default function RepoGrid() {
  const [org, setOrg] = useState(DEFAULT_ORG);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const gridRef = useRef(null);

  const columnDefs = [
    { headerName: "Repository", field: "name", width: 300 },
    { headerName: "Language", field: "language", width: 150 },
    { headerName: "Stars", field: "stargazers_count", width: 150 },
    { headerName: "Forks", field: "forks_count", width: 150 },
    { headerName: "Issues", field: "open_issues_count", width: 150 },
    {
      headerName: "Archived",
      field: "archived",
      width: 110,
      valueFormatter: (p) => (p.value ? "Yes" : "No"),
    },
    {
      headerName: "Last Push",
      field: "pushed_at",
      width: 140,
      valueFormatter: (p) => (p.value ? new Date(p.value).toISOString().slice(0, 10) : ""),
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  const fetchRepos = useCallback(async (orgName) => {
    const trimmed = orgName.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setRepos([]);

    try {
      let page = 1;
      const allRepos = [];

      while (true) {
        const res = await fetch(
          `https://api.github.com/orgs/${trimmed}/repos?per_page=100&page=${page}`
        );

        if (res.status === 404) {
          setError(`Organization "${trimmed}" not found`);
          break;
        }

        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        if (data.length === 0) break;
        allRepos.push(...data);

        if (data.length < 100) break;
        page++;
      }

      setRepos(allRepos);
    } catch (e) {
      setError("⚠ Network or API error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos(DEFAULT_ORG);
  }, [fetchRepos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRepos(org);
  };

  const exportCSV = () => {
    if (!gridRef.current) return;
    gridRef.current.api.exportDataAsCsv({
      fileName: `${org}-repos.csv`,
    });
  };

  return (
    <div className="repogrid-container">
      <div className="header">
        <h1>GitHub Org Repos</h1>
      </div>

      <form onSubmit={handleSubmit} className="search-box">
        <input
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          placeholder="Enter GitHub org…"
        />
        <button>{loading ? "Loading…" : "Search"}</button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {!error && repos.length > 0 && (
        <div className="results-header">
          <span>Showing {repos.length} repositories for <b>{org}</b></span>

          <button className="export-btn" onClick={exportCSV}>
            ⬇ Export CSV
          </button>
        </div>
      )}

      {!error && repos.length > 0 && (
        <div className="ag-theme-quartz grid-wrapper" style={{ height: "60vh", width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={repos}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowHeight={45}
          />
        </div>
      )}

      {!error && repos.length === 0 && !loading && (
        <div className="empty-banner">No repositories found.</div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import "../marketOfficer.css";

interface Submission {
  id: string;
  produceName: string;
  variety?: string;
  grade?: string; // Add grade to the interface
  minPrice: number;
  maxPrice: number;
  unit: string;
  market: string;
  submittedBy: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export default function SubmissionsPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual data from API
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "1",
      produceName: "Maize",
      variety: "White",
      minPrice: 250,
      maxPrice: 300,
      unit: "kg",
      market: "Central Market",
      submittedBy: "John Doe",
      submittedDate: "2024-01-15",
      status: "pending",
      notes: "Good quality, fresh harvest"
    },
    {
      id: "2",
      produceName: "Tomatoes",
      minPrice: 150,
      maxPrice: 200,
      unit: "kg",
      market: "Riverside Market",
      submittedBy: "Jane Smith",
      submittedDate: "2024-01-14",
      status: "approved"
    },
    {
      id: "3",
      produceName: "Beans",
      variety: "Green",
      minPrice: 180,
      maxPrice: 220,
      unit: "kg",
      market: "Central Market",
      submittedBy: "John Doe",
      submittedDate: "2024-01-13",
      status: "rejected",
      notes: "Price out of range"
    },
    {
      id: "4",
      produceName: "Potatoes",
      grade: "Grade A", // Now this is valid
      minPrice: 200,
      maxPrice: 250,
      unit: "kg",
      market: "North Market",
      submittedBy: "Mike Johnson",
      submittedDate: "2024-01-15",
      status: "pending"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return <span className="badge approved">Approved</span>;
      case "rejected":
        return <span className="badge rejected">Rejected</span>;
      default:
        return <span className="badge pending">Pending</span>;
    }
  };

  const handleApprove = (id: string) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status: "approved" } : sub
      )
    );
  };

  const handleReject = (id: string) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status: "rejected" } : sub
      )
    );
  };

  const filteredSubmissions = submissions
    .filter(sub => filter === "all" ? true : sub.status === filter)
    .filter(sub =>
      searchTerm === "" ||
      sub.produceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.market.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const pendingCount = submissions.filter(s => s.status === "pending").length;

  return (
    <div className="officer-page">
      <div className="page-header">
        <h1>Price Submissions</h1>
        {pendingCount > 0 && (
          <div className="pending-badge">{pendingCount} Pending</div>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by produce or market..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${filter === "approved" ? "active" : ""}`}
            onClick={() => setFilter("approved")}
          >
            Approved
          </button>
          <button
            className={`filter-tab ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="submissions-table-container">
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Produce</th>
              <th>Variety/Grade</th>
              <th>Price Range</th>
              <th>Market</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">
                  No submissions found
                </td>
              </tr>
            ) : (
              filteredSubmissions.map(sub => (
                <tr key={sub.id}>
                  <td>{sub.produceName}</td>
                  <td>
                    {sub.variety && <span>{sub.variety}</span>}
                    {sub.grade && <span className="grade-tag">{sub.grade}</span>}
                  </td>
                  <td>
                    GHS {sub.minPrice} - {sub.maxPrice} / {sub.unit}
                  </td>
                  <td>{sub.market}</td>
                  <td>{sub.submittedBy}</td>
                  <td>{new Date(sub.submittedDate).toLocaleDateString()}</td>
                  <td>{getStatusBadge(sub.status)}</td>
                  <td>
                    {sub.status === "pending" && (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleApprove(sub.id)}
                          className="action-btn approve"
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleReject(sub.id)}
                          className="action-btn reject"
                          title="Reject"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                    {sub.status !== "pending" && (
                      <span className="status-text">
                        {sub.status === "approved" ? "✓" : "✗"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="submissions-summary">
        <div className="summary-card">
          <span className="summary-label">Total Submissions</span>
          <span className="summary-value">{submissions.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Pending</span>
          <span className="summary-value pending">{pendingCount}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Approved</span>
          <span className="summary-value approved">
            {submissions.filter(s => s.status === "approved").length}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Rejected</span>
          <span className="summary-value rejected">
            {submissions.filter(s => s.status === "rejected").length}
          </span>
        </div>
      </div>
    </div>
  );
}
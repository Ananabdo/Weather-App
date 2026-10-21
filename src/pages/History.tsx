import { useState } from "react";
import { clearHistory, getHistory } from "../services/history";

export default function History() {
  const [history, setHistory] = useState(getHistory);

  function handleClear() {
    clearHistory();
    setHistory([]);
  }

  return (
    <main className="page">
      <h1 className="title">Search History</h1>
      <p className="subtitle">Every locality you have looked up, newest first.</p>

      <div className="card">
        {history.length === 0 ? (
          <p className="empty">No searches yet. Pick a locality on the Home page.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Locality</th>
                    <th>Country</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td>{new Date(h.time).toLocaleString("en-GB")}</td>
                      <td>{h.city}</td>
                      <td>{h.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn" onClick={handleClear}>Clear history</button>
          </>
        )}
      </div>
    </main>
  );
}

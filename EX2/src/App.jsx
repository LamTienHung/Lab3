import { useState } from "react";
import ScientistCard from "./components/ScientistCard";
import { scientists } from "./data/scientists";
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [minIQ, setMinIQ] = useState("");

  const filteredScientists = scientists.filter((scientist) => {
    const matchesName = scientist.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesIQ = minIQ === "" || scientist.iq >= Number(minIQ);

    return matchesName && matchesIQ;
  });

  return (
    <main>
      <h1>Scientist & Pioneer Directory</h1>
      <p>Explore influential scientists and pioneers.</p>

      <section className="search-section" aria-label="Filter scientists">
        <label htmlFor="scientist-search">Search by name:</label>
        <input
          id="scientist-search"
          type="search"
          placeholder="Enter scientist name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <label htmlFor="min-iq">Minimum IQ:</label>
        <input
          id="min-iq"
          type="number"
          min="0"
          placeholder="Enter minimum IQ..."
          value={minIQ}
          onChange={(event) => setMinIQ(event.target.value)}
        />
      </section>

      <p className="result-count" role="status">
        Showing {filteredScientists.length} scientist(s)
      </p>

      <section className="scientist-grid" aria-label="Scientist list">
        {filteredScientists.map((scientist) => (
          <ScientistCard key={scientist.id} scientist={scientist} />
        ))}
      </section>

      {filteredScientists.length === 0 && (
        <p>No scientists found.</p>
      )}
    </main>
  );
}

export default App;
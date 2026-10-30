import { useState } from "react";
import ScientistCard from "./components/ScientistCard";
import { scientists } from "./data/scientists";
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [minIQ, setMinIQ] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const filteredScientists = scientists
    .filter((scientist) => {
      const matchesName = scientist.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesIQ = minIQ === "" || scientist.iq >= Number(minIQ);

      return matchesName && matchesIQ;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);

        case "name-desc":
          return b.name.localeCompare(a.name);

        case "iq-asc":
          return a.iq - b.iq;

        case "iq-desc":
          return b.iq - a.iq;

        default:
          return 0;
      }
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

        <label htmlFor="sort-by">Sort by:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="default">Default order</option>
          <option value="name-asc">Name (A–Z)</option>
          <option value="name-desc">Name (Z–A)</option>
          <option value="iq-asc">IQ (Low to High)</option>
          <option value="iq-desc">IQ (High to Low)</option>
        </select>
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
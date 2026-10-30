import { useState } from "react";
import ScientistCard from "./components/ScientistCard";
import { scientists } from "./data/scientists";
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredScientists = scientists.filter((scientist) =>
    scientist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main>
      <h1>Scientist & Pioneer Directory</h1>
      <p>Explore influential scientists and pioneers.</p>

      <section className="search-section" aria-label="Search scientists">
        <label htmlFor="scientist-search">Search by name:</label>

        <input
          id="scientist-search"
          type="search"
          placeholder="Enter scientist name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </section>

      <p className="result-count">
        Showing {filteredScientists.length} scientist(s)
      </p>

      <section className="scientist-grid" aria-label="Scientist list">
        {filteredScientists.map((scientist) => (
          <ScientistCard key={scientist.id} scientist={scientist} />
        ))}
      </section>

      {filteredScientists.length === 0 && (
        <p role="status">No scientists found.</p>
      )}
    </main>
  );
}

export default App;
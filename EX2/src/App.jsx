import ScientistCard from "./components/ScientistCard";
import { scientists } from "./data/scientists";
import "./App.css";

function App() {
  return (
    <main>
      <h1>Scientist & Pioneer Directory</h1>
      <p>Explore influential scientists and pioneers.</p>

      <section aria-label="Scientist list">
        {scientists.map((scientist) => (
          <ScientistCard
            key={scientist.id}
            scientist={scientist}
          />
        ))}
      </section>
    </main>
  );
}

export default App;
function ScientistCard({ scientist, onDelete }) {
  return (
    <article className="scientist-card">
      <h2>{scientist.name}</h2>

      <dl>
        <dt>Field:</dt>
        <dd>{scientist.field}</dd>

        <dt>IQ:</dt>
        <dd>{scientist.iq}</dd>

        <dt>Birth Year:</dt>
        <dd>{scientist.birthYear}</dd>

        <dt>Country:</dt>
        <dd>{scientist.country}</dd>
      </dl>

      <button
        type="button"
        className="delete-button"
        onClick={() => onDelete(scientist.id)}
        aria-label={`Delete ${scientist.name}`}
      >
        Delete
      </button>
    </article>
  );
}

export default ScientistCard;
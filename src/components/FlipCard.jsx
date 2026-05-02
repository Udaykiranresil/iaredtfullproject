export default function FlipCard({ q, a, i, activeCard, setActiveCard }) {
  const isFlipped = activeCard === i;

  const handleClick = () => {
    if (isFlipped) {
      setActiveCard(null); // close if same
    } else {
      setActiveCard(i);    // open this card
    }
  };

  return (
    <div
      className={`flip-card ${isFlipped ? "flipped" : ""}`}
      onClick={handleClick}
    >
      <div className="flip-card-inner">
        <div className="flip-front">
          <span className="card-badge">Q {i + 1}</span>
          <h3>{q}</h3>
          <span className="flip-hint">tap to flip →</span>
        </div>

        <div className="flip-back">
          <span className="card-badge">Answer</span>
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}
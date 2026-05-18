function EmptyState({ title, description, compact = false }) {
  return (
    <div className={compact ? "empty-state-block compact" : "empty-state-block"}>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-description">{description}</p>
    </div>
  );
}

export default EmptyState;

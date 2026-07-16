import { cn } from "../../lib/utils.js";

function Switch({ id, checked, onChange, label, description }) {
  return (
    <div className="switch-row">
      <div className="switch-copy">
        <span className="switch-label">{label}</span>
        {description ? <span className="switch-description">{description}</span> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={cn("switch", checked ? "switch-active" : "")}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  );
}

export default Switch;

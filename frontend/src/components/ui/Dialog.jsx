import { cn } from "../../lib/utils.js";

function Dialog({ open, title, description, children, footer, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <div>
            <h2 id="dialog-title" className="dialog-title">
              {title}
            </h2>
            {description ? <p className="dialog-description">{description}</p> : null}
          </div>
          <button className={cn("icon-button", "dialog-close")} type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="dialog-content">{children}</div>
        {footer ? <div className="dialog-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export default Dialog;

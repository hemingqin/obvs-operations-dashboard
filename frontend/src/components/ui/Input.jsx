import { cn } from "../../lib/utils.js";

function Input({
  id,
  label,
  error,
  hint,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <label className={cn("field", className)} htmlFor={id}>
      {label ? <span className="field-label">{label}</span> : null}
      <input
        id={id}
        className={cn("input", error ? "input-error" : "", inputClassName)}
        {...props}
      />
      {error ? <span className="field-error">{error}</span> : null}
      {!error && hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

export default Input;

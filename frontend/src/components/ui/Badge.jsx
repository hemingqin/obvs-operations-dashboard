import { cn } from "../../lib/utils.js";

const variantClassNames = {
  default: "badge-default",
  success: "badge-success",
  warning: "badge-warning",
  info: "badge-info"
};

function Badge({ variant = "default", className = "", children }) {
  return (
    <span className={cn("badge", variantClassNames[variant] || "badge-default", className)}>
      {children}
    </span>
  );
}

export default Badge;

import { cn } from "../../lib/utils.js";

const variantClassNames = {
  primary: "button-primary",
  secondary: "button-secondary",
  ghost: "button-ghost",
  danger: "button-danger"
};

const sizeClassNames = {
  sm: "button-sm",
  md: "button-md",
  lg: "button-lg"
};

function Button({
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "button",
        variantClassNames[variant] || variantClassNames.primary,
        sizeClassNames[size] || sizeClassNames.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

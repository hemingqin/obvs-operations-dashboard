import { cn } from "../../lib/utils.js";

export function Card({ className = "", children }) {
  return <section className={cn("card", className)}>{children}</section>;
}

export function CardHeader({ className = "", children }) {
  return <div className={cn("card-header", className)}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h3 className={cn("card-title", className)}>{children}</h3>;
}

export function CardDescription({ className = "", children }) {
  return <p className={cn("card-description", className)}>{children}</p>;
}

export function CardContent({ className = "", children }) {
  return <div className={cn("card-content", className)}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return <div className={cn("card-footer", className)}>{children}</div>;
}

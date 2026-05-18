import { cn } from "../../lib/utils.js";

export function Table({ className = "", children }) {
  return (
    <div className="table-wrapper">
      <table className={cn("table", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ className = "", children }) {
  return <tr className={cn("table-row", className)}>{children}</tr>;
}

export function TableHead({ className = "", children }) {
  return <th className={cn("table-head", className)}>{children}</th>;
}

export function TableCell({ className = "", children }) {
  return <td className={cn("table-cell", className)}>{children}</td>;
}

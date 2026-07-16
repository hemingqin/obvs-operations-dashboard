function BarChart({ data, valueKey, labelKey, color = "var(--primary)", formatValue = (value) => value, title }) {
  const max = Math.max(...data.map((item) => item[valueKey]), 1);
  const lastIndex = data.length - 1;

  return (
    <div className="bar-chart" role="img" aria-label={title}>
      {data.map((item, index) => {
        const pct = Math.max((item[valueKey] / max) * 100, 2);

        return (
          <div className="bar-chart-column" key={item[labelKey]} tabIndex={0}>
            {index === lastIndex ? (
              <span className="bar-chart-value">{formatValue(item[valueKey])}</span>
            ) : null}
            <div className="bar-chart-track">
              <div className="bar-chart-fill" style={{ height: `${pct}%`, background: color }} />
            </div>
            <span className="bar-chart-label">{item[labelKey]}</span>
            <div className="bar-chart-tooltip">
              <strong>{formatValue(item[valueKey])}</strong>
              <span>{item[labelKey]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BarChart;

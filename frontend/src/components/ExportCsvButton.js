export default function ExportCsvButton({ filter }) {
  const handleExport = () => {
    const params = new URLSearchParams(filter).toString();
    window.open(`/admin/disaster-situations/export?${params}`, "_blank");
  };
  return <button onClick={handleExport}>CSVエクスポート</button>;
}

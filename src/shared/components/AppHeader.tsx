export function AppHeader() {
  function handlePrint() {
    window.print();
  }

  return (
    <header className="toolbar screen-only">
      <h1>Print Layout App</h1>
      <button type="button" onClick={handlePrint}>
        Print
      </button>
    </header>
  );
}

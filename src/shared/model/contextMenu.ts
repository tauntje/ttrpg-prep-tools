/**
 * Stop the native menu on a right click.
 * The desktop webview shows a menu with a reload item. The app does not use it.
 */
export function stopNativeContextMenu(): void {
  window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}

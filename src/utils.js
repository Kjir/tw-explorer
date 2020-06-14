export function saveFile(name, content) {
  const blob = new Blob([JSON.stringify(content, undefined, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.download = name;
  downloadLink.href = url;
  downloadLink.click();
  URL.revokeObjectURL(url);
}

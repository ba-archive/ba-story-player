export function resizeTextareas() {
  const textAreas = document.querySelectorAll("textarea");
  textAreas.forEach(value => {
    value.style.height = value.scrollHeight + "px";
  });
}

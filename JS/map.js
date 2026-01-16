document.querySelectorAll(".epoch").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".epoch").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

document.querySelectorAll(".marker").forEach(marker => {
  marker.addEventListener("click", () => {
    alert("Ouvrir une énigme liée à ce point");
    // ici → navigation vers RiddleScreen
  });
});

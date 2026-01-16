const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const indicator = document.querySelector(".indicator");
const confirmField = document.getElementById("confirmField");
const subtitle = document.getElementById("formSubtitle");
const submitBtn = document.getElementById("submitBtn");

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  indicator.style.transform = "translateX(0)";
  confirmField.classList.remove("show");
  subtitle.textContent = "CONNEXION";
  submitBtn.textContent = "ENTRER";
});

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  indicator.style.transform = "translateX(100%)";
  confirmField.classList.add("show");
  subtitle.textContent = "INSCRIPTION";
  submitBtn.textContent = "CRÉER UN COMPTE";
});

// Toggle password visibility
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  passwordInput.type =
    passwordInput.type === "password" ? "text" : "password";
});

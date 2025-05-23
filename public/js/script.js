(() => {
  "use strict";

  // ✅ Bootstrap form validation
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// ✅ Preloader logic (ensure it's declared once)
window.addEventListener("load", function () {
  const loader = document.getElementById("preloader");
  if (loader) {
    loader.style.display = "none";
  }
});

// ✅ Optional: Add fade-in class to body when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("loaded");
});

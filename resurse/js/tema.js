// Aplica tema inainte de randare (evita flash-ul de tema gresita)
(function () {
    const savedTheme = localStorage.getItem("theme");
    const currentTheme = savedTheme || "light";
    document.documentElement.setAttribute("data-bs-theme", currentTheme);
})();

window.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById("themeSwitch");
    const iconLabel = toggleSwitch ? toggleSwitch.nextElementSibling : null;

    if (!toggleSwitch) return;

    const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "light";

    // Seteaza starea initiala a switch-ului
    toggleSwitch.checked = currentTheme === "dark";
    updateThemeIcon(currentTheme);

    toggleSwitch.addEventListener("change", function () {
        const targetTheme = this.checked ? "dark" : "light";
        document.documentElement.setAttribute("data-bs-theme", targetTheme);
        localStorage.setItem("theme", targetTheme);
        updateThemeIcon(targetTheme);
    });

    function updateThemeIcon(theme) {
        if (!iconLabel) return;
        if (theme === "dark") {
            iconLabel.innerHTML = '<i class="bi bi-sun-fill" style="font-size: 1.1rem;"></i>';
        } else {
            iconLabel.innerHTML = '<i class="bi bi-moon-stars-fill" style="font-size: 1.1rem;"></i>';
        }
    }
});

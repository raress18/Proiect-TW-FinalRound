// Etapa6: Tema light/dark memorata in localStorage si mentinuta pe toate paginile (req. 99)
// Aplica tema inainte de randare (evita flash-ul de tema gresita)
(function () {
    const savedTheme = localStorage.getItem("theme");
    const currentTheme = savedTheme || "light";
    document.documentElement.setAttribute("data-bs-theme", currentTheme);
})();

window.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById("themeSwitch");
    const iconLabel = toggleSwitch ? toggleSwitch.nextElementSibling : null; // ia elementul de langa switch si il salveza in iconLabel

    if (!toggleSwitch) return;

    const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "light";

    // Seteaza starea initiala a switch-ului (buton)
    toggleSwitch.checked = currentTheme === "dark";
    updateThemeIcon(currentTheme);

    toggleSwitch.addEventListener("change", function () {
        const targetTheme = this.checked ? "dark" : "light";//daca e bifat dark daca nu light
        document.documentElement.setAttribute("data-bs-theme", targetTheme);//modifica tema
        localStorage.setItem("theme", targetTheme);//memoreaza tema pe hard disk
        updateThemeIcon(targetTheme);//schimba iconita
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

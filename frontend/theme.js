// ✅ Function to Fetch and Apply Theme
async function applyTheme() {
    try {
        const response = await axios.get(`${BASE_URL}/api/active-theme`);
        const theme = response.data;
        console.log("Active Theme:", theme);

        if (theme) {
            document.documentElement.style.setProperty("--primary-color", theme.primaryColor);
            document.documentElement.style.setProperty("--secondary-color", theme.secondaryColor);
            document.documentElement.style.setProperty("--background-color", theme.backgroundColor);
        }
    } catch (err) {
        console.log("Error fetching theme:", err);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    updateNavbar();
    displayToReadList();
    displayRatedBooks();
});
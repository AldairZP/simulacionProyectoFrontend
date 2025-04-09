async function fetchDataUser() {
    try {
        const response = await fetch('https://aldair.site/user_info/', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            return !!data.username; // true si está logueado
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('startExamBtn');
    if (button) {
        button.addEventListener('click', async () => {
            const isLoggedIn = await fetchDataUser();
            navigateTo(isLoggedIn ? 'exams.html' : 'login-signup.html');
        });
    }
});

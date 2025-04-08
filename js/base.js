const profileMenu = document.getElementById('profileMenu');
// Definición del estado global de la aplicación
const state = {
    isLoggedIn: false,
    currentUser: null
};

async function getCSRFToken() {
    const fetchCSRFToken = await fetch('https://104.197.151.60/csrf/');
    if (fetchCSRFToken.ok) {
        const data = await fetchCSRFToken.json();
        return data.csrfToken;
    } else {
        console.error('Error al obtener el token CSRF:', fetchCSRFToken.statusText);
        return null;
    }
}

async function fetchLogout() {
    try {
        const response = await fetch('https://104.197.151.60/logout/', {
            method: 'GET',
            credentials: 'include', // Importante para enviar cookies del backend
            headers: {
                'X-CSRFToken': await getCSRFToken(), // Agregar el token CSRF
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            console.log('Logout exitoso');
            state.isLoggedIn = false;
            state.currentUser = null;
        } else {
            console.error('Error al cerrar sesión:', response.statusText);
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

async function fetchDataUser() {
    try {
        const response = await fetch('https://104.197.151.60/user_info/',{
            method: 'GET',
            credentials: 'include', // Importante para recibir cookies del backend
            headers: {
                'X-CSRFToken': await getCSRFToken(), // Agregar el token CSRF
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener datos de usuario:', error);
        return null;
    }
}

function showUserInfo(data) {
    const buttonLogin = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');

    if (buttonLogin) buttonLogin.classList.add('hidden'); // Hide the login button
    if (userProfile) userProfile.classList.remove('hidden'); // Show the user profile section

    // Mostrar el nombre de usuario en el elemento correspondiente
    if (userName) {
        // Usar la propiedad correcta según el formato de datos
        if (data.nickname) {
            userName.textContent = data.nickname;
        } else if (data.username) {
            userName.textContent = data.username;
        } else if (data.name) {
            userName.textContent = data.name;
        } else {
            userName.textContent = "Usuario";
        }
    }
    
    // Actualizar el estado
    state.isLoggedIn = true;
    state.currentUser = data;
}

// Función para gestionar la navegación
function navigateTo(page) {
    window.location.href = page;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Hacer petición al servidor para obtener datos del usuario
    const data = await fetchDataUser();
    if (data) {
        showUserInfo(data);
    }

    // Event listeners para el menú de perfil
    if (profileMenu) {
        // Abrir/cerrar menú al hacer clic en el perfil
        const userProfile = document.getElementById('userProfile');
        if (userProfile) {
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                profileMenu.classList.toggle('hidden');
            });
        }

        // Cerrar menú al hacer clic en cualquier otra parte
        document.addEventListener('click', () => {
            profileMenu.classList.add('hidden');
        });
    }
    if (document.getElementById('homeLogoBtn')) {
        document.getElementById('homeLogoBtn').addEventListener('click', () => {
            navigateTo('index.html');
        });
    }


    // Event listeners para los botones del menú
    if (document.getElementById('viewProfileBtn')) {
        document.getElementById('viewProfileBtn').addEventListener('click', () => {
            navigateTo('profile.html');
        });
    }

    if (document.getElementById('myExamsBtn')) {
        document.getElementById('myExamsBtn').addEventListener('click', () => {
            navigateTo('exams.html');
        });
    }

    if (document.getElementById('myStatsBtn')) {
        document.getElementById('myStatsBtn').addEventListener('click', () => {
            navigateTo('results.html');
        });
    }

    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            // Cerrar sesión
            await fetchLogout();
            navigateTo('index.html');
            // window.location.reload(); // Recargar la página para actualizar UI
        });
    }

    if (document.getElementById('loginBtn')) {
        document.getElementById('loginBtn').addEventListener('click', () => {
            navigateTo('login-signup.html');
        });
    }
});


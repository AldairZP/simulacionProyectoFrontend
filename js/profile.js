document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si el usuario está autenticado
    checkAuthentication();
    
    // Cargar información del perfil
    loadProfileData();
    
    // Configurar el event listener para la subida de imágenes
    setupImageUpload();
});

// Función para verificar si el usuario está autenticado
function checkAuthentication() {
    fetch('https://104.197.151.60/user_info/', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            // Redirigir al login si no está autenticado
            window.location.href = 'login-signup.html';
            throw new Error('Usuario no autenticado');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error al verificar autenticación:', error);
    });
}

// Función para cargar los datos del perfil
async function loadProfileData() {
    try {
        const response = await fetch('https://104.197.151.60/user_info/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener la información del usuario');
        }
        
        const userData = await response.json();
        updateProfileUI(userData);
    } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        showErrorMessage('No se pudo cargar la información del perfil. Por favor, intenta de nuevo más tarde.');
    }
}

// Función para actualizar la UI con los datos del perfil
function updateProfileUI(userData) {
    // Actualizar campos del perfil
    document.getElementById('profileMatricula').textContent = userData.matricula || '';
    document.getElementById('profileNickname').textContent = userData.username || '';
    document.getElementById('profileName').textContent = userData.nombre || '';
    document.getElementById('profileLastName1').textContent = userData.paterno || '';
    document.getElementById('profileLastName2').textContent = userData.materno || '';
    document.getElementById('profileEmail').textContent = userData.email || '';
    
    // Si hay una imagen de perfil, actualizarla
    if (userData.profile_image) {
        document.getElementById('profileImage').src = userData.profile_image;
        document.getElementById('userProfileImg').src = userData.profile_image;
    }
}

// Función para configurar la subida de imágenes
function setupImageUpload() {
    const uploadButton = document.getElementById('uploadImageBtn');
    const imageInput = document.getElementById('imageUpload');
    
    if (uploadButton && imageInput) {
        uploadButton.addEventListener('click', () => {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                uploadProfileImage(file);
            }
        });
    }
}

// Función para subir la imagen de perfil al servidor
async function uploadProfileImage(file) {
    try {
        const formData = new FormData();
        formData.append('profile_image', file);
        
        const csrfToken = await getCSRFToken();
        
        const response = await fetch('https://104.197.151.60/update_profile_image/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Error al subir la imagen');
        }
        
        const data = await response.json();
        
        // Actualizar la imagen en la UI
        if (data.profile_image) {
            document.getElementById('profileImage').src = data.profile_image;
            document.getElementById('userProfileImg').src = data.profile_image;
        }
        
        showSuccessMessage('Imagen de perfil actualizada con éxito');
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        showErrorMessage('No se pudo actualizar la imagen de perfil. Por favor, intenta de nuevo.');
    }
}

// Función para mostrar mensajes de error
function showErrorMessage(message) {
    alert(message);
}

// Función para mostrar mensajes de éxito
function showSuccessMessage(message) {
    alert(message);
}

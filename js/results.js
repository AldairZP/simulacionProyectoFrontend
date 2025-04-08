document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la página
    checkAuthentication()
        .then(loadUserData)
        .then(loadExamResults)
        .catch(error => console.error('Error de inicialización:', error));
});

// Función para verificar autenticación
async function checkAuthentication() {
    try {
        const response = await fetch('https://104.197.151.60/user_info/', {
            method: 'GET',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'}
        });
        
        if (!response.ok) {
            window.location.href = 'login-signup.html';
            throw new Error('Usuario no autenticado');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error de autenticación:', error);
        throw error;
    }
}

// Función para cargar datos del usuario
async function loadUserData() {
    try {
        const userData = await checkAuthentication();
        
        // Actualizar UI con datos del usuario
        if (document.getElementById('resultStudentName')) {
            document.getElementById('resultStudentName').textContent = 
                `${userData.nombre || ''} ${userData.paterno || ''} ${userData.materno || ''}`.trim();
        }
        
        if (document.getElementById('resultMatricula')) {
            document.getElementById('resultMatricula').textContent = userData.matricula || '';
        }
        
        if (document.getElementById('resultProfileImage') && userData.profile_image) {
            document.getElementById('resultProfileImage').src = userData.profile_image;
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        showErrorMessage('No se pudo cargar la información del usuario');
    }
}

// Función para cargar resultados de exámenes
async function loadExamResults() {
    try {
        const response = await fetch('https://104.197.151.60/user_exams/', {
            method: 'GET',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'}
        });
        
        if (!response.ok) throw new Error('Error al obtener resultados');
        
        const examData = await response.json();
        if (examData && examData.examenes && examData.examenes.length > 0) {
            displayExamHistory(examData.examenes);
            createResultsChart(examData.examenes);
            updateEnglishLevel(examData.examenes);
        } else {
            document.getElementById('examHistory').innerHTML = '<p>No hay exámenes registrados.</p>';
            document.getElementById('resultsChart').innerHTML = '<div class="no-data">No hay datos de exámenes para mostrar</div>';
        }
    } catch (error) {
        console.error('Error al cargar resultados:', error);
        showErrorMessage('No se pudieron cargar los resultados de exámenes');
    }
}

// Función para mostrar el historial de exámenes
function displayExamHistory(exams) {
    const examHistory = document.getElementById('examHistory');
    if (!examHistory) return;
    
    if (exams.length === 0) {
        examHistory.innerHTML = '<p>No hay exámenes registrados.</p>';
        return;
    }
    
    // Ordenar exámenes por fecha (más reciente primero)
    examHistory.innerHTML = [...exams]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .map(exam => {
            const date = new Date(exam.fecha);
            const formattedDate = date.toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            
            return `
                <div class="result-item">
                    <p><strong>Tipo:</strong> ${exam.tipo_examen === false ? 'Práctica' : 'Final'}</p>
                    <p><strong>Calificación:</strong> ${exam.calificacion}</p>
                    <p><strong>Nivel:</strong> ${exam.nivel}</p>
                    <p><strong>Fecha:</strong> ${formattedDate}</p>
                    <p><strong>Estado:</strong> <span style="color: ${exam.aprobado ? 'green' : 'red'}">
                        ${exam.aprobado ? 'Aprobado' : 'No aprobado'}</span></p>
                </div>
            `;
        }).join('');
}

// Función para crear el gráfico de resultados
function createResultsChart(exams) {
    const chartContainer = document.getElementById('resultsChart');
    if (!chartContainer) return;
    
    // Si no hay datos, mostrar mensaje
    if (!exams || exams.length === 0) {
        chartContainer.innerHTML = '<div class="no-data">No hay datos de exámenes para mostrar</div>';
        return;
    }
    
    // Estilo del contenedor
    chartContainer.style.width = '100%';
    chartContainer.style.height = '400px';
    
    try {
        // Ordenar exámenes cronológicamente
        const validExams = exams
            .filter(e => e && typeof e.calificacion === 'number')
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        if (validExams.length === 0) {
            chartContainer.innerHTML = '<div class="no-data">No hay datos válidos para mostrar</div>';
            return;
        }
        
        // Inicializar gráfico
        if (chartContainer._echarts_instance_) echarts.dispose(chartContainer);
        const chart = echarts.init(chartContainer);
        
        // Datos simples para el gráfico
        const labels = validExams.map((_, i) => `Examen ${i+1}`);
        const scores = validExams.map(e => Math.round(e.calificacion));
        const types = validExams.map(e => e.tipo_examen === false ? 'Práctica' : 'Final');
        
        // Configuración sencilla
        chart.setOption({
            title: { 
                text: 'Historial de Calificaciones',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const i = params[0].dataIndex;
                    const exam = validExams[i];
                    const fecha = new Date(exam.fecha).toLocaleString('es-ES');
                    return `<b>${params[0].name}</b><br/>
                            Tipo: ${types[i]}<br/>
                            Calificación: ${scores[i]}<br/>
                            Fecha: ${fecha}`;
                }
            },
            xAxis: {
                type: 'category',
                data: labels
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                name: 'Calificación'
            },
            series: [
                {
                    data: scores.map((score, i) => ({
                        value: score,
                        itemStyle: {
                            color: types[i] === 'Práctica' ? '#5A6D92' : '#D7A860'
                        }
                    })),
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}'
                    }
                }
            ]
        });
        
        // Hacer responsive
        window.addEventListener('resize', () => chart.resize());
        
    } catch (error) {
        console.error('Error al crear el gráfico:', error);
        chartContainer.innerHTML = `<div class="error-message">Error al crear el gráfico: ${error.message}</div>`;
    }
}

// Función para actualizar el nivel de inglés
function updateEnglishLevel(exams) {
    const levelElement = document.getElementById('englishLevel');
    if (!levelElement) return;
    
    // Obtener solo exámenes finales (sin considerar aprobación)
    const finalExams = exams.filter(exam => exam.tipo_examen === true);
    
    console.log('Exámenes finales:', finalExams); // Depuración
    
    if (finalExams.length === 0) {
        levelElement.textContent = 'No conseguido';
        return;
    }
    
    // Niveles ordenados de menor a mayor (en minúsculas para comparación)
    const levels = ['basico', 'intermedio', 'avanzado'];
    
    // Encontrar el nivel más alto
    let highestLevel = '';
    let levelIndex = -1;
    
    finalExams.forEach(exam => {
        const currentLevel = exam.nivel.toLowerCase();
        const examLevelIndex = levels.indexOf(currentLevel);
        
        console.log('Examen nivel:', exam.nivel, 'Índice:', examLevelIndex); // Depuración
        
        if (examLevelIndex > levelIndex) {
            levelIndex = examLevelIndex;
            highestLevel = exam.nivel;
        }
    });
    
    // Si encontramos un nivel, lo mostramos con formato adecuado
    if (highestLevel) {
        levelElement.textContent = highestLevel.charAt(0).toUpperCase() + highestLevel.slice(1).toLowerCase();
    } else {
        levelElement.textContent = 'No conseguido';
    }
}

// Función para mostrar mensajes de error
function showErrorMessage(message) {
    alert(message);
}

// Agregar estilos para mensajes
document.head.insertAdjacentHTML('beforeend', `
<style>
.no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-style: italic;
    color: #666;
}
.error-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: red;
}
</style>
`);

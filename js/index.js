if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '/PruebaWeb/') {
    const startExamBtn = document.getElementById('startExamBtn');
    if (startExamBtn) {
      startExamBtn.addEventListener('click', () => {
        if (state.isLoggedIn) {
          navigateTo('exams.html');
        } else {
          navigateTo('login-signup.html');
        }
      });
    }
  }
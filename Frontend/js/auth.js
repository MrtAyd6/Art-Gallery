console.log("BİNGO! auth.js dosyası başarıyla yüklendi.");

// Baclend API adresi
const API_BASE_URL = 'http://localhost:5160/api';

//Uyarı mesajlarını ekranda göstermek için bir yardımcı fonksiyon
function showAlert(elementId, message, type){
    const alertBox = document.getElementById(elementId);
    if(alertBox){
        alertBox.textContent = message;
        alertBox.className = `alert ${type}`;   // 'alert error' veya 'alert succes'
        alertBox.style.display = 'block'; 
    }
}

// Kayıt olma işlemi (eğer sayfada registerForm varsa çalışır)
const registerForm = document.getElementById('registerForm');
if(registerForm){
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault(); //Sayfanın yenikenmesini engeller

        //İnputlardan değerleri al
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try{
            // Backende POST isteği at
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ fullName, email, password })
            });

            const data = await response.json();

            if(response.ok){
                showAlert('registerAlert', data.message, 'success');
                //2 saniye sonra otomatik login sayfasına yönlendir
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            }else{
                showAlert('registerAlert', data.error || 'Kayıt başarısız!', 'error');
            }
        }catch (error){
            showAlert('registerAlert', 'Sunucuya bağlanılamadı.', 'error');
        }
    });
}

//Giriş Yapma İşlemi
const loginForm = document.getElementById('loginForm');
if(loginForm){
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try{
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok){
                showAlert('loginAlert', 'Giriş başarılı! Yönlendiriliyorsunnuz...', 'success');

                //Kullanıcı bilgilerini tarayıcı hafızasına kaydet (localstorage)
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('fullName', data.fullName);

                //Ana sayfaya yönlendir
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            }else{
                showAlert('loginAlert', data.error || 'Giriş başarısız!', 'error');
            }
        }catch(error){
            showAlert('loginAlert', 'Sunucuya bağlanılanamdı.', 'error');
        }
    })
}
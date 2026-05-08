const userName = localStorage.getItem('fullName');
const welcomeTextDiv = document.getElementById('welcomeText');

if(userName && welcomeTextDiv){
    //Açılır menünün düzgün konumlanması için
    welcomeTextDiv.style.position = 'relative';

    //Tıklanabilir Başlık ve gizli açılır menü
    welcomeTextDiv.innerHTML = `
        <div id="profileTrigger" style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: inherit; padding: 5px;">
            <span style="font-size: 1.3rem;">👤</span>
            <span>Hoşgeldin, <strong>${userName}</strong></span>
            <span style="font-size: 0.7rem; margin-top:2px;">▼</span>
        </div>
        
        <div id="profileMenu" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 10px; background: white; border: 1px solid #ddd; border-radius: 6px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); min-width: 150px; z-index: 1000; overflow: hidden;">
            <a href="profile.html" style="display: block; width: 100%; padding: 12px 15px; text-decoration: none; color: #2c3e50; font-size: 14px; border-bottom: 1px solid #eee; box-sizing: border-box; transition: background 0.2s;">
                ⚙️ Profilime Git
            </a>
            
            <button id="logoutBtn" style="display: block; width: 100%; padding: 12px 15px; border: none; background: transparent; color: #e74c3c; cursor: pointer; text-align: left; font-weight: bold; font-size: 14px; box-sizing: border-box; transition: background 0.2s;">
                🚪 Çıkış Yap
            </button>
        </div>
    `;

    const profileTrigger = document.getElementById('profileTrigger');
    const profileMenu = document.getElementById('profileMenu');

    //Sol tıklayınca menü aç/kapa
    profileTrigger.addEventListener('click', function(e) {
        e.stopPropagation();    //Tıklamanın sayfanın geneline yayılmasını engelle
        if (profileMenu.style.display === 'none'){
            profileMenu.style.display = 'block';
        }else{
            profileMenu.style.display = 'none';
        }
    });

    //Sayfada başka yere tıklayınca menüyü kapat
    document.addEventListener('click', function(e) {
        if (profileMenu.style.display === 'block' && !welcomeTextDiv.contains(e.target)){
            profileMenu.style.display = 'none';
        }
    });

    //Çıkış yap butonu
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();

        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');

        alert("Başarıyla çıkış yapıldı.");
        window.location.reload();
    });
}
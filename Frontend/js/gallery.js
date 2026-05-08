const API_BASE_URL = 'http://localhost:5160/api';

//Güvenlik kontrolü: kullanıcı giriş yapmış mı
const userId = localStorage.getItem('userId');
const fullName = localStorage.getItem('fullName');

//LocalStorageda ID yoksa loginde gönder
if(!userId || !fullName) {
    window.location.href = 'login.html';
}else{
    document.getElementById('userNameDisplay').textContent = `Hoş geldin, ${fullName}`;
}

//Çıkış Yapma
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();   //hafızayı temizle
    window.location.href = 'login.html';
});

//Eserleri backendden çekme
async function loadArtworks() {
    const grid = document.getElementById('galleryGrid');

    try{
        //Backenddeki eserler API sine istek at
        const response = await fetch(`${API_BASE_URL}/artworks`);

        if(response.ok){
            const artworks = await response.json();
            grid.innerHTML = '';    //Yükleniyor yazısını temizle

            //Gelen her eser için bir html kartı oluştur
            artworks.forEach(art => {
                const card = document.createElement('div');
                card.className = 'card';

                //KArtı tıklanabilir yap
                card.style.cursor = 'pointer';
                card.style.transition = 'transform 0.2s';
                card.onmouseover = () => card.style.transform = 'scale(1.02)';
                card.onmouseout = () => card.style.transform = 'scale(1)';
                card.onclick = () => window.location.href = `artwork-detail.html?id=${art.artworkId}`;

                //Temsili görsel
                card.innerHTML = `
                    <img src="Images/artworks/${art.artworkId}.jpg" onerror="Images/default.jpg" alt="${art.title}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">
                    <h3 style="color: #2c3e50; margin-bottom: 8px;">${art.title}</h3>
                    <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 8px;">Sanatçı: ${art.artistName}</p>
                    <p style="font-weight: bold; color: #27ae60; font-size: 16px;">${art.price} ₺</p>
                `;

                grid.appendChild(card);
            });
        }else{
            grid.innerHTML = '<p style="color:red;">Eserler çekilirken bir hata oluştu.</p>';
        }
    }catch (error) {
        grid.innerHTML = '<p style="color:red;">Sunucuya bağlanılamadı.';
    }
}

//FAvorilere ekleme
async function addToFavorites(artworkId) {
    try{
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId), artworkId: artworkId})
        });

        const data = await response.json();

        if(response.ok){
            alert('eser faorilerine eklendi!');
        }else{
            alert(data.error || 'Eklenirken bir sorun oluştu.');
        }
    }catch(error){
        alert('Sunucu hatası!');
    }
}

//Sayfa açıldığında eserleri yüklemeyi başlat
loadArtworks();
const API_BASE_URL = 'http://localhost:5160/api';

//Güvenlik kontrolü: kullanıcı giriş yapmış mı
const userId = localStorage.getItem('userId');
const fullName = localStorage.getItem('fullName');

//LocalStorageda ID yoksa loginde gönder
if(!userId) {
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
                card.innerHTML = `
                    <h3>${art.title}</h3>
                    <p>Sanatçı: ${art.artistName}</p>
                    <p>Fiyat: ${art.price} ₺</p>
                    <button class="btn-outline" onclick="addToFavorites(${art.artworkId})">
                        ❤️ Favorilere Ekle
                    </button>
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
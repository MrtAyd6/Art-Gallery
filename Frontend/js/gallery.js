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
                if(art.status === 'Active'){
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
                        
                        <button onclick="event.stopPropagation(); toggleCompare(${art.artworkId})" id="compBtn_${art.artworkId}" title="Karşılaştırmaya Ekle" style="position: ablolute; bottom: 15px; right: 15px; background: #f4f6f7; border: 1px solid #bdc3c7; color: #7f8c8d; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 16px; transition: 0.3s;">
                            ⚖️
                        </button>
                    `;

                    grid.appendChild(card);
                }
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

//Eser karşılaştırma
let compareList = JSON.parse(localStorage.getItem('compareList')) || [];

function toggleCompare(artworkId){
    const btn = document.getElementById(`compBtn_${artworkId}`);

    //Eğer listede varsa çıkar
    if(compareList.includes(artworkId)){
        compareList = compareList.filter(id => id != artworkId);
        if(btn){
            btn.style.background = '#f4f6f7';
            btn.style.color = '#7f8c8d';
            btn.style.borderColor = '#bdc3c7';
        }
    }
    //Eğer listede yoksa ekle
    else{
        if(compareList.length >= 8){
            alert("En fazla 4 eseri yan yana karşılaştırabilirsiniz.");
            return;
        }
        compareList.push(artworkId);
        if(btn){
            btn.style.background = '#2980b9';
            btn.style.color = 'white';
            btn.style.borderColor = '#2980b9';
        }
    }

    //Hafızayı ve butonn güncele
    localStorage.setItem('compareList', JSON.stringify(compareList));
    updateCompareUI();
}

function updateCompareUI(){
    const floatingBtn = document.getElementById('compareFloatingBtn');
    const countSpan = document.getElementById('compareCount');

    if(compareList.length > 0){
        floatingBtn.style.display = 'block';
        countSpan.innerText = compareList.length;

        compareList.forEach(id => {
            const btn = document.getElementById(`compBtn_${id}`);
            if(btn){
                btn.style.background = '#2980b9';
                btn.style.color = 'white';
                btn.style.borderColor = '#2980b9';
            }
        });
    }else{
        floatingBtn.style.display = 'none';
    }
}

//Sayfa yüklendiğinde butonu kontrol et
document.addEventListener('DOMContentLoaded', updateCompareUI);

//Sayfa açıldığında eserleri yüklemeyi başlat
loadArtworks();
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

                    const price = art.price - (art.price * art.discountRate / 100);

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
                        <p style="font-weight: bold; color: #27ae60; font-size: 16px;">${price} ₺</p>
                        
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
//Sayfa açıldığında eserleri yüklemeyi başlat
loadArtworks();

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

async function loadCampaigns() {
    const section = document.getElementById('campaignsSection');
    const list = document.getElementById('campaignsList');

    try{
        const response = await fetch(`${API_BASE_URL}/artworks/campaigns`);
        const campaigns = await response.json();

        if(campaigns.length > 0){
            section.style.display = 'block';
            
            list.innerHTML = campaigns.map(c => {
                const originalPrice = parseFloat(c.price);
                const discount = parseInt(c.discountrate);
                const newPrice = originalPrice - (originalPrice * discount / 100);

                return `
                <div style="min-width: 250px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative; cursor: pointer;" onclick="window.location.href='artwork-detail.html?id=${c.artworkid}'">
                
                    <div style="position: absolute; top: -10px; right: -10px; background: #e74c3c; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transform: rotate(5deg);">
                        %${discount} İNDİRİM
                    </div>
                    
                    <img src="Images/artworks/${c.artworkid}.jpg" onerror="this.src='Images/default.jpg'" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${c.title}</h4>
                    
                    <div>
                        <span style="text-decoration: line-through; color: #95a5a6; font-size: 13px;">${originalPrice} ₺</span>
                        <span style="color: #c0392b; font-weight: bold; font-size: 18px; margin-left: 5px;">${newPrice} ₺</span>
                    </div>
                `;
            }).join('');
        }else{
            section.style.display = 'none';
        }
    }catch (e){
        console.error("Kampanyalar yüklenemdi.", e);
    }
}

//Ana sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    loadCampaigns();
});
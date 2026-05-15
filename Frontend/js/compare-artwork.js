const API_BASE_URL = 'http://localhost:5160/api';

async function loadComparison() {
    const compareList = JSON.parse(localStorage.getItem('compareList')) || [];

    if(compareList.length === 0){
        document.getElementById('emptyState').style.display = 'block';
        return;
    }

    document.getElementById('compareTable').style.display = 'table';

    //Tüm eserlerin bilgilerini ç(ek
    try{
        const response = await fetch(`${API_BASE_URL}/artworks`);
        const artworksAll = await response.json();
        let artworks = [];
        
        artworksAll.forEach(art => {
            if(compareList.includes(art.artworkId)){
                artworks.push(art);
            }
        });

        const table = document.getElementById('compareTable');

        //Tablo satırları
        table.innerHTML = `
            <tr>
                <th>Görsel</th>
                ${artworks.map(a => `<td>
                    <img src="Images/artworks/${a.artworkId}.jpg" onerror="this.src='Images/default.jpg'" class="art-img">
                    <h3 class="art-title">${a.title}</h3>
                    <button onclick="window.location.href='artwork-detail.html?id=${a.artworkId}'" style="background: #2980b9; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">İncele</button>
                </td>`).join('')}
            </tr>
            <tr>
                <th>Sanatçı</th>
                ${artworks.map( a => `<td><strong>${a.artistName  || 'Bilinmiyor'}</strong></td>`).join('')}
            </tr>
            <tr>
                <th>Kategori</th>
                ${artworks.map(a => `<td>${a.category || 'Belirtilmemiş'}</td>`).join('')}
            </tr>
            <tr>
                <th>Fiyat</th>
                ${artworks.map(a => `<td class="price">${a.price} ₺</td>`).join('')}
            </tr>
            <tr>
                <th>Görüntülenme</th>
                ${artworks.map(a => `<td> ${a.viewsCount || 0} Kez</td>`).join('')}
            </tr>
        `;
    }catch(error){
        console.error("Eserler yüklenirken hata oluştu:", error);
    }
}

function clearComparison(){
    if(confirm("Karşılaştırma listesini temizlemek istediğinize emin misiniz?")){
        localStorage.removeItem('compareList');
        location.reload();
    }
}

loadComparison();
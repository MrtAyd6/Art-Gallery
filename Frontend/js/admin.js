const API_BASE_URL = 'http://localhost:5160/api';

//Kullanıcı giriş yapmış mı
//Burası Role = 'Admin' olarak değişecek
const userId = localStorage.getItem('userId');
if(!userId){
    alert("Yönetici paneline erişmek için giriş yapmalısınız.");
    window.location.href = 'login.html';
}

//Etkinlik verilerini yükle
async function loadEventStats() {
    const tbody = document.getElementById('eventStatsBody');
    try{
        const response = await fetch(`${API_BASE_URL}/admin/stats/events`);
        if(response.ok){
            const stats = await response.json();
            tbody.innerHTML = '';

            stats.forEach(s => {
                //Yüzdelik doluluk oranı
                let occupancyRate = 0;
                if(s.totalcapacity > 0){
                    occupancyRate = Math.round((s.totalreservations / s.totalcapacity) * 100);
                }

                //Orana göre renk (yeşil/kırmızı)
                let rateColor = occupancyRate > 80 ? 'green' : (occupancyRate < 30 ? 'red' : 'orange');

                tbody.innerHTML += `
                    <tr>
                        <td><strong>${s.title}</strong></td>
                        <td>${s.totalreservations} / ${s.totalcapacity} Kişi</td>
                        <td style="color: ${rateColor}; font-weight: bold;">%${occupancyRate}</td>
                        <td>${s.averagerating} ⭐</td>
                    </tr>
                `;
            });
        }
    }catch(error){
        tbody.innerHTML = '<tr><td colspan="4" style="color:red;">Veriler çekilemedi!</td></tr>'; 
    }
}

//Eser Verilerini yükle
async function loadArtworkStats() {
    const tbody = document.getElementById('artworkStatsBody');
    try{
        const response = await fetch(`${API_BASE_URL}/admin/stats/artworks`);
        if(response.ok){
            const stats = await response.json();
            tbody.innerHTML = '';

            stats.forEach(s => {
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${s.title}</strong></td>
                        <td>${s.viewscount}</td>
                        <td>${s.favoritecount}</td>
                        <td>${s.commentcount}</td>
                    </tr>
                `;
            });
        }
    }catch(error){
        tbody.innerHTML = '<tr><td colspan="4" style="color:red;">Veriler çekilemedi!</td></tr>';
    }
}

//Sayfa açıldığında iki fonksiyonu da çalıştır
loadEventStats();
loadArtworkStats();
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

async function openRequestsModal() {
    document.getElementById('requestsModal').style.display = 'flex';
    loadPendingRequests();
}

function closeRequestsModal(){
    document.getElementById('requestsModal').style.display = 'none';
}

async function loadPendingRequests() {
    const container = document.getElementById('requestsListContainer');
    try{
        const response = await fetch(`${API_BASE_URL}/users/admin/role-requests`);
        const requests = await response.json();

        if(requests.length === 0){
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">Bekleyen başvuru bulunmamaktadır.</p>';
            return;
        }

        container.innerHTML = `
            <table style="width: 100%; border-collapse; margin-top: 10px;">
                <thead>
                    <tr style="background: #f8f9fa; text-align: left;">
                        <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">Kullanıcı</th>
                        <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">İstenen Rol</th>
                        <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">Mesaj / Tanıtım</th>
                        <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: right;">İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(r => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px;">
                                <strong>${r.fullname}</strong><br>
                                <small style="color: #666;">${r.email}</small>
                            </td>
                            <td style="padding: 12px;">
                                <span style="background: #e1f5fe; color: #01579b; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                    ${r.requestedrole === 'Artist' ? 'SANATÇI' : 'ATÖLYE SAHİBİ'}
                                </span>
                            </td>
                            <td style="padding: 12px; font-size: 14px; max-width: 300px;">${r.message}</td>
                            <td style="padding: 12px; text-align: right;">
                                <button onclick="processRequest(${r.requestid}, 'Approved')" style="background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Onayla</button>
                                <button onclick="processRequest(${r.requestid}, 'Rejected')" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Reddet</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }catch (e){
        container.innerHTML = '<p style="color: red;">Veriler yüklenirken bir hata oluştu.</p>';
    }
}

async function processRequest(requestId, decision) {
    const confirmMsg = decision === 'Approved' ? "Bu başvuruyu onaylıyor musunuz? Kullanıcı yetkileri anında değişecektir." : "Bu başvuruyu reddetmek istediğinize emin misiniz?";

    if(!confirm(confirmMsg)) return;

    try{
        const response = await fetch(`${API_BASE_URL}/users/admin/process-role-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, decision })
        });

        if(response.ok){
            alert(decision === 'Approved' ? "Kullanıcı başarıyla terfi ettirildi!" : "Başvuru reddedildi.");
            loadPendingRequests();
        }else{
            alert("İşlem sırasında bir hata oluştu.");
        }
    }catch(e){
        alert("Sunucu hatası!");
    }
}
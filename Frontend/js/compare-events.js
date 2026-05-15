const API_BASE_URL = 'http://localhost:5160/api';

async function loadEventComparison() {
    const compareEventList = JSON.parse(localStorage.getItem('compareEventList')) || [];

    if(compareEventList.length === 0){
        document.getElementById('emptyState').style.display = 'block';
        return;
    }

    document.getElementById('compareEventTable').style.display = 'table';

    try{
        //Etkimlikleri çek
        const fetchPromises = compareEventList.map(id => fetch(`${API_BASE_URL}/events/${id}`).then(res => res.json()));
        const events = await Promise.all(fetchPromises);

        const table = document.getElementById('compareEventTable');

        table.innerHTML = `
            <tr>
                <th>Etkinlik</th>
                ${events.map(e => `<td>
                    <h3 class="event-title">${e.title}</h3>
                    <button onclick="window.location.href='event-detail.html?id=${e.eventId}'" style="background: #27ae60; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Bilet Al</button>
                </td>`).join('')}
            </tr>
            <tr>
                <th>Atölye Sahibi</th>
                ${events.map(e => `<td><strong>${e.organizerName || 'Belitilmemiş'}</strong></td>`).join('')}
            </tr>
            <tr>
                <th>Bilet Fiyatı</th>
                ${events.map(e => `<td class="price">${e.price} ₺</td>`).join('')}
            </tr>
            <tr>
                <th>Yaklaşan Seanslar</th>
                ${events.map(e => `<td>
                    ${e.sessions && e.sessions.length > 0
                        ? e.sessions.map(s => `<div class="session-box">${s.sessionDate} -  <span style="color: green;">(${s.currentCapacity})</span><br> ${s.startTime} - ${s.endTime}</div>`).join('')
                        : '<span style="color: #999;">Planlı seans yok</span>'
                    }
                </td>`).join('')}
            </tr>
            <tr>
                <th>Detaylar</th>
                ${events.map(e => `<td style="font-size: 14px; color. #555;">${e.description ? e.description.substring(0, 80) + '...' : '-'}</td>`).join('')}
            </tr>
        `;
    }catch(error){
        console.error("Etkinlikler yüklenirken hata oluştu:", error);
    }
}

function clearEventComparison(){
    if(confirm("Etkinlik karşılaştırma listesini temizlemek istediğinize emin misiniz?")){
        localStorage.removeItem('compareEventList');
        location.reload();
    }
}

loadEventComparison();
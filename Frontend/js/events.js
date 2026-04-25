const API_BASE_URL = 'http://localhost:5160/api';

//Güvenlik kontrolü
const userId = localStorage.getItem('userId');
const fullName = localStorage.getItem('fullName');

if(!userId){
    window.location.href = 'login.html';
}else{
    document.getElementById('userNameDisplay').textContent = `Hoş geldin, ${fullName}`;
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
});

//Tüm etkinlikleri yükle
async function loadEvents() {
    const grid = document.getElementById('eventsGrid');
    try{
        const response = await fetch(`${API_BASE_URL}/events`);
        if(response.ok){
            const events = await response.json();
            grid.innerHTML = '';

            events.forEach(ev => {
                const card = document.createElement('div');
                card.className = 'card';
                //Eğer kontenjan sıfırsa butonu pasif yapıp rengini değiştiriyoruz
                const isFull = ev.currentCapacity <= 0;
                const buttonHtml = isFull
                    ? `<button class="btn-outline" style="color: gray; border-color: gray; cursor: not-allowed;" disabled>Doldu</button>`
                    : `<button class="btn-outline" style="background-color: #27ae60; color: white; border: none;" onclick="viewEventDetail(${ev.eventId})">Detayları Görüntüle</button>`;
                
                card.innerHTML = `
                    <h3>${ev.title}</h3>
                    <p style="color: #2980b9; font-weight: bold;">${new Date(ev.eventDate).toLocaleDateString('tr-TR')}</p>
                    <p>Boş Kontenjan: <span style="font-weight: bold; font-size: 18px; color: ${isFull ? 'red' : 'green'};">${ev.currentCapacity}</span></p>
                    ${buttonHtml}
                `;
                grid.appendChild(card);
            });
        }
    }catch(error){
        grid.innerHTML = '<p style="color:red;">Etkinlikler yüklenemedi.</p>';
    }
}

//Rezervasyon Yapma
async function reserveEvent(eventId) {
    try{
        const response = await fetch(`${API_BASE_URL}/events/reserve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId), eventId: eventId, participantCount: 1})
        });

        if(response.ok){
            alert('Rezervasyon başarıyla yapıldı!');
            loadEvents(); //Kontenjanın düştüğünü anında görmek için listeyi yenile
            loadMyReservations(); //Aşağıdaki listeyi yenile
        }else{
            const data = await response.json();
            alert(data.error || 'Rezervasyon başarısız.');
        }
    }catch(error){
        alert('Sunucu hatası!');
    }
}

//Kullanıcının rezervasyonlarını yükle
async function loadMyReservations() {
    const grid = document.getElementById('myReservationsGrid');
    try{
        const response = await fetch(`${API_BASE_URL}/events/reservations/user/${userId}`);
        if(response.ok){
            const reservations = await response.json();
            grid.innerHTML = '';

            if(reservations.length === 0){
                grid.innerHTML = '<p>Henüz bir etkinlie kayıt olmadınız.</p>';
                return;
            }

            reservations.forEach(res => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>Rezervasyon #${res.reservationId}</h3>
                    <p>Etkinlik ID: ${res.eventId}</p>
                    <p>Kişi Sayısı: ${res.participantCount}</p>
                    <button class="btn-outline btn-danger" onclick="cancelReservation(${res.reservationId})">
                        İptal Et
                    </button>
                `;
                grid.appendChild(card);
            });
        }
    }catch(error){
        grid.innerHTML = '<p style="color:red;">rezervasyonlar yüklenemedi.</p>';
    }
}

//Rezervasyon iptali
async function cancelReservation(reservationId) {
    if(!confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")) return;

    try{
        const response = await fetch(`${API_BASE_URL}/events/reservation/${reservationId}`, {
            method: 'DELETE'
        });

        if(response.ok){
            alert('İptal başarılı!');
            loadEvents();   //KOntenjanların güncellenmesini sağla
            loadMyReservations(); //İptal edilen kartı ekrandan sil
        }else{
            alert('İptal işlemi başarısız oldu.');
        }
    }catch(error){
        alert('Sunucu hatası!');
    }
}

function viewEventDetail(id){
    window.location.href = `event-detail.html?id=${id}`;
}

//Sayfa açıldığında iki listeyi de doldur
loadEvents();
loadMyReservations();
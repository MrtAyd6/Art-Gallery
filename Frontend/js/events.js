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
                card.style.position = 'relative';
                //Eğer kontenjan sıfırsa butonu pasif yapıp rengini değiştiriyoruz
                const isFull = ev.currentCapacity <= 0;
                const buttonHtml = isFull
                    ? `<button class="btn-outline" style="color: gray; border-color: gray; cursor: not-allowed;" disabled>Doldu</button>`
                    : `<button class="btn-outline" style="background-color: #27ae60; color: white; border: none;" onclick="viewEventDetail(${ev.eventId})">Detayları Görüntüle</button>`;
                
                card.innerHTML = `
                    <h3>${ev.title}</h3>
                    <p style="color: #2980b9; font-weight: bold;">${new Date(ev.eventDate).toLocaleDateString('tr-TR')}</p>
                    ${buttonHtml}
                    <button onclick="event.stopPropagation(); toggleEventCompare(${ev.eventId})" id="compEventBtn_${ev.eventId}" title="Karşılaştırmaya Ekle" style="position: absolute; top: 15px; right: 15px; background: #f4f6f7; border: 1px solid #bdc3c7; color: #7f8c8d; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 16px; transition: 0.3s;">
                        ⚖️
                    </button>
                    
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

//Etkinlik karşılaştırma
let compareEventList = JSON.parse(localStorage.getItem('compareEventList')) || [];

function toggleEventCompare(eventId){
    const btn = document.getElementById(`compEventBtn_${eventId}`);

    //Eğer listede varsa çıkar
    if(compareEventList.includes(eventId)){
        compareEventList = compareEventList.filter(id => id !== eventId);
        if(btn){
            btn.style.background = '#f4f6f7';
            btn.style.color = '#7f8c8d';
            btn.style.borderColor = '#bdc3c7';
        }
    }
    //Eğer listede yoksa ekle
    else{
        if(compareEventList.length >= 3){
            alert("En fazla 3 etkinliği yan yana karşılaştırabilirsiniz.");
            rerturn;
        }
        compareEventList.push(eventId);
        if(btn){
            btn.style.background = '#27ea60';
            btn.style.color = '#white';
            btn.style.borderColor = '#27ae60';
        }
    }

    localStorage.setItem('compareEventList', JSON.stringify(compareEventList));
    updateEventCompareUI();
}

function updateEventCompareUI(){
    const floatingBtn = document.getElementById('compareEventFloatingBtn');
    const countSpan = document.getElementById('compareEventCount')

    if(!floatingBtn) return;

    if(compareEventList.length > 0){
        floatingBtn.style.display = 'block';
        countSpan.innerText = compareEventList.length;

        compareEventList.forEach(id => {
            const btn = document.getElementById(`compEventBtn_${id}`);
            if(btn){
                btn.style.background = '#27ae60';
                btn.style.color = 'white';
                btn.style.borderColor = '#27ae60';
            }
        });
    }else{
        floatingBtn.style.display ='none';
    }
}

//sayfa yüklendiğinde kontrol et
document.addEventListener('DOMContentLoaded', updateEventCompareUI);

//Sayfa açıldığında iki listeyi de doldur
loadEvents();
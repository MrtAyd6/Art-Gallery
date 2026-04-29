const API_BASE_URL = 'http://localhost:5160/api';
let allEvents = [];

//Etkinlikleri API'den çek
async function loadDropdowns() {
    try{
        const response = await fetch(`${API_BASE_URL}/events`);
        allEvents = await response.json();

        const select1 = document.getElementById('event1');
        const select2 = document.getElementById('event2');

        let options = '<option value="">Birinci Etkinliği Seçin...</option>';
        let options2 = '<option value="">İkinci Etkinliği Seçin...</option>';

        allEvents.forEach(ev => {
            options += `<option value="${ev.eventId}">${ev.title}</option>`;
            options2 += `<option value="${ev.eventId}">${ev.title}</option>`;
        });

        select1.innerHTML = options;
        select2.innerHTML = options2;
    }catch(e){
        console.error("Etkinlikler yüklenemedi:", e);
    }
}

//İki Etkinliği Karşılaştır
function compareEvents(){
    const id1 = document.getElementById('event1').value;
    const id2 = document.getElementById('event2').value;

    

    if(!id1 || !id2){
        alert("Lüthen karşılaştırma için iki etkinlik seçin!");
        return;
    }
    if(id1 === id2){
        alert("Farklı etkinlikler seçmelisiniz.");
        return;
    }

    //Seçilen etkinliklerin tüm verilerini listeden bul
    const ev1 = allEvents.find(e => e.eventId == id1);
    const ev2 = allEvents.find(e => e.eventId == id2);
    
    //Başlıkları güncelle
    document.getElementById('title1').textContent = ev1.title;
    document.getElementById('title2').textContent = ev2.title;

    //Tabloyu doldur
    const tbody = document.getElementById('compareBody');
    tbody.innerHTML = `
        <tr>
            <td><strong>Tarih</strong></td>
            <td>${new Date(ev1.eventDate).toLocaleDateString('tr-TR')}</td>
            <td>${new Date(ev2.eventDate).toLocaleDateString('tr-TR')}</td>
        </tr>
        <tr>
            <td><strong>Ücret</strong></td>
            <td class="${ev1.price < ev2.price ? 'highlight' : ''}">${ev1.price} ₺</td>
            <td class="${ev2.price < ev1.price ? 'highlight' : ''}">${ev2.price} ₺</td>
        </tr>
        <tr>
            <td><strong>Boş Kontenjan</strong></td>
            <td class="${ev1.currentCapacity > ev2.currentCapacity ? 'highkight' : ''}">${ev1.currentCapacity} Kişi</td>
            <td class="${ev2.currentCapacity > ev1.currentCapacity ? 'highkight' : ''}">${ev2.currentCapacity} Kişi</td>
        </tr>
    `;

    //Gizli olan tabloyu görünür yap
    document.getElementById('comparisonResult').style.display = 'block';
}

//Karşılaştırmayı Kaydet
function saveComprasion(){
    const title1 = document.getElementById('title1').textContent;
    const title2 = document.getElementById('title2').textContent;

    localStorage.setItem('lastComparison', `Karşılaştırılanlar: ${title1} vs ${title2}`);
    alert('Karşılaştırma sonucu başarıyla kaydedildi!');
}

//Sayfa açıldığında menüleri doldur
loadDropdowns();
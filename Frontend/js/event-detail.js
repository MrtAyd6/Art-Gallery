const API_BASE_URL = 'http://localhost:5160/api';
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

async function loadDetail() {
    const content = document.getElementById('eventDetailContent');
    try{
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const ev = await response.json();

        content.innerHTML = `
            <h1>${ev.title}</h1>
            <img src="${ev.imageurl || 'https://via.placeholder.com/800x400'}" style="width:100%; border-radius:8px;">
            <h2 style="margin-top:20px;">${ev.description || 'Bu etkinlik hakkında henüz bir açıklama girilmemiş.'}</p>
            
            <div style="background:#f9f9f9; padding:20px; border-radius:8px;">
                <h3>Seans Seçimi</h3>
                <select id="timeSlot" class="form-group" style="width:100%; padding:10px; margin-top:10px;">
                    <option value="10:00">10:00 - 12:00</option>
                    <option value="14:00">14:00 - 16:00</option>
                    <option value="18:00">18:00 - 20:00</option>
                </select>
                <p><strong>Ücret:</strong> ${ev.price} ₺</p>
                <button class="btn" onclick="goToPurchase(${ev.eventId})">Satın Almaya İlerle</button>
            </div>
        `;
    }catch(e){ content.innerHTML = "Hata oluştu."; }
}

function goToPurchase(id){
    const selectedTime = document.getElementById('timeSlot').value;
    window.location.href = `purchase.html?id=${id}&time=${selectedTime}`;
}

loadDetail();
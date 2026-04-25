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
                <button class="btn" onclick="goToPurchase(${ev.eventid})">Satın Almaya İlerle</button>
            </div>
        `;
    }catch(e){ content.innerHTML = "Hata oluştu."; }
}

function goToPurchase(id){
    const selectedTime = document.getElementById('timeSlot').value;
    window.location.href = `purchase.html?id=${id}&time=${selectedTime}`;
}

loadDetail();


//Kullanıcı ID'sini al
const userId = localStorage.getItem('userId');

//Yorumları getirme
async function loadComments() {
    const list = document.getElementById('commentList');
    try{
        const response = await fetch(`${API_BASE_URL}/comments/event/${eventId}`);
        if(response.ok){
            const comments = await response.json();
            list.innerHTML = '';

            if(comments.length === 0){
                list.innerHTML = '<p>Bu etkinlik için henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
                return;
            }

            comments.forEach(c => {
                //Yıldızları oluştur
                let stars = '⭐'.repeat(c.rating);

                list.innerHTML += `
                    <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
                        <div style="display: flex; justify-content: space-between;">
                            <strong>${c.userName}</strong>
                            <span>${stars}</span>
                        </div>
                        <p style="margin-top: 10px; color: #555;">${c.commentText}</p>
                        <small style="color: #999;">Tarih: ${new Date(c.createdAt).toLocaleDateString('tr-TR')}</small>
                    </div>
                `;
            });
        }
    }catch (error) {
        list.innerHTML = '<p>Yorumlar yüklenirken hata oluştu.</p>';
    }
}

//Yorum yapma
document.getElementById('commentForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    if(!userId){
        alert("Yorum yapabilmek için giriş yapmalısınız!");
        return;
    }

    const rating = document.getElementById('commentRating').value;
    const text = document.getElementById('commentText').value;

    try{
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                eventId: parseInt(eventId),
                rating: parseInt(rating),
                commentText: text
            })
        });

        const data = await response.json();

        if(response.ok){
            alert('Yorumunuz başarıyla eklendi');
            document.getElementById('commentForm').reset(); //Formu temizle
            loadComments(); //Yorumları yenile
        }else{
            alert(data.error || 'Yorum eklenemedi.');
        }
    }catch(error){
        alert('Sunucu hatası!');
    }
});

//Sayfa açıldıında yorumları yükle
loadComments();
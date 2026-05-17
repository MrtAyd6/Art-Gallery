const API_BASE_URL = 'http://localhost:5160/api';
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');
const userId = localStorage.getItem('userId');

let selectedSessionId = null;
let groupedSessions = {};   //Seansları tarihlerine göre tutmak için

//Etkinlik bilgileri
async function loadDetail() {
    const content = document.getElementById('eventDetailContent');
   
    try{
        
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const ev = await response.json();
        const imageurl = `Images/events/${eventId}.jpg`;
 
        
        let dateButtonsHtml = '';
        
        //Seansları tarihlere göre grupla
        if(ev.sessions && ev.sessions.length > 0){
            
            groupedSessions = ev.sessions.reduce((acc, curr) => {
                const date = curr.sessionDate || 'Tarih Belirtilmemis';
                if(!acc[date]) acc[date] = [];
                acc[date].push(curr);
                return acc;
            }, {});

            //Gruplanan tarihlerden tarih butonları oluştur
            const dates = Object.keys(groupedSessions);
            dateButtonsHtml = dates.map(d => {
                return `
                    <button class="date-btn" data-date="${d}" onclick="selectDate('${d}', this)"
                        style="padding: 10px 20px; margin: 0 10px 10px; border: 2px solid #ccc; border-radius: 8px; background-color: #fff; color: #2c3e50; font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 15px;">
                        ${d}
                    </button>
                `;
            }).join('');
        }else{
            dateButtonsHtml = '<p style="color: #e74c3c;">Bu etkinlik için henüz seans açılmaıştır.</p>';
        }

        const price = ev.price - (ev.price * ev.discountRate / 100);

        content.innerHTML = `
            <h1 style="color: #2c3e50;">${ev.title}</h1>
            
            <img src="${imageurl}" style="width:100%; border-radius:8px;">
            <h2 style="margin-top:20px;">${ev.description || 'Bu etkinlik hakkında henüz bir açıklama girilmemiş.'}</p>
            
            <div style="background:#f9f9f9; padding:20px; border-radius:8px; margin-top: 20px;">
                <h3 style="margin-bottom: 15px;">Tarih ve Seans Seçimi</h3>
                
                <div id="dateContainer" style="margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                    ${dateButtonsHtml}
                </div>

                <div id="sessionContainer" style="min-height: 60px;">
                    <p style="color: #7f8c8d; font-style: italic;">Lütfen saatleri görmek için yukarıdan bir tarih seçiniz.</p>
                </div>

                <p style="margin-top: 20px; font-size: 18px;"><strong>Ücret:</strong> ${price} ₺</p>
                <button class="btn" style="margin-top: 10px; width: 100%; padding: 12px; font-size: 16px;" onclick="goToPurchase(${ev.eventId})">Satın Almaya İlerle</button>
            </div>
        `;

        //Sayfa yüklendiğinde ilk tarih seçili olsun
        const datesKeys = Object.keys(groupedSessions);
        if(datesKeys.length > 0){
            setTimeout(() => {
                const firstDateBtn = document.querySelector('.date-btn');
                if(firstDateBtn) selectDate(datesKeys[0], firstDateBtn);
            }, 50);
        }
    }catch(e){ content.innerHTML = "Hata oluştu." + e.message; console.error(e); }
}

//Tarih  sseçimi ve sanasları doldurma
window.selectDate = function(dateStr, btnElement){
    //Tüm butonları sıfırla birini seç
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.style.borderColor = '#ccc';
        btn.style.backgroundColor = '#fff';
        btn.style.color = '#2c3e50';
    });
    btnElement.style.borderColor = '#e67e22';
    btnElement.style.backgroundColor = '#fdf2e9';
    btnElement.style.color = '#d35400';

    //Yeni tarih seçildiğinde eski seansı iptal et
    selectedSessionId = null;

    //Seçilen tarih seanslarını getir
    const sessionsForDate = groupedSessions[dateStr] || [];
    
    const sessionsHtml = sessionsForDate.map(s => {
        const isFull = s.currentCapacity <= 0;
        //eğer seans doluysa butonu pasif yapıyoruz
        return `
            <button
                class="session-btn"
                data-id="${s.sessionId}"
                onclick="selectSession(${s.sessionId}, this)"
                ${isFull ? 'disabled' : ''}
                style="padding: 10px 15px; margin: 5px 5px 5px 0; border: 2px solid #ccc; border-radius: 6px; background-color: ${isFull ? '#f5f5f5' : '#fff'}; color: ${isFull ? '#aaa' : '#2c3e50'}; cursor: ${isFull ? 'not-allowed' : 'pointer'}; transition: 0.3s; font-weight: bold;">
                ${s.startTime} - ${s.endTime} <br>
                <span style="font-size: 12px; font-weight: normal; color: ${isFull ? '#e74c3c' : '#27ae60'};">
                    ${isFull ? 'KONTENJAN DOLDU' : 'Kalan: ' + s.currentCapacity}
                </span>
            </button>
        `;
    }).join('');

            document.getElementById('sessionContainer').innerHTML = sessionsHtml;
}


//Butona tıklandığında seçili hale getiren fonk
window.selectSession = function(sessionId, btnElemnt){
    selectedSessionId = sessionId;

    //Tüm butonları normale döndür
    document.querySelectorAll('.session-btn').forEach(btn => {
        if(!btn.disabled){
            btn.style.borderColor = '#ccc';
            btn.style.backgroundColor = '#fff';
        }
    });

    //Seçilen butonu belirginleştir
    btnElemnt.style.borderColor = '#3498db';
    btnElemnt.style.backgroundColor = '#ebf5fb';
};

function goToPurchase(id){
    if(!selectedSessionId){
        alert("Lütfen satın alma işlemine geçmeden önce bir seans seçiniz!");
        return;
    }

    window.location.href = `event-purchase.html?id=${id}&sessionId=${selectedSessionId}`;
}

loadDetail();


//Yıldız seçimi
let selectedRating = 5;
const stars = document.querySelectorAll('#starRating span');

function updateStarColors(rating){
    stars.forEach(s => {
        s.style.color = parseInt(s.getAttribute('data-value')) <= rating ? '#f1c40f' : '#ccc';
    });
}

if(stars.length > 0) updateStarColors(selectedRating);

stars.forEach(star => {
    star.addEventListener('click', function() {
        selectedRating = parseInt(this.getAttribute('data-value'));
        updateStarColors(selectedRating);
    });
    star.addEventListener('mouseover', function(){
        updateStarColors(parseInt(this.getAttribute('data-value')));
    });
});

const starContainer = document.getElementById('starRating');
if(starContainer){
    starContainer.addEventListener('mouseout', () => updateStarColors(selectedRating));
}

function renderStars(rating){
    return `<span style="color: #f1c40f; font-size: 16px;">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>`;
}


let currentComments = [];

//Yorumları getirme
async function loadComments() {
    const list = document.getElementById('eventCommentList');
    if(!list) return;

    try{
        const response = await fetch(`${API_BASE_URL}/comments/event/${eventId}`);
        if(response.ok){
            currentComments = await response.json();
            list.innerHTML = '';

            const badge = document.getElementById('averageRatingBadge');

            if(badge && currentComments && currentComments.length > 0){
                
                const totalRating = currentComments.reduce((sum, c) => sum + (c.rating || 0), 0);
                const average = (totalRating / currentComments.length).toFixed(1);

                badge.innerHTML = `
                    <span style="color: #f1c40f; font-size: 18px;">★</span>
                    <span style="font-size: 16px; color: #2c3e50;">${average}</span>
                    <span style="color: #95a5a6; font-size: 13px; font-weight: normal; margin-left: 3px;">(${currentComments.length} yorum)</span>
                `;
                badge.style.display = 'flex';
            }else if(badge){
                badge.innerHTML = `<span style="color:#95a5a6; font-size: 13px; font-weight: normal;">Henüz puanlanmamış</span>`;
                badge.style.display = 'flex';
            }

            sortAndRenderComments('newest');
        }
    }catch (error) {
        list.innerHTML = '<p>Yorumlar yüklenirken hata oluştu.</p>';
    }
}

document.getElementById('commentSorter').addEventListener('change', (e) => {
    sortAndRenderComments(e.target.value);
});

//yorumları sırala ve bas
function sortAndRenderComments(sortType){
    const list = document.getElementById('eventCommentList');
    list.innerHTML = '';

    if(currentComments.length === 0){
        list.innerHTML = '<p style="color: #7f9c9d;">Bu etkinlik için henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
        return;
    }

    if(sortType === 'newest'){
        currentComments.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    else if (sortType === 'highest'){
        currentComments.sort((a,b) => b.rating - a.rating);
    }else if(sortType === 'mostUsefull'){
        currentComments.sort((a,b) => (b.usefulCount || 0) - (a.usefulCount || 0));
    }

    currentComments.forEach(c => {
        let adminReplyHtml = c.adminReply
            ? `<div style="background-color: #f0f8ff; padding: 10px; margin-top; border-left: 4px solid #3498db; border-radius: 4px;">
                    <strong style="color: #2980b9;">Yönetici Yanıtı:</strong> <br> ${c.adminReply}
                </div>`
            :'';
        let ownerReplyHtml = c.ownerReply
            ? `<div style="background-color: #f0f8ff; padding: 10px; margin-top; border-left: 4px solid #3498db; border-radius: 4px;">
                    <strong style="color: #2980b9;">Etkinik Sahibi Yanıtı:</strong> <br> ${c.ownerReply}
                </div>`
            :'';

        list.innerHTML += `
            <div style="backgorund: #fff; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #3498db">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #2c3e50;">${c.userName || 'Kullanıcı'}</strong>
                    <button class="btn-outline" style="margin-left: auto; width: auto; padding: 5px 10px; font-size: 15px; cursor: pointer;" onclick="markUsefull(${c.commentId})">
                        🤍(${c.usefulCount})
                    </button>
                    ${renderStars(c.rating)}
                </div>
                <p style="margin-top: 10px; color: #555;">${c.commentText}</p>

                ${adminReplyHtml}
                ${ownerReplyHtml}

                <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <small style="color: #999;">Tarih: ${new Date(c.createdAt).toLocaleDateString('tr-TR')}</small>          
                </div>
            </div>

        `;
    });
}

//Sayfa açıldıında yorumları yükle
loadComments();

//Yorum yapma
const submitCommentBtn = document.getElementById('submitCommentBtn');
if(submitCommentBtn){
    submitCommentBtn.addEventListener('click', async () => {
        const text = document.getElementById('commentText').value;
        const messageEl = document.getElementById('commentMessage');

        if(!userId){
        messageEl.textContent = "Yorum yapmak için lütfen giriş yapın.";
        messageEl.style.color = "#e74c3c";
        return;
        }

        if(!text){
            messageEl.textContent = "Lütfen boş bir yorum göndermeyin.";
            messageEl.style.color = "#e74c3c";
        }

        try{
            const response = await fetch(`${API_BASE_URL}/comments/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    eventId: parseInt(eventId),
                    rating: selectedRating,
                    commentText: text
                })
            });

            const data = await response.json();

            if(response.ok){
                messageEl.textContent = "Yorumunuz başarıyla eklendi!";
                messageEl.style.color = "#27ae60";

                document.getElementById('commentText').value = '';
                selectedRating = 5;
                updateStarColors(selectedRating);

                loadComments();
            }else{
                messageEl.textContent = data.error || 'Yorum eklenemedi. (Sadece etkinliğe katılanlar yorum yapabilir.)';
                messageEl.style.color = "#e74c3c";
            }
        }catch(error){
            messageEl.textContent = "Sunucu hatası!";
            messageEl.style.color = "#e74c3c";
        }
    });
}

//Faydalı buldum oyu verme
async function markUsefull(commentId) {
    if(!userId){
        alert("Oy vermek için giriş yapmalısınız.");
        return;
    }

    try{
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}/useful`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId) })
        });

        if(response.ok){
            loadComments();
        }else{
            console.error("İşlem reddedildi.");
        }
        
    }catch(error){
        console.error("Oy verilemedi:", error);
    }
}
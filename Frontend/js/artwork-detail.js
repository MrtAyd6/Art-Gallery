const API_BASE_URL = 'http://localhost:5160/api';
const urlParams = new URLSearchParams(window.location.search);
const artworkId = urlParams.get('id');
const userId = localStorage.getItem('userId');

let currentArtwork = null;

//Görüntülenmeyi arttır
async function incrementViews() {
    const artworkId = new URLSearchParams(window.location.search).get('id');
    await fetch(`${API_BASE_URL}/artworks/${artworkId}/increment-view`, { method: 'POST' });
}

async function loadArtworkDetails() {
    incrementViews();

    try{
        //Mevcut API'den tüm eserleri çekip ID'Ye göre filtrele
        const response = await fetch(`${API_BASE_URL}/artworks`);
        const artworks = await response.json();
        currentArtwork = artworks.find(a => a.artworkId == artworkId);

        if(currentArtwork){
            const price = currentArtwork.price - (currentArtwork.price * currentArtwork.discountRate / 100);

            document.getElementById('artTitle').textContent = currentArtwork.title;
            document.getElementById('artArtist').textContent = `Sanatçı: ${currentArtwork.artistName}`;
            document.getElementById('artDescription').textContent = currentArtwork.description;
            document.getElementById('artPrice').textContent = `${price} ₺`;

            const imageElement = document.getElementById('artImage');
            imageElement.src = `Images/artworks/${currentArtwork.artworkId}.jpg`;
            imageElement.onerror = () => { imageElement.src = 'Images/default.jpg'; };
        }
    }catch(error){
        alert("Eser bilgileri yüklenemedi!");
    }
}

//Satın Alma
const buyBtn = document.getElementById('buyBtn');
if (buyBtn) {
    buyBtn.addEventListener('click', () => {
        if(!userId){
            alert("Satın alma işlemi için giriş yapmalısınız.");
            window.location.href = 'login.html';
            return;
        }
        window.location.href = `artwork-purchase.html?id=${artworkId}`;
    });
}

//Favorilere ekleme
document.getElementById('addToFavBtn').addEventListener('click', async () => {
    if(!userId){
        alert("Favorilere ekleme için giriş yapmalısınız.");
        return;
    }

    try{
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId), artworkId: parseInt(artworkId) })
        });

        if(response.ok) alert("Eser favorilerinize eklendi!");
        else alert("Eser zaten favorilerinizde veya bir hata oluştu.");
    }catch (e){
        alert("Bağlantı hatası!");
    }
});

loadArtworkDetails();


//Yıldız seçimi
let selectedRating = 5;
const stars = document.querySelectorAll('#starRating span');

function updateStarColors(rating){
    stars.forEach(s => {
        if(parseInt(s.getAttribute('data-value')) <= rating){
            s.style.color = '#f1c40f';
        }else{
            s.style.color = '#ccc';
        }
    });
}

if(stars.length > 0) updateStarColors(selectedRating);

stars.forEach(star => {
    //Tıklanınca puanı kaydet
    star.addEventListener('click', function() {
        selectedRating = parseInt(this.getAttribute('data-value'));
        updateStarColors(selectedRating);
    });
    //Üzerine gelince hover
    star.addEventListener('mouseover', function() {
        updateStarColors(parseInt(this.getAttribute('data-value')));
    });
});

//Fare yıldızlardan çekilince seçilmiş olana geri dön
const starContainer = document.getElementById('starRating');
if(starContainer){
    starContainer.addEventListener('mouseout', function() {
        updateStarColors(selectedRating);
    });
}

//Yıldızları ekrana bas
function renderStars(rating){
    const fullStar = '★';
    const emptyStar = '☆';
    return `<span style="color: #f1c40f; font-size: 16px;">${fullStar.repeat(rating)}${emptyStar.repeat(5 - rating)}</span>`;
}

let currentComments = [];

//Yorumları çek ve göster
async function loadComments() {
    const list = document.getElementById('commentList');
    if(!commentList) return;

    try{
        const response = await fetch(`${API_BASE_URL}/comments/artwork/${artworkId}`);
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
    }catch(e){
        list.innerHTML = '<p style="color: #e74c3c;">Yorumlar yüklenşrken bir hata oluştu.</p>';
    }
}

document.getElementById('commentSorter').addEventListener('change', (e) => {
    sortAndRenderComments(e.target.value);
});

function sortAndRenderComments(sortType){
    const list = document.getElementById('commentList');
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

//Sayfa açıldığında yorumları yükle
loadComments();

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

//Yorum gönderme
const submitCommentBtn = document.getElementById('submitCommentBtn');
if(submitCommentBtn){
    submitCommentBtn.addEventListener('click', async () => {
        const commentText = document.getElementById('commentText').value.trim();
        const messageEl = document.getElementById('commentMessage');

        if(!userId){
            messageEl.textContent = "Yorum yapmak için lütfen giriş yapın.";
            messageEl.style.color = "#e74c3c";
            return;
        }
        if(!commentText){
            messageEl.textContent = "Lütfen boş bir yorum göndermeyin.";
            messageEl.style.color = "#e74c3c;"
            return;
        }

        try{
            const response = await fetch(`${API_BASE_URL}/comments/artwork`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    artworkId: parseInt(artworkId),
                    commentText: commentText,
                    rating: selectedRating
                })
            });

            if(response.ok){
                messageEl.textContent = "Yorumunuz başarıyla eklendi!";
                messageEl.style.color = "#27ae60";

                //Formu sıfırle
                document.getElementById('commentText').value = "";
                selectedRating = 5;
                updateStarColors(selectedRating);

                //Yorumları tekrar yükle
                loadComments();
            }else{
                const errorData = await response.json();
                messageEl.textCOntent = errorData.error || errorData.message || "Yorum eklenemedi.";
                messageEl.style.color = "#e74c3c";
            }
        }catch(error){
            messageEl.textContent = "Sunucuya ulaşılamadı.";
            messageEl.style.color = "e74c3c;"
        }
    });
}
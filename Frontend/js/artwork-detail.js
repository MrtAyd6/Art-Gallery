const API_BASE_URL = 'http://localhost:5160/api';
const urlParams = new URLSearchParams(window.location.search);
const artworkId = urlParams.get('id');
const userId = localStorage.getItem('userId');

let currentArtwork = null;

async function loadArtworkDetails() {
    try{
        //Mevcut API'den tüm eserleri çekip ID'Ye göre filtrele
        const response = await fetch(`${API_BASE_URL}/artworks`);
        const artworks = await response.json();
        currentArtwork = artworks.find(a => a.artworkId == artworkId);

        if(currentArtwork){
            document.getElementById('artTitle').textContent = currentArtwork.title;
            document.getElementById('artArtist').textContent = `Sanatçı: ${currentArtwork.artistName}`;
            document.getElementById('artDescription').textContent = currentArtwork.description;
            document.getElementById('artPrice').textContent = `${currentArtwork.price} ₺`;

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

//Yorumları çek ve göster
async function loadComments() {
    const commentList = document.getElementById('commentList');
    if(!commentList) return;

    try{
        const response = await fetch(`${API_BASE_URL}/comments/artwork/${artworkId}`);
        if(response.ok){
            const comments = await response.json();
            if (comments.length > 0){
                commentList.innerHTML = comments.map(c => `
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom:10px; border-left: 4px solid #3498db;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: #2c3e50;">${c.userName || 'Kullanıcı'}</strong>
                            ${renderStars(c.rating)}
                        </div>
                        <p style="margin-top: 8px; color: #555; line-height: 1.5;">${c.commentText}</p>
                    </div>
                `).join('');
            }else{
                commentList.innerHTML = '<p style="color: #7f8c8d;">Bu eser için henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
            }
        }
    }catch(e){
        commentList.innerHTML = '<p style="color: #e74c3c;">Yorumlar yüklenşrken bir hata oluştu.</p>';
    }
}

//Sayfa açıldığında yorumları yükle
loadComments();

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
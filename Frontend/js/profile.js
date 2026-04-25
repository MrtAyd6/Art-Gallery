const API_BASE_URL = 'http://localhost:5160/api';

//Güvenlik kontrolü
const userId = localStorage.getItem('userId');
let fullName = localStorage.getItem('fullName');

if(!userId){
    window.location.href = 'login.html';
}else{
    document.getElementById('userNameDisplay').textContent = `Hoş geldin, ${fullName}`;
    document.getElementById('updateFullName').value = fullName;
}

//Çıkış yap Butonu
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
});

//Yardımcı Alert Fonksiyonu
function showAlert(elementId, message, type){
    const box = document.getElementById(elementId);
    box.textContent = message;
    box.className = `alert ${type}`;
    box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none';}, 3000); //3 saniye sonra gizle
}

//Profil Bilgilerini Güncelle
document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newFullName = document.getElementById('updateFullName').value;
    const newEmail = document.getElementById('updateEmail').value;

    try{
        const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: newFullName, email: newEmail })
        });
        const data = await response.json();

        if(response.ok){
            showAlert('profileAlert', 'Profil başarıyla güncellendi!', 'success');
            // yeni ismi hafızaya ve sağ üste yaz
            localStorage.setItem('fullName', newFullName);
            document.getElementById('userNameDisplay').textContent = `Hoş geldin, ${newFullName}`;
        }else{
            showAlert('profileAlert', data.error, 'error');
        }
    } catch(error){
        showAlert('profileAlert', 'Sunucu hatası!', 'error');
    }
});

//Şifre güncelleme
document.getElementById('updatePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try{
        const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword})
        });
        const data = await response.json();

        if(response.ok){
            showAlert('passwordAlert', 'Şİfreniz başarıyla güncellendi!', 'success');
            document.getElementById('updatePasswordForm').reset();  //Formu temizle
        }else{
            showAlert('passwordAlert', data.error, 'error');
        }
    } catch (error){
        showAlert('passwordAlert', 'Sunucu hatası!', 'error');
    }
});

//Favori eserleri getirme ve listeleme
async function loadFavorites() {
    const grid = document.getElementById('favoritesGrid');
    try{
        const response = await fetch(`${API_BASE_URL}/favorites/user/${userId}`);

        if(response.ok){
            const favorites = await response.json();
            grid.innerHTML = '';

            if(favorites.length === 0){
                grid.innerHTML = '<p>Henüz favorilere eklediğini bir eser yok.</p>';
                return;
            }

            favorites.forEach(art => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>${art.title}</h3>
                    <p>Sanatçı: ${art.artistName}</p> <p>Fiyat: ${art.price} ₺</p>
                    <button class="btn-outline btn-danger" onclick="removeFromFavorites(${art.artworkId})">
                        💔 Favorilerden Çıkar
                    </button>
                `;
                grid.appendChild(card);
            });
        }
    }catch(error){
        grid.innerHTML = '<p style="color:red;">Favoriler yüklenemedi.</p>';
    }
}

//Favorilerden çıkarma
async function removeFromFavorites(artworkId) {
    if(!confirm("Bu eseri favorilerden çıkarmak istediğinize emin misiniz?"))return;

    try{
        const response = await fetch(`${API_BASE_URL}/favorites/user/${userId}/artwork/${artworkId}`, {
            method: 'DELETE'
        });

        if(response.ok){
            loadFavorites();    //Lİsteyi ekrandan silmek için sayfayı tazelemeye gerek olmasın
        }else{
            alert('Silinirken bir hata oluştu.');
        }
    }catch(error){
        alert('Sunucu hatası!');
    }
}

//Sayfa açıldığında favorileri yükle
loadFavorites();
const API_BASE_URL = 'http://localhost:5160/api';

//Güvenlik kontrolü
const userId = localStorage.getItem('userId');
let fullName = localStorage.getItem('fullName');
let eMail = localStorage.getItem('eMail');

if(!userId || !fullName){
    window.location.href = 'login.html';
}else{
    const welcomeContainer = document.getElementById('profileWelcomeText');
    if (welcomeContainer){
        welcomeContainer.innerHTML = `Hoş geldin <strong>${fullName}</strong>`;
    }

    loadInfos(fullName, eMail);
}

function loadInfos(name, email){
    const nameInput = document.getElementById('updateFullName');
    const emailInput = document.getElementById('updateEmail');
    if(nameInput && emailInput){
        nameInput.value = "";
        emailInput.value = "";

        nameInput.placeholder = name;
        emailInput.placeholder = email;
    }
}

//Çıkış yap Butonu
const logoutBtn = document.getElementById('profileLogoutBtn');
if(logoutBtn){
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if(confirm("Hesabınızdan çıkış yapmak istediğinize emin misiniz?")){
            localStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

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
            localStorage.setItem('eMail', newEmail);

            loadInfos(newFullName, newEmail);

            const welcomeContainer = document.getElementById('profileWelcomeText');
            if(welcomeContainer){
                welcomeContainer.innerHTML = `Hoş geldin, <strong>${newFullName}</strong>`;
            }
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
    const list = document.getElementById('favoritesList');
    if(!userId) return;

    try{
        const response = await fetch(`${API_BASE_URL}/favorites/user/${userId}`);

        if(response.ok){
            const favorites = await response.json();
            
            if(favorites.length === 0){
                list.innerHTML = '<p style="color: #7f8c8d; text-align: center; margin-top: 20px;">Henüz favorilere eklediğini bir eser yok.</p>';
                return;
            }

            list.innerHTML = favorites.map(f => `
                <div style="display: flex; align-items: center; padding: 12px; background: #fff; border: 1px solid #eee; border-radius: 8px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02);"
                    onclick="window.location.href='artwork-detail.html?id=${f.artworkId}'"
                    onmouseover="this.style.borderColor='#3498db'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.08)'"
                    onmouseout="this.style.borderColor='#eee'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.02)'">
                
                    <img src="Images/artworks/${f.artworkId}.jpg"
                        onerror="this.src='Images/default.jpg'"
                        style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px; margin-right: 15px; border: 1px solid #ddd;">
                        
                    <div style="flex-grow: 1;">
                        <h4 style="margin: 0 0 4px 0; color: #2c3e50; font-size: 15px;">${f.title || 'İsimsiz Eser'}</h4>
                        <p style="margin: 0 0 4px 0; color: #7f8c8d; font-size: 13px;">Sanatçı: ${f.artistName || 'Bilinmiyor'}</p>
                        <p style="margin: 0; color: #27ae60; font-weight: bold; font-size: 14px;">${f.price} ₺</p>
                    </div>
                    
                    <button onclick="event.stopPropagation(); removeFromFavorites(${f.artworkId})"
                            title="Favorilerden Çıkar"
                            style="background: #fdf2f2; border: 1px solid #fadbd8; color: #e74c3c; width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 16px; margin-left: 10px; transition: 0.2s;"
                            onmouseover="this.style.background='#fadbd8'"
                            onmouseout="this.style.background='#fdf2f2'">
                        💔
                    </button>
                </div>
            `).join('');      
        }
    }catch(error){
        list.innerHTML = '<p style="color:red;">Favoriler yüklenemedi.</p>';
    }
}

//Sayfa açıldığında favorileri yükle
loadFavorites();

//Rezervasyonları getir
async function loadReservations() {
    const list = document.getElementById('reservationsList');
    if(!userId) return;

    try{
        const response = await fetch(`${API_BASE_URL}/events/reservations/user/${userId}`);

        if(response.ok){
            const reservations = await response.json();
            if(reservations.length === 0){
                list.innerHTML = '<p style="color: #7f8c8d;">Henüz satın aldığınız bir etkinlik bileti bulunmuyor.</p>';
                return;
            }

            //Gelen rezervasyonları göster
            list.innerHTML = reservations.map(r => `
                <div style="background: #fff; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #27ae60; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #2c3e50;">${r.eventTitle || 'Sanat Etkinşiği'}</h4>
                        <span style="background: #e8f8f5; color: #117864; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">ONAYLANDI</span>
                    </div>
                    <p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Tarih:</strong> ${r.sessionDate || 'Belirtilmemiş'}</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Seans:</strong> ${r.sessionInfo || 'Belirtilmemiş'}</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Bilet Adedi:</strong> ${r.ticketCount} Kişi</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Ödenen Tutar:</strong> ${r.totalPrice} ₺</p>

                    <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="openUpdateModal(${r.reservationId}, ${r.eventId}, ${r.ticketCount})" style="padding: 6px 12px; background-color: #f39c12; color: white; border: none; border-radius: 4px; cursor. pointer; transition: 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Güncelle</button>
                        <button onclick="cancelReservation(${r.reservationId})" style="padding: 6px 12px; background-color: #e74c3c; color: white; border: none; border: 4px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">İptal Et</button>
                    </div>
                </div>
            `).join('');
        }else{
            list.innerHTML = '<p style="color: #e74c3c;">Rezervasyonlarınız getirilirken bir hata oluştu.</p>';
        }
    }catch(error){
        list.innerHTML = '<p style="color. #e74c3c;">Sunucu bağlantı hatası.</p>';
    }
}

//Sayfa yüklendiğinde öalıştır
loadReservations();

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

//Rezervasyon iptal etme
async function cancelReservation(resId) {
    if(!confirm("Bu rezervasyonu iptal etmek isrediğinize emin misiniz? (Biletleriniz yanacaktır)")) return;

    try{
        const response = await fetch(`${API_BASE_URL}/events/reservation/${resId}`, { method : 'DELETE' });
        const data = await response.json();

        if(response.ok){
            alert(data.message);
            loadReservations(); //Listeyi tazele
        }else{
            alert(data.error);
        }
    }catch(e) { alert("Sunucuyla iletişim kurulamadı."); }
}

//Rezevasyon güncelleme ekranı
let updatingResId = null;
let currentEventPrice = 0;
let oldTicketCount = 0;
let oldTotalPrice = 0;

async function openUpdateModal(resId, eventId, currentTicketCount) {
    updatingResId = resId;
    oldTicketCount = currentTicketCount;

    document.getElementById('updatePaymentSection').style.display = 'none';
    document.getElementById('updateCcName').value = '';
    document.getElementById('updateCcNumber').value = '';
    document.getElementById('saveUpdateBtn').innerText = 'Kaydet ve Güncelle';
    document.getElementById('saveUpdateBtn').style.backgroundColor = '#2c3e50';

    document.getElementById('updateTicketCount').value = currentTicketCount;
    document.getElementById('updateReservationModal').style.display = 'flex';

    try{
        //Etkinliğin fiyatını ve güncel seansları çekiyoruz
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const ev = await response.json();
        currentEventPrice = ev.price;
        oldTotalPrice = oldTicketCount * currentEventPrice;

        const select = document.getElementById('updateSessionSelect');
        select.innerHTML = ev.sessions.map(s => {
            const isFull = s.currentCapacity <= 0 ? 'disabled' : '';
            const capacityText = s.currentCapacity <= 0 ? '(DOLU)' : `(Kalan: ${s.currentCapacity})`;
            return `<option value="${s.sessionId}" ${isFull}>${s.sessionDate} / ${s.startTime} - ${s.endTime} ${capacityText}</option>`;
        }).join('');

        calculateUpdatePrice(); //ilk fiyatı hesapla
    }catch (e) { console.error("Etkinlik bilgileri çekilmedi."); }
}

function closeUpdateModal(){
    document.getElementById('updateReservationModal').style.display = 'none';
}

function calculateUpdatePrice(){
    const count = parseInt(document.getElementById('updateTicketCount').value) || 1;
    const newTotal = count * currentEventPrice;

    let diffText = "";
    if(newTotal > oldTotalPrice){
        diffText = `<span style="color: #e74c3c; font-size: 14px; margin-left: 10px:">(Ek Ödeme: +${newTotal - oldTotalPrice} ₺)</span>`;
    }
    
    document.getElementById('updateTotalPrice').innerHTML = `${newTotal} ${diffText}`;
}

//Bilet sayısı değiştikçe hesapla
document.getElementById('updateTicketCount').addEventListener('input', calculateUpdatePrice);

//Güncelleme butonu
document.getElementById('saveUpdateBtn').addEventListener('click', async () => {
    const newSessionId = document.getElementById('updateSessionSelect').value;
    const newTicketCount = parseInt(document.getElementById('updateTicketCount').value) || 1;
    const newTotalPrice = newTicketCount * currentEventPrice;

    const priceDifference = newTotalPrice - oldTotalPrice;
    const paymentSection = document.getElementById('updatePaymentSection');

    //Eğer ödeme gerekiyorsa ve kart alanı kapalıysa
    if(priceDifference > 0 && paymentSection.style.display === 'none'){
        document.getElementById('extraPaymentAmount').innerHTML = priceDifference;
        paymentSection.style.display = 'block';

        const saveBtn = document.getElementById('saveUpdateBtn');
        saveBtn.innerText = 'Ödemeyi Tamamla ve Güncelle';
        saveBtn.style.backgroundColor = '#27ae60';
        return; //Kullanıcınıın kart bilgilerini girmesiin nbekle
    } 

    //KArt alanı zaten açıksa yani ödeme butonuna basıldıysa
    if(priceDifference > 0 && paymentSection.style.display === 'block'){
        const ccName = document.getElementById('updateCcName').value.trim();
        const ccNumber = document.getElementById('updateCcNumber').value.trim();
        if(!ccName || !ccNumber){
            alert("Lütfen işlemi tamamlamak için kredi kartı bilgilerinizi eksiksiz giriniz")
            return;
        }
    }else if(priceDifference < 0){
        //İade durumu varsa sadece onay al
        if(!confirm(`Bilet sayısını azalttınız. Azaltılan biletler yanacaktır. Onaylıyor musunuz?`)){
            return;
        }
    }

    //Her şey tamamsa backende gönder
    try{
        const response = await fetch(`${API_BASE_URL}/events/reservation/${updatingResId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: parseInt(newSessionId),
                ticketCount: newTicketCount,
                totalPrice: newTotalPrice
            })
        });

        const data = await response.json();

        if (response.ok){
            alert("Rezervasyonunuz başarıyla güncellendi!");
            closeUpdateModal();
            loadReservations(); //listeyi tazele
        }else{
            alert(data.error);
        }
    }catch(error){
        alert("Güncelleme işlemi sırasında sunucu hatası oluştu.");
    }
});
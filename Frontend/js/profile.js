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

async function getUserRole() {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    const rol = await response.json();
    if (response.ok){
        return rol.role;
    }

    return null;
}

async function setupRoleUI(){
    const badge = document.getElementById('profileRoleBadge');
    const desc = document.getElementById('profileRoleDesc');
    const applyBtn = document.getElementById('applyPremiumBtn');
    const statsBtn = document.getElementById('statsBtn');
    const addContentBtn = document.getElementById('addContentBtn');
    const userRole = await getUserRole();
    localStorage.setItem('role', userRole); 

    if(userRole === 'Artist'){
        badge.innerHTML = "Sanatçı";
        desc.innerHTML = "Eserlerinizle galerimize renk katıyorsunuz.";
        applyBtn.style.display = 'none';
        statsBtn.style.display = 'block';
        addContentBtn.style.display = 'block';
    }
    else if(userRole === 'WorkshopOwner'){
        badge.innerHTML =  "Atölye Sahibi";
        desc.innerHTML = "Eğitim ve etkinliklerinizi yönetebilrisiniz.";
        applyBtn.style.display = 'none';
        statsBtn.style.display = 'block';
        addContentBtn.style.display = 'block';
    }
    else{
        badge.innerHTML = "Standart Müşteri";
        applyBtn.style.display = 'block';
        statsBtn.style.display = 'none';
        addContentBtn.style.display = 'none';
    }
}

setupRoleUI();

//PREMİUM BAŞVURU
const applyBtn = document.getElementById('applyPremiumBtn');
if(applyBtn){
    applyBtn.addEventListener('click', () => {
        document.getElementById('premiumRequestModal').style.display = 'flex';
    });
}

const sendRequestBtn = document.getElementById('sendRequestBtn');
if(sendRequestBtn){
    sendRequestBtn.addEventListener('click', async () => {
        const requestedRole = document.getElementById('requestedRoleType').value;
        const message = document.getElementById('requestedMessage').value.trim();

        if(!message){
            alert("Lütfen kendinizi tanıtan kısa bir yazı yazın.");
            return;
        }

        try{
            const response = await fetch(`${API_BASE_URL}/users/request-role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    requestedRole: requestedRole,
                    message: message
                })
            });

            if(response.ok){
                alert("Harika! Başvurunuz yöneticilerimize ulaştı.");
                document.getElementById('premiumRequestModal').style.display = 'none';
            }else{
                alert("Başvuru gönderilemedi");
            }
        }catch(e){ alert("Bağlantı hatası!"); }
    });
}

//Sanatçı: Yeni eser yükleme
const addContentBtn = document.getElementById('addContentBtn');
if(addContentBtn){
    addContentBtn.addEventListener('click', async () => {
        const userRole =  await getUserRole();

        if(userRole === 'Artist'){
            document.getElementById('addArtworkForm').reset();  //Formu temizle
            document.getElementById('addArtworkModal').style.display = 'flex';
        }
        else if(userRole === 'WorkshopOwner'){
            document.getElementById('addEventForm').reset();
            //Form sıfırlanınca ek seans satırları temizlensin
            document.getElementById('sessionFormList').innerHTML = `
                <div class="session-form-item" style="display: flex; gap: 8px; margin-bottom: 10px; align-items: center;">
                    <input type="date" class="session-date-input" required style="flex: 2; padding: 6px; border:1px solid #ccc; border-radius:4px;">
                    <input type="time" class="session-start-input" required style="flex: 1; padding: 6px; border:1px solid #ccc; border-radius:4px;">
                    <input type="time" class="session-end-input" required style="flex: 1; padding: 6px; border:1px solid #ccc; border-radius:4px;">
                    <input type="number" class="session-cap-input" placeholder="Kont." min="1" required style="width: 70px; padding: 6px; border:1px solid #ccc; border-radius:4px;">
                </div>`;
            document.getElementById('addEventModal').style.display = 'flex';
        }
    });
}

document.getElementById('saveArtworkBtn').addEventListener('click', async () => {
    
    const title = document.getElementById('newArtTitle').value.trim();
    const category = document.getElementById('newArtCategory').value.trim();
    const desc = document.getElementById('newArtDesc').value.trim();
    const price = document.getElementById('newArtPrice').value.trim();
    const imageInput = document.getElementById('newArtImage');

    if(!title || !category || !desc || !price || imageInput.files.length === 0){
        alert("Lütfen tüm alanları doldurun ve bir fotoğraf seçin.");
        return;
    }

    const saveBtn = document.getElementById('saveArtworkBtn');
    saveBtn.innerHTML = "Yükleniyor...";
    saveBtn.disabled = true;

    //resim ve metinleri göndermek için FormData oluştur
    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Category", category);
    formData.append("Description", desc);
    formData.append("Price", price);
    formData.append("ArtistId", userId);
    formData.append("ArtistName", fullName);
    formData.append("ImageFile", imageInput.files[0]);

    try{
        const response = await fetch(`${API_BASE_URL}/artworks/add-artwork`, {
            method: 'POST',
            body: formData  //FormData kullanırken 'Content-Type' yazılmaz
        });

        if(response.ok){
            saveBtn.innerHTML = "✅ Başarıyla Yüklendi";
            saveBtn.style.backgroundColor = "#27ae60";
            
            setTimeout(() => {
                document.getElementById('addArtworkModal').style.display = 'none';
                document.getElementById('addArtworkForm').reset();
                window.location.reload();
            }, 2000);
        }else{
            const data = await response.json();
            alert(data.error || "Yükleme sırasında bir hata oluştu");
            saveBtn.innerHTML = "Eseri Yükle";
            saveBtn.disabled = false;
        }
    }catch (error){
        alert("Sunucuya bağlanılamadı.");
        saveBtn.innerHTML = "Eseri Yükle";
        saveBtn.disabled = false;
    }
});

//İstatistikleri ve siparişleri yükleme
const statsBtn = document.getElementById('statsBtn');
if(statsBtn){
    statsBtn.addEventListener('click', loadDashboard);
}

async function loadDashboard() {
    document.getElementById('statsModal').style.display = 'flex';
    const container = document.getElementById('statsContainer');
    container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Veriler yükleniyor...</p>';
    const userRole = await getUserRole();
    
    if(userRole === 'Artist'){
        try{
            const response = await fetch(`${API_BASE_URL}/artworks/artist/${userId}/dashboard`);
            const data = await response.json();

            container.innerHTML = `
                <h3 style="color: #2980b9;">Eserlerimin Performansı</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <tr style="background: #f4f4f4;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Eser Adı</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Puan</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Görüntülenme</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Yorum</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Favori</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Durum</th>
                    </tr>
                    ${data.artworks.map(a => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${a.title}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">⭐ ${a.rating}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${a.viewscount}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${a.commentcount}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${a.favoritecount}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                                <span style="color: ${a.status === 'Sold' ? 'red' : 'green'} font-weight: bold;">${a.status === 'Sold' ? 'SATILDI' : 'SATIŞTA'}</span>
                            </td>
                        </tr>
                    `).join('')}
                </table>
            
                <h3 style="color: #27ae60;">Gelen Siparişler</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f4f4f4;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Alıcı</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Eser</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Durum</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">İşlem</th>
                    </tr>
                    ${data.orders.map(o => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${o.buyername}<br><small>${o.buyeremail}</small></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${o.artworktitle}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;"><strong>${o.status}</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">
                                ${o.status === 'Pending' ? `
                                    <button onclick="processOrder(${o.orderid}, 'Approved')" style="background: #27ae60; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Onayla</button>
                                    <button onclick="processOrder(${o.orderid}, 'Rejected')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Reddet</button>
                                ` : '---'}
                            </td>
                        </tr>
                    `).join('')}
                </table>
            `;
        }catch (e) { container. innerHTML = "Hata oluştu."; }
    }
    else if(userRole === 'WorkshopOwner'){
        
        try{
            const response = await fetch(`${API_BASE_URL}/events/workshop/${userId}/dashboard`);
            const data = await response.json();
            
            
            
            container.innerHTML = `
                <h3 style="color: #2980b9;">Etkinlik ve Seans Durumları</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <tr style="background: #f4f4f4;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Etkinlik Adı</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Toplam Rezervasyon</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Doluluk Oranı</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Puan</th>
                    </tr>
                    ${data.events.map(e => {
                        const total = parseInt(e.totalcapacity);
                        const remaining = parseInt(e.totalremainingcapacity);
                        const sold = total - remaining;
                        const occupancyRate = total > 0 ? Math.round((sold / total) * 100) : 0;
                        const badgeColor = occupancyRate >= 80 ? '#e74c3c' : '#27ae60';

                        const eventComments = data.comments.filter(c => 
                            (c.eventtitle && c.eventtitle === e.title)
                        );

                        let eventScoreHtml = '<span style="color: #bdc3c7;">-</span>';

                        if (eventComments.length > 0) {
                            const eventRatingSum = eventComments.reduce((sum, c) => sum + parseInt(c.rating || 0), 0);
                            const eventAvg = (eventRatingSum / eventComments.length).toFixed(1);
                            eventScoreHtml = `<strong style="color: #f39c12;">⭐ ${eventAvg}</strong> <small style="color: #95a5a6; font-weight: normal;">(${eventComments.length})</small>`;
                        }

                        return `<tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>${e.title}</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${sold || 0}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                                <span style="color: ${badgeColor}; font-wight: bold">
                                    %${occupancyRate || 0} Dolu
                                </span>
                            </td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                                ${eventScoreHtml}
                            </td>
                        </tr>
                    `;
                    }).join('')}
                </table>


            
                <h3 style="color: #27ae60;">Yorumlar ve Yanıtlar</h3>
                <div>
                    ${data.comments.length === 0 ? '<p>Henüz etkinliklerinize yorum yapılmamış.</p>' :
                    data.comments.map(c => `
                        <div style="background: #fdfdfd; padding: 15px; border: 1px solid #eee; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #f39c12;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <strong>${c.username} <span style="color: #f1c40f;">${'*'.repeat(c.rating)}</span></strong>
                                <small style="color: #999;">${new Date(c.createdat).toLocaleDateString('tr-TR')} - ${c.eventtitle}</small>
                            </div>
                            <p style="margin: 5px 0 10px 0; color: #555;">"${c.commenttext}"</p>
                            
                            ${c.ownerreply
                                ? `<div style="background: #eafaf1; padding: 10px; border-radius: 4px; border-left: 3px solid #27ae60; font-size: 13px;">
                                        <strong>Sizin Yanıtınız:</strong> ${c.ownerreply}
                                    </div>`
                                : `<div style="display: flex; gap: 10px; margin-top: 10px;">
                                        <input type="text" id="replyInput_${c.commentid}" placeholder="Yanıt verin..." style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius:4px;">
                                        <button onclick="submitReply(${c.commentid})" style="background: #2980b9; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Yanıtla</button>
                                    </div>`
                            }
                        </div>
                    `).join('')}
                </div>
            `;
        }catch (e) { container.innerHTML = "Hata oluştu." + e; }
    }
};

//Yorum yanıtlama Fonksiyonu
window.submitReply = async function(commentId) {
    const replyText = document.getElementById(`replyInput_${commentId}`).value.trim();
    if(!replyText) { alert("Lütfen bir yanıt yazın."); return; }

    try{
        const response = await fetch(`${API_BASE_URL}/events/comments/${commentId}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ replyText: replyText })
        });

        if(response.ok){
            alert("Yanıtınız başarıyla eklendi!");
            loadDashboard();
        }else{
            alert("Yanıt eklenirken bir hata oluştu.");
        }
    }catch(e) { alert("Sunucu bağlantı hatası!"); }
}

async function processOrder(orderId, decision) {
    if(!confirm("Bu işlemi onaylıyor musunuz?")) return;
    const response = await fetch(`${API_BASE_URL}/artworks/orders/${orderId}/process`, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({ decision })
    });
    if(response.ok) {loadDashboard();}
}

//Siparişlerimi yükle
async function loadOrders() {
    const list = document.getElementById('ordersList');
    try{
        const response = await fetch(`${API_BASE_URL}/artworks/user/${userId}/orders`);
        const orders = await response.json();

        if(orders.length === 0){
            list.innerHTML = '<div style="padding: 15px; border: 1px solid #eee; border-radius: 6px; background: #fdfdfd; text-align: center; color: #7f8c8d;">Henüz satın aldığınız bir eser bulunmuor.</div>';
            return;
        }

        list.innerHTML = orders.map( o => {
            let statusBadge = '';
            let borderColor = '';

            //Duruma göre metin ve renk
            if(o.status === 'Pending'){
                statusBadge = '<span style="background: #fdf2e9; color: #e67e22; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Onay Bekliyor</span>';
                borderColor = '#e67e22';
            }else if(o.status === 'Approved'){
                statusBadge = '<span style="background: #e8f8f5; color: #27ae60; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Onaylandı</span>';
                borderColor = '#27ae60';
            }else if(o.status === 'Rejected'){
                statusBadge = '<span style="background: #fdedec; color: #e74c3c; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Onaylandı</span>';
                borderColor = '#e74c3c';
            }

            return `
                <div style="background: #fff; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid ${borderColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #2c3e50;">${o.title}</h4>
                        ${statusBadge}
                    </div>
                    <p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Tutar:</strong> ${o.price} ₺</p>
                    <p style="margin: 0; font-size: 12px; color: #999;">Sipariş Tarihi: ${new Date(o.orderdate).toLocaleDateString('tr-TR')}</p>
                </div>
            `;
        }).join('');
    }catch (e){
        list.innerHTML = '<p style="color: red;">Siparişler yüklenirken hata oluştu.</p>';
    }
}

loadOrders();


async function loadUserCoupons() {
    
    const list = document.getElementById('couponsList');
    if(!list) return;
    
    try{
        const response = await fetch(`${API_BASE_URL}/coupons/user/${userId}`);
        const coupons = await response.json();

        if(coupons.length === 0){
            list.innerHTML = '<p style="color: #7f8c8d; text-align: center;">Kullanılabilir kuponunuz bulunmuyor.</p>';
            return;
        }

        list.innerHTML = coupons.map(c => {
            const isGlobal = c.ownerid === 0;

            //Kupon işlevi
            let typeText = '';
            let typeColor = '';
            if(c.coupontype === 'Artwork'){
                typeText = 'Sadece Sanat Eserlerinde Geçerli';
                typeColor = '#2980b9';
            }else{
                typeText = 'Sadece Atölye /Etkinliklerde Geçerli';
                typeColor = '#8e44ad';
            }

            return `
                <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px dashed ${typeColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="font-size: 18px; color: #2c3e50; letter-spacing: 1px;">${c.code}</strong>
                        <span style="background: ${typeColor}; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                            %${c.discountrate} İNDİRİM
                        </span>
                    </div>
                    <div style="font-size: 13px; color: ${typeColor}; font-weight: 500;">${typeText}</div>
                    <small style="color: #999; display: block; margin-top: 4px;">${isGlobal ? 'Herkese Açık Kampanya' : 'Hesabınıza Özel TAnımlı'}</small>
                </div>
            `;
        }).join('');
    }catch(e){
        list.innerHTML = '<p style="color: red;">Kuponlar yüklenirken bir hata oluştu.</p>'
    }
}

loadUserCoupons();

//Etkinlik formuna yeni satır ekleme
window.addNewSessionRow = function() {
    const list = document.getElementById('sessionFormList');
    const newItem = document.createElement('div');
    newItem.className = "sessiom-form-item";
    newItem.style = "display: flex; gap: 8px; margin-bottom: 10px; align-items: center;";
    newItem.innerHTML = `
        <input type="date" class="session-date-input" required style="flex: 2; padding: 6px; border:1px solid #ccc; border-radius:4px;">
        <input type="time" class="session-start-input" required style="flex: 1; padding: 6px; border:1px solid #ccc; border-radius:4px;">
        <input type="time" class="session-end-input" required style="flex: 1; padding: 6px; border:1px solid #ccc; border-radius:4px;">
        <input type="number" class="session-cap-input" placeholder="Kont." min="1" required style="width: 70px; padding: 6px; border:1px solid #ccc; border-radius:4px;">
        <button type="button" onclick="this.parentElement.remove()" style="background:#e74c3c; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">&times;</button>
    `;
    list.appendChild(newItem);
}

//Etkinliği kaydet butonu
document.getElementById('saveEventBtn').addEventListener('click', async () => {
    const title = document.getElementById('newEventTitle').value.trim();
    const desc = document.getElementById('newEventDesc').value.trim();
    const price = document.getElementById('newEventPrice').value.trim();
    const imageInput = document.getElementById('newEventImage');

    if(!title || !desc || !price || imageInput.files.length === 0){
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    //Seans verilerini topla
    const sessionRows = document.querySelectorAll('.session-form-item');
    const sessionsData = [];

    for (let row of sessionRows){
        const dateVal = row.querySelector('.session-date-input').value;
        const startVal = row.querySelector('.session-start-input').value;
        const endVal = row.querySelector('.session-end-input').value;
        const capVal = parseInt(row.querySelector('.session-cap-input').value);

        if(!dateVal || !startVal || !endVal || !capVal){
            alert("Lütfen eklediğiniz tüm seans bilgilerini doldurun.");
            return;
        }

        const parts = dateVal.split('-');
        const formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;

        sessionsData.push({
            sessionDate: formattedDate,
            startTime: startVal,
            endTime: endVal,
            capacity: capVal
        });
    }

    const saveBtn = document.getElementById('saveEventBtn');
    saveBtn.innerHTML = "Yayınlanıyor...";
    saveBtn.disabled = true;

    //Multipart FormData paketini hazırla
    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", desc);
    formData.append("Price",price);
    formData.append("OrganizerId", userId);
    formData.append("ImageFile", imageInput.files[0]);
    formData.append("SessionsJson", JSON.stringify(sessionsData));   //Seans dizisini metin olarak pakete koy

    try{
        const response = await fetch(`${API_BASE_URL}/events/add-event`, {
            method: 'POST',
            body: formData
        });

        if(response.ok){
            saveBtn.innerHTML = "Başarıyla Yayınlandı";
            saveBtn.style.backgroundColor = "#27ae60";

            setTimeout(() => {
                document.getElementById('addEventModal').style.display = 'none';
                window.location.reload();
            }, 2000);
        }else{
            const data = await response.json();
            alert(data.error || "Yükleme sıraında bir hata oluştu.");
            saveBtn.innerHTML = "Etkinliği Yayınla";
            saveBtn.disabled = false;
        }
    }catch (error){
        alert("Sunucuya bağlanıllamadı.");
        saveBtn.innerHTML = "Etkinliği Yayınla";
        saveBtn.disabled = false;
    }
});
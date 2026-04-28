const API_BASE_URL = 'http://localhost:5160/api';

//URL'den etkinlik ID ve saatini al
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');
const selectedTime = urlParams.get('time');

//Güvenlik ve kullanıcı kontrolü
const userId = localStorage.getItem('userId');
if(!userId){
    alert("Satın alma işlemi için giriş yapmalısınız!");
    window.location.href = 'login.html';
}

let originalPrice = 0;
let currentPrice = 0;

//Etkinlik fiyatını getir
async function loadPurchaseDetails() {
    try{
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const ev = await response.json();
        originalPrice = ev.price;
        currentPrice = ev.price;

        updateSummaryHtml();
    }catch(e){
        document.getElementById('purchaseSummary').innerHTML = "Etkinlik bilgileri yüklenemedi.";
    }
}

//Özeti güncelleyen fonksiyon
function updateSummaryHtml(discountText = ""){
    document.getElementById('purchaseSummary').innerHTML = `
        Seçilen Etkinlik ID: <strong>${eventId}</strong><br>
        Seans Saati: <strong>${selectedTime}</strong><br>
        Normal Tutar: <strong>${originalPrice}</strong><br>
        ${discountText}
        <h3 style="margin-top: 10px; color: #e74c3c;">Ödenecek Tutar: ${currentPrice} ₺</h3>
    `;
}

//Kupon uygulama mantığı
async function applyCoupon() {
    const code = document.getElementById('couponCode').value.trim();
    if(!code) return;

    try{
        const response = await fetch(`${API_BASE_URL}/coupons/${code}`);
        if(response.ok){
            const coupon = await response.json();

            //indirim hesapla
            const discountAmount = (originalPrice * coupon.discountPercentage) / 100;
            currentPrice = originalPrice - discountAmount;

            updateSummaryHtml(`<span style="color: green;">Kupon Uygulandı (%${coupon.discountPercentage} İndirim): <strong>-${discountAmount} ₺</strong></span><br>`);
            alert("Kupon başarıyla uygulandı!");
        }else{
            const data = await response.json();
            alert(data.error);
        }
    }catch(error){
        alert("Kupon doğrulanırken hata oluştu.");
    }
}

//Ödeme butonuna basıldığında
document.getElementById('purchaseForm').addEventListener('submit', async function (e) {
    e.preventDefault(); //Sayfanın yenilenmesini engelle

    try{
        //backende istek at
        const response = await fetch(`${API_BASE_URL}/events/reserve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                eventId: parseInt(eventId),
                participantCount: 1
            })
        });

        if (response.ok){
            alert(`${currentPrice} ₺ ödeme alındı ve rezervasonunuz onaylandı!`);
            //Kullanıcı biletlerini/rezervasonlarını görmesi için profil sayfasına yollayalım
            window.location.href = 'profile.html';
        }else{
            const data = await response.json();
            alert(data.error || 'Kontanjan dolmuş veya bir hata oluştu.');
        }
    }catch (error){
        alert('Sunucuya ulaşılamadı.');
    }
});

loadPurchaseDetails();
const API_BASE_URL = 'http://localhost:5160/api';

//URL'den etkinlik ID
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');
const sessionId = urlParams.get('sessionId');
const userId = localStorage.getItem('userId');

if(!userId || !eventId){
    window.location.href = 'events.html';
}


let unitPrice = 0;  //Tek bilet fiyatı
let currentTotal = 0;   //Toplam ödenecek tutar
let eventTitle = "";
let sessionInfo = "";
let sessionDate = "";
let discountPercentage = 0;    //Uygulanan kupon yüzdesi

//Etkinlik seans bilgileri
async function loadEventData() {
    try{
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        if(response.ok){
            const ev = await response.json();
            eventTitle = ev.title;
            unitPrice = ev.price;

            //Seçilen seans
            const selectedSession = ev.sessions.find(s => s.sessionId == sessionId);
            if(selectedSession){
                sessionInfo = `${selectedSession.startTime} - ${selectedSession.endTime}`;
                sessionDate = selectedSession.sessionDate;
            }else{
                sessionInfo = "Bilinmeyen Seans";
            }

            calculateTotal();   //Fiyatı hesapla ekrana bas
        }else{
            document.getElementById('purchaseSummary').innerHTML = "Etkinlik bulunamadı.";
        }
    }catch(e) { document.getElementById('purchaseSummary').innerHTML = "Bağlantı hatası." }
}

//Toplam fiyatı hesaplama ve ekrana basma
function calculateTotal(){
    const ticketCount = parseInt(document.getElementById('ticketCount').value) || 1;
    const baseTotal = unitPrice * ticketCount;

    //Varsa kupon indirimi uygula
    const discountAmount = (baseTotal * discountPercentage) / 100;
    currentTotal = baseTotal - discountAmount;

    let discountHtml = "";
    if(discountPercentage > 0){
        discountHtml = `<br><span style="color: green;">Kupon İndirimi (%${discountPercentage}): <strong>-${discountAmount} ₺</strong></span>`;

    }

    document.getElementById('purchaseSummary').innerHTML = `
        Kayıt Olunan Etkinlik: <strong>${eventTitle}</strong><br>
        Etkinlik Tarihi: <strong>${sessionDate}</strong><br>
        SeçilenSeans: <strong style="color: #3498db;">${sessionInfo}</strong><br>
        Bilet Birim Fİyatı: <strong>${unitPrice} ₺</strong>
        ${discountHtml}
        <h3 style="margin-top: 10px; color: #27ae60;">Toplam Ödenecek Tutar: ${currentTotal} ₺</h3>
        `;
}

//Kişi sayısı değiştiğinde fiyatı güncelle
document.getElementById('ticketCount').addEventListener('input', calculateTotal);

// Kupon Sistemi
async function applyCoupon() {
    const code = document.getElementById('couponCode').value.trim();
    if(!code) return;

    try{
        const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: code,
                userId: parseInt(localStorage.getItem('userId')),
                purchaseType: "Event"
            })
        });

        if(response.ok){
            const coupon = await response.json();
            discountPercentage = coupon.discount;
            calculateTotal();   //Kupon girilince fiyatı yeniden hesapla
            alert("Kupon başarıyla uygulandı!");
        }else{
            alert("Geçersiz veya süresi dolmuş kupon!");
            discountPercentage = 0;
            calculateTotal();
        }
    }catch(error){ alert("Bağlantı hatası!") ;}
}

//Ödeme yöntemi değiştirme
const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
const ccSection = document.getElementById('creditCardSection');
const eftSection = document.getElementById('eftSection');

paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if(e.target.value === 'creditCard'){
            ccSection.style.display = 'block';
            eftSection.style.display = 'none';
        }else{
            ccSection.style.display = 'none';
            eftSection.style.display = 'block';
        }
    });
});

//Ödemeyi tammla
document.getElementById('eventPurchaseForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const ticketCount = parseInt(document.getElementById('ticketCount').value) || 1;

    if(selectedMethod === 'creditCard') {
        const ccName = document.getElementById('ccName').value.trim();
        const ccNumber = document.getElementById('ccNumber').value.trim();
        if(!ccName || !ccNumber){
            alert("Lütfen kredi kartı bilgilerinizi eksiksiz giriniz.");
            return;
        }
    }else if(selectedMethod === 'eft'){
        const eftSender = document.getElementById('eftSenderName').value.trim();
        if(!eftSender){
            alert("Lütfen havale yapacak kişinin adını giriniz.");
            return;
        }
    }

    //Satın alım isteği
    try{
        const response = await fetch(`${API_BASE_URL}/events/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                eventId: parseInt(eventId),
                sessionId: parseInt(sessionId),
                ticketCount: ticketCount,
                totalPrice: currentTotal
            })
        });

        const data = await response.json();

        if(response.ok){
            alert(`${data.message}\n\n"${eventTitle}" etkinliğinin ${sessionInfo} seansına ${ticketCount} kişilik yeriniz ayırtılı.`);
            window.location.href = 'profile.html';  //Başarılıysa profile git
        }else{
            alert(`Satın alma başarısız: ${data.error}`);
        }
    }catch(error){
        alert("Satın alma işlemi sırasında sunucuyla iletişim kurulamadı.");
    }
});

loadEventData();
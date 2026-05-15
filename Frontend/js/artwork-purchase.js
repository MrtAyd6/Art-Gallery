const API_BASE_URL = 'http://localhost:5160/api';
const urlParams = new URLSearchParams(window.location.search);
const artworkId = urlParams.get('id');
const userId = localStorage.getItem('userId');

const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
const ccSection = document.getElementById('creditCardSection');
const eftSection = document.getElementById('eftSection');

if(!userId || !artworkId){
    window.location.href = 'gallery.html';
}

let originalPrice = 0;
let currentPrice = 0;
let artworkTitle = "";

//Eser bilgisini getir
async function loadArtworkData() {
    try {
        const response = await fetch(`${API_BASE_URL}/artworks`);
        const artworks = await response.json();
        const art = artworks.find(a => a.artworkId == artworkId);

        if(art){
            artworkTitle = art.title;
            originalPrice = art.price;
            currentPrice = art.price;
            updateSummaryHtml();
        }
    } catch(e) { document.getElementById('purchaseSummary').innerHTML = "Eser bulunamadı."; }
}

function updateSummaryHtml(discountText = ""){
    document.getElementById('purchaseSummary').innerHTML = `
    Satın Alınan Eser: <strong>${artworkTitle}</strong><br>
    Normal Tutar: <strong>${originalPrice} ₺</strong><br>
    ${discountText}
    <h3 style="margin-top: 10px; color: #27ae60;">Ödenecek Tutar: ${currentPrice} ₺</h3>
    `;
}

//Kupon sistemi
async function applyCoupon() {
    const code = document.getElementById('couponCode').value.trim();
    if(!code) return;

    try{
        const response = await fetch(`${API_BASE_URL}/coupons/${code}`);
        if (response.ok) {
            const coupon = await response.json();
            const discountAmount = (originalPrice * coupon.discountPercentage) / 100;
            currentPrice = originalPrice - discountAmount;
            updateSummaryHtml(`<span style="color: green;">Kupon Uygulandı (%${coupon.discountPercentage} İndirim): <strong>-${discountAmount} ₺</strong></span><br>`);
            alert("Kupon başarıyla uygulandı!");
        }else{
            alert("Geçersiz veya süresi dolmuş kupon!");
        }
    }catch (error) { alert("Bağlantı hatası!"); }
}

paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'creditCard'){
            ccSection.style.display = 'block';
            eftSection.style.display = 'none';
        }else{
            ccSection.style.display = 'none';
            eftSection.style.display = 'block';
        }
    });
});

//Ödemeyi tamamla
document.getElementById('artworkPurchaseForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const artworkId = urlParams.get('id');
    const userId = localStorage.getItem('userId');

    if(!userId){
        alert("Lütfen satın alma işlemi için önce giriş yapın.");
        return;
    }

    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    //Boş alan kalmasın
    if(selectedMethod === 'creditCard'){
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

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "İşleniyor...";
    submitBtn.disabled = true;

    try{
        const response = await fetch(`${API_BASE_URL}/artworks/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                artworkId: parseInt(artworkId),
                paymentMethod: selectedMethod
            })
        });

        const data = await response.json();

        if (response.ok){
            const methodText = selectedMethod === 'creditCart' ? "Kredi Kartı" : "Havale/EFT";

            alert(`Siparişiniz alındı!\n\n"${artworkTitle}" eseri için ${currentPrice} ₺ tutarındaki işleminiz ${methodText} yöntemiyle başarıyla kaydedildi.\n\nDurum: ${data.message}`);
            window.location.href = 'profile.html';
        }else{
            alert(data.error || "Sipariş oluşturulurken bir hata meydana geldi.");
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    }catch(error){
        alert("Sunucuya bağlanılamdı." + `${error}`);
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
});

loadArtworkData();
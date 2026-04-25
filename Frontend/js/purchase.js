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

//Sayfa açıldığında kullanıcıya bir özet gösterelim
document.getElementById('purchaseSummary').innerHTML = `
    Seçilen Etkinlik ID: <strong>${eventId}</strong><br>
    Seans Saati: <strong>${selectedTime}</strong><br>
    <em>Ödemeniz güvenli altyapı ile gerçekleştirilecektir.</em>
`;

//Ödeme butonuna basıldığında
document.getElementById('purchaseForm').addEventListener('submit', async function (e) {
    e.preventDefault(); //Sayfanın yenilenmesini engelle

    //ödeme simülasyonu
    const paymentMethod = document.getElementById('paymentMethod').value;
    console.log(`Ödeme ${paymentMethod} ile alınıyor...`);

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
            alert('Ödeme başarılı ve rezervasonunuz onaylandı!');
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
const API_BASE_URL = 'http://localhost:5160/api';
const userId = localStorage.getItem('userId');

if(!userId){
    window.location.href = 'login.html';
}

//Geçmiş talepleri yükle
async function loadTickets() {
    const list = document.getElementById('ticketsList');
    try{
        const response = await fetch(`${API_BASE_URL}/support/user/${userId}`);
        const tickets = await response.json();
        list.innerHTML = '';
        
        if(tickets.length === 0){
            list.innerHTML = '<p style="color: #7f8c8d;">Genüz bir destek talebiniz bulunmuyor.</p>';
            return;
        }
        
        tickets.forEach(t => {
            const statusColor = t.status === 'Bekliyor' ? 'orange' : 'green';
            const adminReplyHtml = t.adminReply
                ? `<div style="background-color: #f0f8ff; padding: 10px; margin-top: 10px; border-radius: 4px; font-size: 14px;"><strong>Yönetici:</strong> ${t.adminReply}</div>`
                : '';

            list.innerHTML += `
                <div style="border: 1px solid #eee; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <strong>${t.subject}</strong>
                        <span style="color: white; background-color: ${statusColor}; padding: 3px 8px; border-radius: 12px; font-size: 12px;">${t.status}</span>
                    </div>
                    <p style="color: #555; font-size: 14px;">${t.message}</p>
                    ${adminReplyHtml}
                </div>
            `;
        });
    } catch (e) { list.innerHTML = '<p>Yüklenemedi.</p>'; }
}

//Formu gönder
document.getElementById('supportForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    try{
        const response = await fetch(`${API_BASE_URL}/support`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId), subject: subject, message: message })
        });

        if(response.ok){
            alert('Talebiniz alındı!');
            document.getElementById('supportForm').requestFullscreen;
            loadTickets();  //Listeyi anında yenile
        }
    }catch (error) { alrt('Hata oluştu'); }
});

loadTickets();
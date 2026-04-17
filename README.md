#Art-Gallery-ToDo

Aşama 1: Veritabanı Analizi ve Tasarımı

- [ ] Varlıkların (Kullanıcılar, Eserler, Etkinlikler, Rezervasyonlar, Yorumlar vb.) belirlenmesi.  
- [ ] Tabloların ve ilişkilerin planlanması (ER diyagram çizim).  
- [ ] Teslim edilecek rapor için veritabanı tasarımı notlarının alınmaya başlanması.  

Aşama 2: Veritabanı Geliştirme (SQL)

- [ ] Tabloların (Primary Key, Foreign Key kısıtlamalarıyla) veritabanında oluşturulması.
- [ ] Kontenjan takibi ve istatistik güncellemeleri (otomatik düşme/artma) için Trigger'ların yazılması.
- [ ] Sistemi test edebilmek için veritabanına örnek eser, kullanıcı ve etkinlik verilerinin girilmesi.

Aşama 3: Backend ve İş Mantığı (API Katmanı)

- [ ] Kullanıcı hesabı oluşturma, giriş yapma, profil ve şifre güncelleme uç noktalarının (endpoint) yazılması.
- [ ] Atölye/etkinlik rezervasyon oluşturma, iptal etme, tarih veya katılımcı sayısı günceleme iş mantığının kurulması.
- [ ] Etkinlik veya eser satın alıma, ödeme yöntemi seçimi algoritmalarının yazılması.
- [ ] İndirim kuponu kullanma ve kampanya mantığının sisteme entegre edilmesi.
- [ ] Güvenlik kurallarının eklenmesi (Yalnızca giriş yapmış kullanıcıların yorum yapabilmesi, etkinlik yorumu için katılım şartı aranması vb.).

Aşama 4: Frontend Geliştirme (Kullanıcı Arayüzü)

- [ ] Eser detaylarının, görsellerinin ve sanatçı bilgilerinin inceleneceği katalog ekranının tasarlanaması.
- [ ] Atölye ve etkinlik listelendiği, detay sayfasıyla kontenjan ve ücret bilgilerinin sunulduğu sayfanın kodlanması.
- [ ] Kullanıcıların eserleri favorilerine ekleyip çıkarabileceği listenin yapılması.
- [ ] Müşterilerin geçmiş siparişlerini ve rezervasyon durumlarını takip edebileceği profil panelinin oluşturulması.
- [ ] Eserleri (kategori, fiyat, sanatçı) ve etkinlikleri (tarih, ücret, kontenjan) kıyaslayacak "Karşılaştırma" modülünün yapılması.
- [ ] Yorum ekleme, yorumlara "faydalı" oyu verme ve en yeni/en yüksek puanlı olarak filtreleme arayüzünün geliştirilkmesi.

Aşama 5: Yönetici (Admin) Paneli

- [ ] Galeri yöneticisin veya etkinlik sorumlusunun kullancı yorumlarına yanıt verebilceği alanın yapılması.
- [ ] İletişim formu mesajlarının ve destek taleplerinin görüntülendiği müşteri destek ekranının hazırlanması.
- [ ] Eser (beğeni, yorum) ve etkinlik (doluluk oranı, toplam rezervasyon) bazlı verilerin gösterileceği özet rapor/istatistik sayfasının yapılması.
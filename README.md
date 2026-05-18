# 🎨 Sanat Galerisi ve Atölye Yönetim Sistemi

**Sanat Galerisi ve Atölye Yönetim Sistemi**'ne hoş geldiniz! Bu proje, sanatseverleri, sanatçıları ve atölye sahiplerini aynı yaratıcı çatı altında buluşturmak için tasarlanmış kapsamlı, tam yığın (full-stack) bir web uygulamasıdır.

Benzersiz sanat eserlerini inceleyip satın almak, yaratıcı bir atölyede yer ayırtmak veya kendi sanat portföyünüzü yönetmek istiyorsanız, bu platform size kusursuz ve dinamik bir deneyim sunar.

---

## ✨ Temel Özellikler

### 🖼️ Sanatseverler İçin
- **Eserleri Keşfedin:** Detaylı bilgiler, yüksek kaliteli görseller ve sanatçı portföylerini inceleyin.
- **Akıllı Karşılaştırma:** Fiyat, kategori veya kontenjan gibi kriterlere göre birden fazla eseri veya etkinliği yan yana karşılaştırın.
- **Favoriler ve Satın Alma:** Beğendiğiniz eserleri favorilerinize ekleyin ve güvenle satın alın.
- **Dinamik Etkinlikler:** Yaklaşan sanat atölyelerini keşfedin, bilet alın ve rezervasyonlarınızı yönetin.
- **Etkileşimli Yorumlar:** Eserleri ve etkinlikleri puanlayın, topluluk yorumlarını okuyun ve faydalı bulduğunuz değerlendirmelere oy verin.
- **Kuponlar ve Kampanyalar:** Hem eserlerde hem de etkinlik biletlerinde geçerli özel indirim kodlarından ve dönemsel kampanyalardan yararlanın.

### 🖌️ Sanatçılar ve Atölye Sahipleri İçin
- **Rol Yönetimi:** Profiliniz üzerinden "Sanatçı" veya "Atölye Sahibi" rolüne geçiş yapmak için başvuru yapın.
- **Kişisel Yönetim Paneli (Dashboard):** Eserlerinizin görüntülenme sayılarını, satışlarınızı, etkinlik kontenjanlarınızı takip edin ve portföyünüzü yönetin.
- **Katılımcılarla Etkileşim:** Düzenlediğiniz atölyelere katılan kullanıcıların bıraktığı yorumları okuyun ve onlara yanıt verin.
- **Sipariş Yönetimi:** Size gelen eser satın alma taleplerini doğrudan panelinizden onaylayın veya reddedin.

### 🛡️ Yönetici (Admin) ve Sistem Yönetimi
- **Rol Onayları:** Kullanıcılardan gelen rol yükseltme (Sanatçı/Atölye Sahibi) taleplerini inceleyip onaylayın.
- **Genel İstatistikler:** Etkinlikler ve eserler için platform genelindeki istatistikleri görüntüleyin.
- **Güvenli Kimlik Doğrulama:** BCrypt şifreleme altyapısı sayesinde kullanıcı verilerinin güvende kalmasını sağlayın.
- **Müşteri Destek Sistemi:** Kullanıcıların gönderdiği destek taleplerini okuyun ve yönetici yanıtı oluşturun.

---

## 🚀 Kullanılan Teknolojiler

- **Backend (Arka Plan):** C#, .NET Core Web API
- **Veritabanı:** PostgreSQL (Yüksek performans için **Dapper** micro-ORM kullanılmıştır)
- **Frontend (Ön Yüz):** HTML5, Vanilla CSS, Vanilla JavaScript (Ağır framework'ler kullanılmamıştır, son derece hızlıdır!)
- **Güvenlik:** Parolaların güvenli bir şekilde saklanması için BCrypt.Net.

---

## ⚙️ Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Veritabanı Kurulumu
Sisteminizde **PostgreSQL**'in kurulu olduğundan emin olun.

```bash
# 1. PostgreSQL arayüzüne giriş yapın
sudo -u postgres psql

# 2. Veritabanını oluşturun
CREATE DATABASE art_gallery_db;
\q

# 3. Şema ve örnek veri dosyalarını çalıştırın
cat Database/create_tables.sql | sudo -u postgres psql -d art_gallery_db
cat Database/dummy_data.sql | sudo -u postgres psql -d art_gallery_db
```

### 2. Backend Kurulumu
`Backend` klasörüne gidin ve .NET API sunucusunu başlatın.

```bash
cd Backend
dotnet restore
dotnet build
dotnet run
```
*API sunucusu çalışmaya başlayacak ve genellikle `http://localhost:5160/api` adresinden erişilebilir olacaktır.*

### 3. Frontend Kurulumu
Ön yüz saf HTML/JS/CSS ile yazıldığı için Node.js veya npm kullanmanıza gerek yoktur! `Frontend` klasörünü herhangi bir yerel geliştirme sunucusu üzerinden yayınlamanız yeterlidir.

```bash
# Python'un yerleşik HTTP sunucusunu kullanan bir örnek:
cd Frontend
python3 -m http.server 8000
```
Daha sonra tarayıcınızdan `http://localhost:8000` adresine gidebilirsiniz.

---

## 📋 Yol Haritası ve Planlanan Özellikler
Temel işlevler oldukça sağlam olsa da, gelecekte eklenmesi planlanan bazı özellikler şunlardır:
- [ ] **Canlı Destek:** Müşteri hizmetleri için gerçek zamanlı mesajlaşma sistemi.
- [ ] **Doğrulanmış Alıcı Rozeti:** Sadece eseri gerçekten satın alan kullanıcıların yorumlarında görünecek bir etiket.
- [ ] **Eser Yorumlarına Yanıt Verme:** Sanatçıların, kendi eserlerine yapılan yorumlara yanıt verebilmesi için gerekli arayüz ve arka plan kodlaması.
- [ ] **JWT Kimlik Doğrulaması:** Korumalı API uç noktaları için token tabanlı güvenlik katmanının (Middleware) eklenmesi.

---
*Sanatseverler için ❤️ ile yapılmıştır.*
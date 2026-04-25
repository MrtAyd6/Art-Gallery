--KULLANICILAR TABLOSU
--Sisteme kayıtlı admin ve müşterileri tutar.
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,  -- SERIAL: otomatik artan tam sayı
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL, -- UNIQUE: Aynı e-posta iki kez kayıt olamaz
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) DEFAULT 'Customer' -- Varsayılan olarak herkes 'Custemer' olarak kayıt olsun
);

-- ESERLER TABLOSU
-- Galeride sergilenen/satılan sanat eserlerini tutar
CREATE TABLE Artworks (
    ArtworkID SERIAL PRIMARY KEY,
    Title VARCHAR(150) NOT NULL,
    ArtistName VARCHAR(100) NOT NULL,
    Description TEXT,   -- TEXT: VARCHAR'dan faRKLI OLARAK uzun pARAgraflar için idealdir
    ImageUrl VARCHAR(255),
    Price DECIMAL(10,2) NOT NULL,   -- DECİMAL: 10 basamklı, 2'si virgülden sonra
    Category VARCHAR(50)
);

-- ETKİNLİKLER VE ATÖLYELER TABLOSU
-- Rezervasyon yapılacak etkinlikleri barındırır
CREATE TABLE Events (
    EventID SERIAL PRIMARY KEY,
    Title VARCHAR(150) NOT NULL,
    EventDate TIMESTAMP NOT NULL,   -- TIMESTAMP: Tarih ve saati birlikte tutar
    TotalCapacity INT NOT NULL,     -- Maksimum alabileceği kişi sayısı
    CurrentCapacity INT NOT NULL,   -- Kalan boş yer (Trigger)
    Price DECIMAL(10,2) NOT NULL
);

-- REZERVASYONLAR TABLOSU
-- Kulanıcılar ve Etkinlikler arasındaki bağlantıyı kurar. (1:N ilişki)
CREATE TABLE Reservations(
    ReservationID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    EventID INT NOT NULL,
    ParticipantCount INT NOT NULL,  -- Kaç kişilik yer ayırtıldığı
    Status VARCHAR(20) DEFAULT 'Aktif',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Kaydın oluşturulduğu anı otomatik atar
    -- İlişkiler (Foreign Keys): Silinme durumunda CASCADE işlemi uygulanır
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE
);

-- FAVORİLER TABLOSU
-- Hangi kullanıcının hangi eseri beğendiğini tutar (Çoka-çok ilişki tablosu)
CREATE TABLE Favorites (
    UserID INT NOT NULL,
    ArtworkID INT NOT NULL,
    PRIMARY KEY (UserID, ArtworkID),    -- İki kolonun birleşimi PrimaryKey'dir. Aynı eser iki kez favorilenemez
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ArtworkID) REFERENCES Artworks(ArtworkID) ON DELETE CASCADE
);

-- SİPARİŞLER TABLOSU
CREATE TABLE Orders (
    OrderID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    ArtworkID INT NOT NULL,
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PaymentMethod VARCHAR(50) NOT NULL, -- Kredi kartı, havale vb.
    Status VARCHAR(50) DEFAULT 'Onaylandı',
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ArtworkID) REFERENCES Artworks(ArtworkID) ON DELETE CASCADE
);

-- YORUMLAR TABLOSU
CREATE TABLE Comments (
    CommentID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    EventID INT NULL,   -- Eğer etkinlik yorumluysa
    ArtworkID INT NULL, -- Eğer eser yorumluysa
    CommentText TEXT NOT NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),    -- 1 ile 5 yıldız arası
    UsefulCount INT DEFAULT 0, -- "Faydalı" oyu sayısı
    AdminReply TEXT NULL,   -- Yöneticiin vereceği yanıt
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (EventID) REFERENCES Events(EventID),
    FOREIGN KEY (ArtworkID) REFERENCES Artworks(ArtworkID) 
);
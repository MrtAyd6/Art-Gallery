-- KULLANICILAR TABLOSU
-- Sisteme kayıtlı admin ve müşterileri tutar.
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,  -- SERIAL: otomatik artan tam sayı
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL, -- UNIQUE: Aynı e-posta iki kez kayıt olamaz
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) DEFAULT 'Customer' -- Varsayılan olarak herkes 'Customer' olarak kayıt olsun
);

-- ESERLER TABLOSU
-- Galeride sergilenen/satılan sanat eserlerini tutar
CREATE TABLE Artworks (
    ArtworkID SERIAL PRIMARY KEY,
    Title VARCHAR(150) NOT NULL,
    ArtistName VARCHAR(100) NOT NULL,
    ArtistId INT NOT NULL,
    Description TEXT,   -- TEXT: VARCHAR'dan farklı olarak uzun paragraflar için idealdir
    ImageUrl VARCHAR(255),
    Price DECIMAL(10,2) NOT NULL,   -- DECIMAL: 10 basamaklı, 2'si virgülden sonra
    Category VARCHAR(50),
    ViewsCount INT DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'Active',
    DiscountRate INT DEFAULT 0,
    FOREIGN KEY (ArtistId) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- ETKİNLİKLER VE ATÖLYELER TABLOSU
-- Rezervasyon yapılacak etkinlikleri barındırır
CREATE TABLE Events (
    EventID SERIAL PRIMARY KEY,
    Title VARCHAR(150) NOT NULL,
    Description TEXT,
    EventDate TIMESTAMP NOT NULL,   -- TIMESTAMP: Tarih ve saati birlikte tutar
    TotalCapacity INT NOT NULL,     -- Maksimum alabileceği kişi sayısı
    CurrentCapacity INT NOT NULL,   -- Kalan boş yer
    Price DECIMAL(10,2) NOT NULL,
    OrganizerId INT NOT NULL,
    DiscountRate INT DEFAULT 0,
    FOREIGN KEY (OrganizerId) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- SEANSLAR TABLOSU
CREATE TABLE EventSessions (
    SessionId SERIAL PRIMARY KEY,
    EventId INT NOT NULL,
    SessionDate VARCHAR(20) NOT NULL,
    StartTime VARCHAR(10) NOT NULL,
    EndTime VARCHAR(10) NOT NULL,
    TotalCapacity INT NOT NULL,
    CurrentCapacity INT NOT NULL,
    FOREIGN KEY (EventId) REFERENCES Events(EventID) ON DELETE CASCADE
);

-- REZERVASYONLAR TABLOSU
-- Kullanıcılar ve Etkinlikler arasındaki bağlantıyı kurar.
CREATE TABLE Reservations(
    ReservationID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    EventID INT NOT NULL,
    SessionId INT NOT NULL,
    TicketCount INT NOT NULL,  -- Kaç kişilik yer ayırtıldığı
    TotalPrice DECIMAL(10,2) NOT NULL,
    Status VARCHAR(20) DEFAULT 'Aktif',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Kaydın oluşturulduğu anı otomatik atar
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
    FOREIGN KEY (SessionId) REFERENCES EventSessions(SessionId) ON DELETE CASCADE
);

-- FAVORİLER TABLOSU
-- Hangi kullanıcının hangi eseri beğendiğini tutar (Çoka-çok ilişki tablosu)
CREATE TABLE Favorites (
    UserID INT NOT NULL,
    ArtworkID INT NOT NULL,
    PRIMARY KEY (UserID, ArtworkID),    -- İki kolonun birleşimi PrimaryKey'dir
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
    Status VARCHAR(50) DEFAULT 'Pending',
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
    AdminReply TEXT NULL,   -- Yöneticinin vereceği yanıt
    OwnerReply TEXT NULL,   -- Atölye/Etkinlik sahibinin vereceği yanıt
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
    FOREIGN KEY (ArtworkID) REFERENCES Artworks(ArtworkID) ON DELETE CASCADE
);

-- YORUM OYLARI TABLOSU
CREATE TABLE CommentVotes (
    UserId INT NOT NULL,
    CommentId INT NOT NULL,
    PRIMARY KEY (UserId, CommentId),
    FOREIGN KEY (UserId) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CommentId) REFERENCES Comments(CommentID) ON DELETE CASCADE
);

-- KUPONLAR TABLOSU
CREATE TABLE Coupons (
    CouponID SERIAL PRIMARY KEY,
    Code VARCHAR(50) UNIQUE NOT NULL,
    DiscountRate INT NOT NULL CHECK (DiscountRate > 0 AND DiscountRate <= 100),
    OwnerId INT DEFAULT 0,
    CouponType VARCHAR(50) DEFAULT 'General',
    IsActive BOOLEAN DEFAULT TRUE
);

-- DESTEK MESAJLARI TABLOSU
CREATE TABLE SupportTickets (
    TicketID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    Subject VARCHAR(100) NOT NULL,
    Message TEXT NOT NULL,
    Status VARCHAR(20) DEFAULT 'Bekliyor',  -- Durum: Bekliyor veya Yanıtlandı
    AdminReply TEXT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- ROL TALEPLERİ TABLOSU
CREATE TABLE RoleRequests (
    RequestId SERIAL PRIMARY KEY,
    UserId INT NOT NULL,
    RequestedRole VARCHAR(50) NOT NULL,
    Message TEXT,
    Status VARCHAR(20) DEFAULT 'Pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserID) ON DELETE CASCADE
);
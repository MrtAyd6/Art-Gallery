-- KULLANICI EKLENMESİ
INSERT INTO Users (FullName, Email, PasswordHash, Role) VALUES
('Sistem Yöneticisi', 'admin@galeri.com', 'haslenmis_sifre_1', 'Admin'),
('Ahmet Yılmaz', 'ahmet@ornek.com', 'haslenmis_sifre_2', 'Customer');

-- ETKİNLİK EKLENMESİ
INSERT INTO Events (Title, Description, EventDate, TotalCapacity, CurrentCapacity, Price, OrganizerId) VALUES
('Sulu Boya Atölyesi', 'Temel sulu boya teknikleri öğreneceğiniz harika bir atölye.', '2026-05-15 14:00:00', 30, 30, 250.00, 1),
('Kil ve Seramik Şekillendirme', 'Kendi seramiğinizi yapabileceğiniz uygulamalı atölye.', '2026-05-20 10:00:00', 15, 15, 400.00, 1);

-- ESER EKLENMESİ
INSERT INTO Artworks (Title, ArtistName, ArtistId, Description, Price, Category) VALUES
('Mavi Düşler', 'Elif Karaca', 1, 'Tuval üzerine akrilik boya çalışması.', 1250.00, 'Tablo'),
('Modern Çizgiler', 'Can Mertoğlu', 1, 'Siyah beyaz minimal dijital sanat.', 600.00, 'Dijital Sanat');

-- KUPON EKLENMESİ
INSERT INTO Coupons (Code, DiscountRate, OwnerId, CouponType) VALUES ('ART2026', 20, 0, 'Artwork');

-- SEANS EKLENMESİ
INSERT INTO EventSessions (EventId, SessionDate, StartTime, EndTime, TotalCapacity, CurrentCapacity) VALUES
(1, '15.05.2026', '10:00', '12:00', 15, 15),  -- Boş seans
(1, '15.05.2026', '14:00', '16:00', 5, 3),   -- Az yer kalmış seans
(1, '15.05.2026', '18:00', '20:00', 10, 0);   -- Tamamen dolu seans
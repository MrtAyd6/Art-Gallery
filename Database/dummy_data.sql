-- KULLANICI EKLENMESİ
INSERT INTO Users (FullName, Email, PasswordHash, Role) VALUES
('Sistem Yöneticis', 'admin@galeri.com', 'haslenmis_sifre_1', 'Admin'),
('Ahmet Yılmaz', 'ahmet@ornek.com', 'haslenmis_sifre_2', 'Customer');

--ETKİNLİK EKLENMESİ
INSERT INTO Events (Title, EventDate, TotalCapacity, CurrentCapacity, Price) VALUES
('Sulu Boya Atölyesi', '2026-05-15 14:00:00', 20, 20, 250.00),
('Kil ve Seramik Şekillendirme', '2026-05-20 10:00:00', 15, 15, 400.00);

-- ESER EKLENMESİ
INSERT INTO Artworks (Title, ArtistName, Description, Price, Category) VALUES
('Mavi Düşler', 'Elif Karaca', 'Tuval üzerine akrilik boya çalışması.', 1250.00, 'Tablo'),
('Modern Çizgiler', 'Can Mertoğlu', 'Siyah beyaz minimal dijital sanat.', 600.00, 'Dijital Sanat');
-- KONTENJAN GÜNCELLEME FONKSİYONU
-- Yenirezervasyon geldiğinde çalışacak olan mantık bloku
CREATE OR REPLACE FUNCTION decrease_event_capacity()
RETURNS TRIGGER AS $$
BEGIN
    -- 'NEW', tabloya yeni eklenen satırı temsil eder
    -- Etkinliğin mevcut kapasitesinden, yen, rezervasyondaki katılımcı sayısını çıkarıyoruz
    UPDATE Events
    SET CurrentCapacity = CurrentCapacity - NEW.ParticipantCount
    WHERE EventID = NEW.EventID;

    -- EĞER KAPASİTE YETERSİZSE İŞLEMİ İPTAL ET
    IF ( SELECT CurrentCapacity FROM Events WHERE EventID = NEW.EventID) < 0 THEN
        RAISE EXCEPTION 'Bu etkinlik için yeterli kontenjan bulunmamaktadır!';
    END IF;

    RETURN NEW; -- İşlemi onayla ve davam et
END;
$$ LANGUAGE plpgsql;


-- FONKSİYONU ÇALIŞTIRACAK TETİKLEYİCİ (TRIGGER)
-- Reservations tablosuna her 'INSERT' işlemi yapıldığında fonksiyonu tetikle
CREATE TRIGGER trg_decrease_capasity
AFTER INSERT ON Reservations
FOR EACH ROW    -- Eklenen her bir satır için ayrı ayrı çalıştır
EXECUTE FUNCTION decrease_event_capacity();


-- KONTENJAN ARTTIRMA FONKSİYONU
-- Rezervasyon iptal olduunda çalışacak mantık bloku
CREATE OR REPLACE FUNCTION restore_event_capacity()
RETURNS TRIGGER AS \$\$
BEGIN
    --Rezervasyon silindiğinde (OLD), o kişinin tuttuğu kontenjanı geri veriyoruz
    UPDATE Events
    SET CurrentCapacity = CurrentCapacity + OLD.ParticipantCount
    WHERE EventID = OLD.EventID;

    RETURN OLD;
END;
\$\$ LANGUAGE plpgsql;

-- FONKSİYONU TETİKLEYECEK TRIGGER
CREATE TRIGGER after_reservation_delete
AFTER DELETE ON Reservations
FOR EACH ROW
EXECUTE FUNCTION restore_event_capacity();
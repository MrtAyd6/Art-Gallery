using Backend.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly string _connectionString;

        public EventsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        //GET: api/events
        //Tüm etkinlikleri ve güncel kontenjanlar listeler
        [HttpGet]
        public async Task<IActionResult> GetAllEvents()
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "SELECT * FROM Events ORDER BY EventDate ASC;";
                var events = await connection.QueryAsync<Event>(sql);
                return Ok(events);
            }
        }

        //GET: api/events/1
        //Belirli etkinlik bilgilerini getirir
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventById(int id)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Etkinlik bilgilerini al
                var eventQuery = "SELECT * FROM Events WHERE EventId = @Id";
                var ev = await connection.QueryFirstOrDefaultAsync<Event>(eventQuery, new { Id = id });

                if(ev == null) return NotFound("Etkinlik bulunamadı.");

                //Etkinliğe ait seansları al
                var sessionsQuery = "SELECT * FROM EventSessions WHERE EventId = @Id ORDER BY StartTime";
                var sessions = await connection.QueryAsync<EventSession>(sessionsQuery, new { Id = id });

                ev.Sessions = sessions.ToList();

                return Ok(ev);
            }
        }

        
        //GET: api/events/reservations/user/1
        //Kullanıcının rezervasyonlarını listeler
        [HttpGet("reservations/user/{userId}")]
        public async Task<IActionResult> getUserReservations(int userID)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = @"
                    SELECT 
                        r.ReservationId,
                        r.TicketCount,
                        r.TotalPrice,
                        r.EventId,
                        es.SessionDate,
                        e.Title AS EventTitle,
                        es.StartTime || ' - ' || es.EndTime AS SessionInfo
                    FROM Events e
                    JOIN Reservations r ON e.EventID = r.EventID
                    JOIN EventSessions es ON r.SessionId = es.SessionId
                    WHERE r.UserID = @UserId;";

                var events = await connection.QueryAsync<Reservation>(sql, new { UserId = userID });

                return Ok(events);
            }
        }
        
        //POST: api/events/purchase
        //Yeni bir rezervayon oluşturur
        [HttpPost("purchase")]
        public async Task<IActionResult> PurchaseTicket([FromBody] PurchaseRequest request)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                //Transaction başlatıyoruz (Ya hep ya hiç)
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        //O anki kontanjanı kontrol et
                        var sessionQuery = "SELECT CurrentCapacity FROM EventSessions WHERE SessionId = @SessionId FOR UPDATE";
                        var capacity = await connection.ExecuteScalarAsync<int>(sessionQuery, new { SessionId = request.SessionId });

                        if(capacity < request.TicketCount)
                        {
                            return BadRequest(new { error = $"Üzgünüz, bu seans için sadece {capacity} kişlik yer kaldı." });
                        }

                        //KOntenjanı düşür
                        var updateCapacity = "UPDATE EventSessions SET CurrentCapacity = CurrentCapacity - @TicketCount WHERE SessionId = @SessionId";
                        await connection.ExecuteAsync(updateCapacity, new { TicketCount = request.TicketCount, SessionId = request.SessionId });

                        //Rezervasyonu Kaydet
                        var insertReservation = @"
                            INSERT INTO Reservations (UserId, EventId, SessionId, TicketCount, TotalPrice, CreatedAt)
                            VALUES (@UserId, @EventId, @SessionId, @TicketCount, @TotalPrice, CURRENT_TIMESTAMP)";

                        await connection.ExecuteAsync(insertReservation, request);

                        //Her şey başarılıysa işlemleri onayla
                        await transaction.CommitAsync();
                        return Ok(new { message = "Bilet başarıyla satın alındı!" });
                    }
                    catch (Exception ex)
                    {
                        //Hata olursa hiçbir şeyi kaydetme
                        await transaction.RollbackAsync();
                        return BadRequest(new { error = "Satın alma sırasında bir veritabanı hatası oluştu." + ex.Message });
                    }
                }
            }
        }

        //DELETE: api/events/reservation/1
        //Bir rezervasyonu iptal eder 
        [HttpDelete("reservation/{reservationId}")]
        public async Task<IActionResult> CancelReservation(int reservationId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        //Rezervasyon bilgilerini al
                        var resQuery = "SELECT SessionId, TicketCount FROM Reservations WHERE ReservationId = @Id";
                        var res = await connection.QueryFirstOrDefaultAsync<Reservation>(resQuery, new { Id = reservationId });
                        if (res == null) return NotFound("Rezervasyon bulunamadı.");

                        //İptal edilen biletleri seansın kontenjanına ekle
                        await connection.ExecuteAsync("UPDATE EventSessions SET CurrentCapacity = CurrentCapacity + @Tickets WHERE SessionId = @SessionId",
                            new { Tickets = res.TicketCount, SessionId = res.SessionId });

                        //rezervasyonu veritabanından sil
                        await connection.ExecuteAsync("DELETE FROM Reservations WHERE ReservationId = @Id", new { Id = reservationId });

                        await transaction.CommitAsync();
                        return Ok(new { message = "Rezervsyounuz başarıyla iptal edildi. "});
                    }catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { error = "İptal sırasında bir hata oluştu: " + ex.Message });
                    }
                }
            }
        }

        //PUT: api/events/reservation/1
        //Rezervasyon güncelleme
        [HttpPut("reservation/{reservationId}")]
        public async Task<IActionResult> UpdateReservation(int reservationId, [FromBody] UpdateReservationRequest request)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        //Eski rezervasyonu bul
                        var oldRes = await connection.QueryFirstOrDefaultAsync<Reservation>("SELECT SessionId, TicketCount FROM Reservations WHERE ReservationId = @Id", new { Id = reservationId });
                        if(oldRes == null) return NotFound("Rezervasyon bulunamadı.");

                        //Eski seansın kontenjanını geri iade et
                        await connection.ExecuteAsync("UPDATE EventSessions SET CurrentCapacity = CurrentCapacity + @Tickets WHERE SessionId = @SessionId",
                            new { Tickets = oldRes.TicketCount, SessionId = oldRes.SessionId });

                        //Yeni seansın kontenjanını kontrol et
                        var newCap = await connection.ExecuteScalarAsync<int>("SELECT CurrentCapacity FROM EventSessions WHERE SessionId = @SessionId FOR UPDATE", new { SessionId = request.SessionId });
                        if (newCap < request.TicketCount) throw new Exception("Seçtiğiniz seans için yeterli kontenjan bulunmuyor.");

                        //Yeni seansın kontenjanından biletleri düş
                        await connection.ExecuteAsync("UPDATE EventSessions SET CurrentCapacity = CurrentCapacity - @Tickets WHERE SessionId = @SessionId",
                            new { Tickets = request.TicketCount, SessionId = request.SessionId });

                        //Rezervasyon kaydını güncelle
                        var updateQuery = "UPDATE Reservations SET SessionId = @SessionId, TicketCount = @TicketCount, TotalPrice = @TotalPrice WHERE ReservationId = @Id";
                        await connection.ExecuteAsync(updateQuery, new { SessionId = request.SessionId, TicketCount = request.TicketCount, TotalPrice = request.TotalPrice, Id = reservationId });

                        await transaction.CommitAsync();
                        return Ok(new { message = "Rezervasyon başarıyla güncellendi." });
                    }catch(Exception ex)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { error = ex.Message });
                    }
                }
            }
        }
    
        //GET: api/events/workshop/{organizerId}/dashboard
        //Atölye sahibi istatistik paneli
        [HttpGet("workshop/{organizerId}/dashboard")]
        public async Task<IActionResult> GetWorkshopDashboard(int organizerId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Kendi etkinlikleri ve seansların durumu
                var eventsSql = @"
                    SELECT e.EventId, e.Title, e.Price,
                    (SELECT COUNT(*) FROM EventSessions s WHERE s.EventId = e.EventId) as TotalSessions,
                    (SELECT SUM(CurrentCapacity) FROM EventSessions s WHERE s.EventId = e.EventId) as TotalRemainingCapacity
                    FROM Events e WHERE e.OrganizerId = @OrganizerId";

                //Kendi etkinliklerine yapılmış yorumlar
                var commentsSql = @"
                    SELECT c.CommentId, u.FullName as UserName, e.Title as EventTitle, c.Rating, c.CommentText, c.OwnerReply, c.CreatedAt
                    FROM Comments c
                    JOIN Events e ON c.EventId = e.EventId
                    JOIN Users u ON c.UserId = u.UserId
                    WHERE e.OrganizerId = @OrganizerId
                    ORDER BY c.CreatedAt DESC";

                var events = await connection.QueryAsync<dynamic>(eventsSql, new { OrganizerId = organizerId });
                var comments = await connection.QueryAsync<dynamic>(commentsSql, new { OrganizerId = organizerId });

                return Ok(new { events, comments });
            }
        }

        //POST: api/events/comments/{commentId}/reply
        //Atölye sahibi yotum yanıtı
        [HttpPost("comments/{commentId}/reply")]
        public async Task<IActionResult> ReplyToComment(int commentId, [FromBody] CommentReplyDto data)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "UPDATE Comments SET OwnerReply = @Reply WHERE CommentId = @Id";
                await connection.ExecuteAsync(sql, new { Reply = data.ReplyText, Id = commentId });
                return Ok(new { message = "Yanıtınız başarıyla eklendi." });
            }
        }
    }
}


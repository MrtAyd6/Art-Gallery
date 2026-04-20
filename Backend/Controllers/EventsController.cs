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

        //POST: api/events/reserve
        //Yeni bir rezervayon oluşturur ve Trigger'ı tetikler
        [HttpPost("reserve")]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationRequest request)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Dapper ile SQL Injection' karşı parametrik sorgu kullanıyoruz
                var sql = @"
                    INSERT INTO Reservations (UserID, EventID, ParticipantCount)
                    VALUES (@UserId, @EventId, @ParticipantCount)
                    RETURNING ReservationID;";

                try
                {
                    //ExecuteScalar, INSERT işleminden sonra dönen ReservationID'yi almamızı sağlar
                    var newReservationId = await connection.ExecuteScalarAsync<int>(sql, request);

                    return Ok(new
                    {
                        Message = "Rezervasyon başarıyla oluşturuldu!",
                        ReservationId = newReservationId
                    });
                }
                catch(PostgresException ex)
                {
                    //Eğer Trigger "Yetersiz kontenjan" hatası fırlatırsa, bunu yakalyuıp kullanıcıya gösterir
                    return BadRequest(new { Error = ex.MessageText });
                }
            }
        }

        //DELETE: api/events/reservation/1
        //Bir rezervasyonu iptal eder ve Trigger sayesinde kontenjanı otomatik geri yükler
        [HttpDelete("reservation/{reservationId}")]
        public async Task<IActionResult> CancelReservation(int reservationId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Sadece DELETE atıyoruz, geri kalan tüm matematiksel hesapları PostgreSQL Trigger'ı yapıyor
                var sql = "DELETE FROM Reservations WHERE ReservationID = @ReservationId;";

                var rowsAffected = await connection.ExecuteAsync(sql, new { ReservationId = reservationId });

                if(rowsAffected > 0)
                {
                    return Ok(new { Message = "Rezervasyon başarıyla iptal edildi ve kontenjan geri yüklendi! "});
                }

                return NotFound(new { Error = "Böyle bir rezervasyon bulunamadı." });
            }
        }
    }
}
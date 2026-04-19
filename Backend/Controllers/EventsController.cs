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
    }
}
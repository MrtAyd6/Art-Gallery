using Backend.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost;Database=art_gallery_db;Username=postgres;Password=7350";

        //GET: api/comments/event/1
        //Bir etkinliğin yorumlarunu getir
        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetEventComments(int eventId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Yorumlaru ve yorumu yapan kullanıcının adını birleştir
                var sql = @"
                    SELECT c.*, u.FullName as UserName
                    FROM Comments c
                    JOIN Users u ON c.UserId = u.UserId
                    WHERE c.EventID = @EventId
                    ORDER BY c.CreatedAt DESC";

                var comments = await connection.QueryAsync<Comment>(sql, new { EventId = eventId});
                return Ok(comments);
            }
        }

        //POST: api/comments
        //Yeni yorum ekle
        [HttpPost]
        public async Task<IActionResult> AddComment([FromBody] Comment comment)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Kullanıcı bu etkinliğe bilet almış mı?
                if (comment.EventId != null)
                {
                    var checkSql = "SELECT COUNT(1) FROM Reservations WHERE UserId = @UserId AND EventId = @EventId";
                    var hasAttended = await connection.ExecuteScalarAsync<int>(checkSql, new { UserId = comment.UserId, EventId = comment.EventId });

                    if(hasAttended == 0)
                    {
                        return BadRequest(new { error = "Sistem uyarısı: Bu etkinliğe yorum yapabşlmek için etkinliğe kayıt olmuş olmanız gerekmektedir!"});
                    }
                }

                //kontrolden geçtiyse veritabanına ekle
                var insertSql = @"
                    INSERT INTO Comments (UserId, EventId, ArtworkId, CommentText, Rating)
                    VALUES (@UserId, @EventId, @ArtworkId, @CommentText, @Rating)";
                
                var result = await connection.ExecuteAsync(insertSql, comment);

                if (result > 0 ) return Ok(new { message = "Yorumunuz başarıyla eklendi!"});

                return BadRequest(new { error = "Yorum eklenirken bir ahata oluştu." });
            }
        }
    

        //Yoruma "faydalı buldum" oyu ver
        [HttpPut("{commentId}/useful")]
        public async Task<IActionResult> MarkAsUseful(int commentId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "UPDATE Comments SET UsefulCount = UsefulCount + 1 WHERE CommentId = @Id";
                var result = await connection.ExecuteAsync(sql, new { Id = commentId });

                if(result > 0) return Ok(new { message = "Oy kaydedildi."});

                return BadRequest(new { error = "İşlem başarısız." });
            }
        }
    }
}
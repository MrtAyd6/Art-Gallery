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

        //POST: api/comments/event
        //Yeni yorum ekle
        [HttpPost("event")]
        public async Task<IActionResult> AddEventComment([FromBody] Comment comment)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Kullanıcı bu etkinliğe bilet almış mı?
                var checkSql = "SELECT COUNT(1) FROM Reservations WHERE UserId = @UserId AND EventId = @EventId";
                var hasAttended = await connection.ExecuteScalarAsync<int>(checkSql, new { UserId = comment.UserId, EventId = comment.EventId });

                if(hasAttended == 0)
                {
                    return BadRequest(new { error = "Sistem uyarısı: Bu etkinliğe yorum yapabilmeniz için etkinliğe kayıt olmuş olmanız gerekmektedir!" });
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

        //GET: api/comments/artwork/1
        //Eser yorumlarını getir
        [HttpGet("artwork/{artworkId}")]
        public async Task<IActionResult> GetArtworkComments(int artworkId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = @"
                    SELECT c.*, u.FullName as UserName
                    FROM Comments c
                    JOIN Users u ON c.UserId = u.UserId
                    WHERE c.ArtworkId = @ArtworkId
                    ORDER BY c.CreatedAt DESC";

                var comments = await connection.QueryAsync<Comment>(sql, new { ArtworkId = artworkId });
                return Ok(comments);
            }
        }

        //POST: api/comments/artwork
        //Eser yorumu ekle
        [HttpPost("artwork")]
        public async Task<IActionResult> AddArtworkComment([FromBody] Comment comment)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var insertSql = @"
                    INSERT INTO Comments (UserId, ArtworkId, CommentText, Rating)
                    VALUES (@UserId, @ArtworkId, @CommentText, @Rating)";

                var result = await connection.ExecuteAsync(insertSql, comment);
                if(result > 0) return Ok(new { message = "Eser yorumunuz başarıyla eklendi!" });

                return BadRequest(new { error = "Yorum eklenirken bir hata oluştu." });
            }
        }


        //Yoruma "faydalı buldum" oyu ver
        [HttpPost("{commentId}/useful")]
        public async Task<IActionResult> ToggleUseful(int commentId, [FromBody] VoteRequest requset)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Kullanıcı bu yoruma daha önce oy vermiş mi?
                var checkSql = "SELECT COUNT(1) FROM CommentVotes WHERE UserId = @UserId AND CommentId = @CommentId";
                var hasVoted = await connection.ExecuteScalarAsync<int>(checkSql, new { UserId = requset.UserId, CommentId = commentId });
                
                if(hasVoted > 0)
                {
                    //Eğer oy vermişse oyu tablodan sil ve sayacı 1 azalt
                    await connection.ExecuteAsync("DELETE FROM CommentVotes WHERE UserId = @UserId AND CommentId = @CommentId", new { UserId = requset.UserId, CommentId = commentId });
                    await connection.ExecuteAsync("UPDATE Comments SET UsefulCount = UsefulCount - 1 WHERE CommentId = @Id", new { Id = commentId });

                    return Ok(new { message = "Oy geri alındı." });
                }
                else
                {
                    //Eğer ilk defa oy veriyorsa tabloya kaydet ve sayacı bir arttır
                    await connection.ExecuteAsync("INSERT INTO CommentVotes (UserId, CommentId) VALUES (@UserId, @CommentId)", new { UserId = requset.UserId, CommentId = commentId });
                    await connection.ExecuteAsync("UPDATE Comments SET UsefulCount = UsefulCount + 1 WHERE CommentId = @Id", new { Id = commentId });

                    return Ok(new { message = "Oy başarıyla eklendi."} );
                }
                
            }
        }
    }
}
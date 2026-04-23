
using Backend.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesController : ControllerBase
    {
        private readonly string _connectionString;

        public FavoritesController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        //POST: api/favorites
        //Kullanıcının bir eseri favorilerine eklemesini sağlar
        [HttpPost]
        public async Task<IActionResult> AddToFavorites([FromBody] FavoriteRequest request)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "INSERT INTO Favorites (UserID, ArtworkID) VALUES (@UserId, @ArtworkId);";
                try
                {
                    await connection.ExecuteAsync(sql, request);
                    return Ok(new { Message = "Eser favorilere başarıyla eklendi!" });
                }
                catch (PostgresException ex) when (ex.SqlState == "23505") //23505: Unique Violation (tekrarlayan kayıt)
                {
                    return BadRequest(new { Error = "Bu eser zaten favorilerde bulunuyor." });
                }
            }
        }

        //DELETE: api/favorites/user/2/artwork/1
        //Kullanıcının bir eseri favorilerinden çıkarmasını sağlar
        [HttpDelete("user/{userId}/artwork/{artworkId}")]
        public async Task<IActionResult> RemoveFromFavorites(int userId, int artworkId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "DELETE FROM Favorites WHERE UserID = @UserId AND ArtworkID = @ArtworkId;";
                var rowsAffected = await connection.ExecuteAsync(sql, new { UserId = userId, ArtworkId = artworkId});

                if(rowsAffected > 0)
                    return Ok(new { Message = "Eser favorilerden çıkarıldı."});

                return NotFound(new { Error = "Favori kaydı bulunamadı." });
            }
        }

        //GET: api/favorites/user/2
        //KUllanıcının favorilediği tüm eserleri detaylarıyla listeler
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserFavorites(int userId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Favoriler tablosuyla Eserler tablosunu birleştirip eser detaylarını çekiyoruz (JOIN)
                var sql = @"
                    SELECT a.* FROM Favorites f
                    INNER JOIN Artworks a ON f.ArtworkID = a.ArtworkID
                    WHERE f.UserID = @UserId;";

                var favorites = await connection.QueryAsync<Artwork>(sql, new { UserId = userId });
                return Ok(favorites);
            }
        }
    }
}
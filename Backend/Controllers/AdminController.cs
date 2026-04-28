using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost;Database=art_gallery_db;Username=postgres;Password=7350";

        //GET: api/admin/stats/events
        //Etkinlik istatistikleri raporu
        [HttpGet("stats/events")]
        public async Task<IActionResult> GetEventStats()
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Etkinliklleri yorumlarla birleştirip ortalama puanı hesapla
                var sql = @"
                    SELECT
                        e.EventId,
                        e.Title,
                        e.TotalCapacity,
                        e.CurrentCapacity,
                        (e.TotalCapacity - e.CurrentCapacity) AS TotalReservations,
                        COALESCE(ROUND(AVG(c.Rating), 1), 0) AS AverageRating
                    FROM Events e
                    LEFT JOIN Comments c ON e.EventId = c.EventId
                    GROUP BY e.EventId, e.Title, e.TotalCapacity, e.CurrentCapacity
                    ORDER BY TotalReservations DESC";

                var stats = await connection.QueryAsync(sql);
                return Ok(stats);     
            }
        }

        //GET: api/admin/stats/artworks
        //Eser istatistik raporu
        [HttpGet("stats/artworks")]
        public async Task<IActionResult> GetArtworkStats()
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Eserleri favoriler ve yorumlar tablosuyla eşleştirip sayılarını alıyoruz
                var sql = @"
                    SELECT
                        a.ArtworkID,
                        a.Title,
                        COALESCE(a.ViewsCount, 0) AS ViewsCount,
                        (SELECT COUNT(*) FROM Favorites f WHERE f.ArtworkId = a.ArtworkId) AS FavoriteCount,
                        (SELECT COUNT(*) FROM Comments c WHERE c.ArtworkId = a.ArtworkId) AS CommentCount
                    FROM Artworks a
                    ORDER BY ViewsCount DESC";
                
                var stats = await connection.QueryAsync(sql);
                return Ok(stats);
            }
        }
    }
}
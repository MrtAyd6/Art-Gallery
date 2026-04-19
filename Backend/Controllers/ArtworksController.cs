

using Backend.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtworksController : ControllerBase
    {
        private readonly string _connectionString;

        //Dependency Injection ile appsetting'deki bağlantı cümlemizi alıyoruz
        public ArtworksController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        //GET: api/artworks
        [HttpGet]
        public async Task<IActionResult> GetAllArtworks()
        {
            //PostgreSQL bağlantısı başlatıyoruz
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "SELECT * FROM Artworks;";

                //Dapper'ın QueryAsync metodu SQL sonucunu doğrudan Artwork listesine çevirir
                var artworks = await connection.QueryAsync<Artwork>(sql);

                return Ok(artworks);    //HTTP 200 başarılı yanıtı ile verileri dönüyoruz
            }
        }
    }
}
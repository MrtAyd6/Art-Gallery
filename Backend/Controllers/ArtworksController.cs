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
        //Eserleri listeler
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
    
        //POST: api/artworks/add-artwork
        //Yeni eser ekleme
        [HttpPost("add-artwork")]
        public async Task<IActionResult> AddArtwork([FromForm] AddArtworkDto request)
        {
            if(request.ImageFile == null || request.ImageFile.Length == 0)
                return BadRequest(new { error = "Lütfen bir eser fotoğrafı yükleyin." });

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                //Veritbanına kaydet ve oluşan ArtworkIdyi geri al
                var sql = @"
                    INSERT INTO Artworks (Title, Category, Description, Price, ArtistId, ArtistName)
                    VALUES (@Title, @Category, @Description, @Price, @ArtistId, @ArtistName)
                    RETURNING ArtworkId;";

                var newArtworkId = await connection.ExecuteScalarAsync<int>(sql, new { 
                    Title = request.Title,
                    Category = request.Category,
                    Description = request.Description,
                    Price = request.Price, 
                    ArtistId = request.ArtistId ,
                    ArtistName = request.ArtistName
                });

                //Fotoğrafı frontend klasörüne {id}.jpg olarak kaydet
                //bir üst dizine çıkıp frontend klasörüne gir
                var frontendImagesPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "Frontend", "Images", "artworks");

                //Klasör yoksa oluştur
                if(!Directory.Exists(frontendImagesPath))
                    Directory.CreateDirectory(frontendImagesPath);

                //Dosya adını oluştur (1.jpg)
                var filePath = Path.Combine(frontendImagesPath, $"{newArtworkId}.jpg");

                //Dosyayı diske yaz
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.ImageFile.CopyToAsync(stream);
                }

                return Ok(new { message = "Eser başarıyla yüklendi!", artworkId = newArtworkId });
            }
        }
    
        //POST: api/artworks/1/increment-view
        //Görüntülenme sayısını arttır
        [HttpPost("{id}/increment-view")]
        public async Task<IActionResult> IncrementView(int id)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "UPDATE Artworks SET ViewsCount = ViewsCount + 1 WHERE ArtworkId = @Id";
                await connection.ExecuteAsync(sql, new { Id = id });
                return Ok();
            }
        }
    
        //GET: api/artworks/artist/1/dashboard
        //Sanatçının eserlerini getir
        [HttpGet("artist/{artistId}/dashboard")]
        public async Task<IActionResult> GetArtistDashboard(int artistId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Eserlerin istatistikleri
                var artworksSql = @"
                    SELECT a.*,
                    (SELECT COUNT(*) FROM Comments c WHERE c.ArtworkId = a.ArtworkId) as CommentCount
                    FROM Artworks a WHERE a.ArtistId = @ArtistId";

                //Bu sanatçının eserlerine gelen siparişler
                var ordersSql = @"
                    SELECT o.*, a.Title as ArtworkTitle, u.FullName as BuyerName, u.Email as BuyerEmail
                    FROM Orders o
                    JOIN Artworks a ON o.ArtworkId = a.ArtworkId
                    JOIN Users u ON o.UserId = u.UserId
                    WHERE a.ArtistId = @ArtistId
                    ORDER BY o.OrderDate DESC";

                var artworks = await connection.QueryAsync<dynamic>(artworksSql, new { ArtistId = artistId });
                var orders = await connection.QueryAsync<dynamic>(ordersSql, new { ArtistId = artistId });

                return Ok(new { artworks, orders });
            }
        }

        //POST: api/artworks/orders/1/process
        //Sipariş onay red
        [HttpPost("orders/{orderId}/process")]
        public async Task<IActionResult> ProcessOrder(int orderId, [FromBody] ProcessOrderDto data)
        {
            string decision = data.Decision;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var trans = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        //Siparişi güncelle
                        await connection.ExecuteAsync("UPDATE Orders SET Status = @Status WHERE OrderId = @Id", new { Status = decision, Id = orderId });

                        //Eğer onaylandıysa 'sold' yap
                        if(decision == "Approved")
                        {
                            var artworkId = await connection.ExecuteScalarAsync<int>("SELECT ArtworkId FROM Orders WHERE OrderId = @Id", new { Id = orderId });
                            await connection.ExecuteAsync("UPDATE Artworks SET Status = 'Sold' WHERE ArtworkId = @Id", new { Id = artworkId });
                        }

                        await trans.CommitAsync();
                        return Ok(new { message = "İşlem başarıyla tamamlandı." });
                    }catch (Exception ex) {await trans.RollbackAsync(); return BadRequest(ex.Message); }
                }
            }
        }
    
        //GET: api/artworks/user/orders
        //Müşterinin siparişlerini getir
        [HttpGet("user/{userId}/orders")]
        public async Task<IActionResult> GetUserOrders(int userId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = @"
                    SELECT o.OrderId, o.OrderDate, o.Status, a.Title, a.Price, a.ArtworkId
                    FROM Orders o
                    JOIN Artworks a ON o.ArtworkId = a.ArtworkId
                    WHERE o.UserId = @UserId
                    ORDER BY o.OrderDate DESC";

                var orders = await connection.QueryAsync<dynamic>(sql, new { UserId = userId });
                return Ok(orders);
            }
        }
    
        //POST: api/artworks/purchase
        //Eser satın alma
        [HttpPost("purchase")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto request)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                //Eserin durumunu kontrol et
                var status = await connection.QueryFirstOrDefaultAsync<string>(
                    "SELECT Status FROM Artworks WHERE ArtworkId = @ArtworkId",
                    new { request.ArtworkId }
                );

                if(status == "Sold")
                {
                    return BadRequest(new { error = "Üzgünüz, bu eser az önce başkası tarafından satın alındı!" });
                }
                
                //Siparişi 'ORders tablosuna 'pending' olarak ekle
                var sql = @"
                    INSERT INTO Orders (UserId, ArtworkId, OrderDate, PaymentMethod, Status)
                    VALUES (@UserId, @ArtworkId, CURRENT_TIMESTAMP, @PaymentMethod, 'Pending')";

                await connection.ExecuteAsync(sql, request);

                return Ok(new { message = "Siparişiniz başarıyla alındı ve sanatçı onayına sunulldu!" });
            }
        }
    }
}
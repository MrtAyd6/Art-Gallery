
using Backend.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly string _connectionString;

        public OrdersController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        //POST: api/orders/purchase
        //Yeni bir eser satın alma işlemi gerçekleştirir
        [HttpPost("purchase")]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequest request)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Satın alınan eseri siparişler tablosuna ekliyoruz
                var sql = @"
                    INSERT INTO Orders (UserID, ArtworkID, PaymentMethod)
                    VALUES (@UserId, @ArtworkId, @PaymentMethod)
                    RETURNING OrderID;";

                try
                {
                    var newOrderId = await connection.ExecuteScalarAsync<int>(sql, request);

                    return Ok(new
                    {
                        Message = "Satın alma işlemi başarıyla gerçekleşti!",
                        OrderId = newOrderId
                    });
                }
                catch(Exception ex)
                {
                    return StatusCode(500, new { Error = "Sipariş oluşturulurken bir hata meydana geldi.", Details = ex.Message});
                }
            }
        }

        //GET: api/order/user/2
        //Belirli bir kullanıcının geçmiş siparişlerini getirir
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserOrders(int userId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //INNER JOIN kullanarak kullanıcının aldığı eserlerin detaylarını da çekiyoruz
                var sql = @"
                    SELECT o.OrderID, o.OrderDate, o.PaymentMethod, o.Status,
                           a.Title AS ArtworkTitle, a.Price
                    FROM Orders o
                    INNER JOIN Artworks a ON o.ArtworkID = a.ArtworkID
                    WHERE o.UserID = @UserId
                    ORDER BY o.OrderDate DESC;";

                var orders = await connection.QueryAsync(sql, new { UserId = userId});
                return Ok(orders);
            }
        }
    }
}
using Backend.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CouponsController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost;Database=art_gallery_db;Username=postgres;Password=7350";

        [HttpGet("{code}")]
        public async Task<IActionResult> CheckCoupon(string code)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "SELECT * FROM Coupons WHERE Code = @Code AND IsActive = TRUE";
                var coupon = await connection.QueryFirstOrDefaultAsync<Coupon>(sql, new { Code = code.ToUpper() });

                if(coupon == null)
                    return BadRequest(new { error = "Geçersiz veya süresi dolmuş kupon kodu!" });

                return Ok(coupon);
            }
        }
    }
}
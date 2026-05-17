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

        //GET: api/coupons/user/1
        //Kullanılabilecek kuonları listele
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserCoupons(int userId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "SELECT * FROM Coupons WHERE OwnerId = 0 OR OwnerId = @UserId";
                var coupons = await connection.QueryAsync<dynamic>(sql, new { UserId = userId });
                return Ok(coupons);
            }
        }

        //POST: api/coupons/admin/add
        //Yeni kupon ekle
        [HttpPost("admin/add")]
        public async Task<IActionResult> AddCoupon([FromBody] CreateCouponDto dto)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "INSERT INTO Coupons (Code, DiscountRate, OwnerId, CouponType) VALUES (@Code, @DiscountRate, @OwnerId, @CouponType)";
                await connection.ExecuteAsync(sql, dto);
                return Ok(new { message = "Kupon başarıyla oluşturuldu!" });
            }
        }

        //POST: api/coupons/validate
        //Kuponu doğrula
        [HttpPost("validate")]
        public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponDto dto)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "SELECT * FROM Coupons WHERE UPPER(Code) = UPPER(@Code)";
                var coupon = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { Code = dto.Code });

                if(coupon == null)
                    return NotFound(new { error = "Geçersiz kupon kodu!" });

                //Kişiye özel kontrolü
                if(coupon.ownerid != 0 && coupon.ownerid != dto.UserId)
                    return BadRequest(new { error = "Bu kupon kodu hesabınıza tanımlı değil!" });

                //Tür kontrolü
                if(coupon.coupontype != dto.PurchaseType)
                {
                    string gerekliTur = coupon.coupontype == "Artwork" ? "Eser" : "Etkinlik bilet";
                    return BadRequest(new { error = $"Bu kupon geçersiz! YAlnızca {gerekliTur} alımlarında kullanılabilir." });
                }

                return Ok(new { discount = coupon.discountrate, message = "Kupon başarıyla uygulandı!" });
            }
        }

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
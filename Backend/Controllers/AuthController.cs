using Backend.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly string _connectionString;

        public AuthController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        //POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            //Şifreyi BCrypt ile güvenli hale getiriyoruz (Hash)
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Düz şifreyi değil, hashlenmiş halini veritabanına kaydediyoruz
                var sql = @"
                    INSERT INTO Users (FullName, Email, PasswordHash)
                    VALUES (@FullName, @Email, @PasswordHash)
                    RETURNING UserID;";

                try
                {
                    var newUserId = await connection.ExecuteScalarAsync<int>(sql, new
                    {
                        FullName = request.FullName,
                        Email = request.Email,
                        PasswordHash = passwordHash
                    });

                    return Ok(new { Message = "Kullanıcı başarıyla kaydedildi!", UserId = newUserId});
                }
                catch (PostgresException ex) when (ex.SqlState == "23505")
                {
                    //Eğer veritabanında Email kolonu UNIQE ise ve aynı emailden varsa bu hata döner
                    return BadRequest(new { Error = "Bu e-posta adresi zaten kullanımda." });
                }
            }
        }

        //POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Kullanıcıyı Email adresine göre veritabanında arıyoruz
                var sql = "SELECT * FROM Users WHERE Email = @Email;";

                //QueryFirstOrDefault, bulursa ilk kaydı, bulamazsa null döndürür
                var user = await connection.QueryFirstOrDefaultAsync(sql, new { Email = request.Email });

                if(user == null)
                {
                    return Unauthorized(new { Error = "Kullanıcı bulunamadı veya e-posta hatalı." });
                }

                //Veritabanındaki Hash ile kullanıcın girdiği düz şifreyi karşılaştırır
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, (string)user.passwordhash);

                if (!isPasswordValid)
                {
                    return Unauthorized(new { Error = "Şifre hatalı." });
                }

                return Ok(new { Message = "Giriş başarılı!", UserId = user.userid, FullName = user.fullname });
            }
        }
    }
}
using Backend.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly string _connectionString;

        public UsersController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        //PUT: api/users/2/profile
        //Kullanıcının isim ve e-posta bilgilerini günceller
        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = @"
                    UPDATE Users
                    SET FullName = @FullName, Email = @Email, Role = @Role
                    WHERE UserID = @Id;";

                try
                {
                    var rowsAffected = await connection.ExecuteAsync(sql, new
                    {
                        FullName = request.FullName,
                        Email = request.Email,
                        Role = request.Role,
                        Id = id
                    });

                    if(rowsAffected == 0)
                        return NotFound(new { Error = "Kullanıcı bulunamadı." });

                    return Ok(new { MessageProcessingHandler = "Profil başarıyla güncellendi!" });
                }
                catch (PostgresException ex) when (ex.SqlState == "23505")
                {
                    //Eğer yeni girilen e-posta başka birinde varsa
                    return BadRequest(new { Error = "Bu e-posta adresi zaten kullanımda..." });
                }
            }
        }

        //PUT: api/users/2/password
        //Kullanıcının şifresini günceller (Eski şifreyi doğrulayarak)
        [HttpPut("{id}/password")]
        public async Task<IActionResult> UpdatePassword(int id, [FromBody] UpdatePasswordRequest request)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                //Önce kullanıcının mevcut şifre hash'ini veritabanından çekiyoruz
                var getSql = "SELECT PasswordHash FROM Users WHERE UserID = @Id;";
                var currentHash = await connection.QueryFirstOrDefaultAsync<string>(getSql, new { Id = id });

                if(currentHash == null)
                    return NotFound(new { Error = "Kullanıcı bulunamadı." });

                //Kullanıcının girdiği eski şifreyi veritabannındaki hash ile karşılaltır
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, currentHash);

                if (!isPasswordValid)
                    return BadRequest(new { Error = "Mevcut şifrenizi yanlış girdiniz." });

                //Eğer eski şifre doğruysa yeni şifreyi hashleyip kaydediyoruz
                string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

                var updateSql = "UPDATE Users SET PasswordHash = @NewHash WHERE UserID = @Id;";
                await connection.ExecuteAsync(updateSql, new { NewHash = newPasswordHash, Id = id });

                return Ok(new { Message = "Şifreniz başarıyla güncellendi'" });
            }
        }
    }
}
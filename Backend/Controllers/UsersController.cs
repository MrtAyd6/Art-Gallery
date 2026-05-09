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

        //GET: api/users/2
        //Kullanıcının rolünü çeker
        [HttpGet("{id}")]
        public async Task<IActionResult> getUserRole(int id)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "SELECT Role FROM Users WHERE UserId = @UserId";
                var userRole = await connection.QueryFirstOrDefaultAsync<string>(sql, new { UserId = id });

                if (string.IsNullOrEmpty(userRole))
                {
                    return NotFound(new { error = "Kullanıcı bulunamdı veya rol atanmadı." });
                }

                return Ok(new { role = userRole });
            }
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
                    SET FullName = @FullName, Email = @Email
                    WHERE UserID = @Id;";

                try
                {
                    var rowsAffected = await connection.ExecuteAsync(sql, new
                    {
                        FullName = request.FullName,
                        Email = request.Email,
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

       //POST: api/users/request-role
       //Kullanıcıdan gelen role deiştirme isteği
       [HttpPost("request-role")]
       public async Task<IActionResult> SubmitRoleRequest([FromBody] RoleRequest model)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = @"
                    INSERT INTO RoleRequests (UserId, RequestedRole, Message, Status)
                    VALUES (@UserId, @RequestedRole, @Message, 'Pending')";

                var result = await connection.ExecuteAsync(sql, model);
                if(result > 0) return Ok(new { message = "Başvurunuz başarıyla alındı. Yöneticilerimiz inceleyecektir." });

                return BadRequest(new { error = "Başvuru sırasında bir hata oluştu." });
            }
        } 
    
        //GET: api/users/admin/role-requests
        //Bekleyen premium başvurularını listele
        [HttpGet("admin/role-requests")]
        public async Task<IActionResult> GetPendingRequests()
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = @"
                    SELECT r.*, u.FullName, u.Email
                    FROM RoleRequests r
                    JOIN Users u ON r.UserId = u.UserId
                    WHERE r.Status = 'Pending'
                    ORDER BY r.CreatedAt DESC";

                var requests = await connection.QueryAsync<dynamic>(sql);
                return Ok(requests);
            }
        }

        //POST: api/users/admin/process-role-request
        //Başvuru Onay/Red
        [HttpPost("admin/process-role-request")]
        public async Task<IActionResult> ProcessRoleRequest([FromBody] ProcessRoleRequestDto data)
        {
            int requestId = data.RequestId;
            string decision = data.Decision;    //Approved/Rejected

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        //Talebin bilgilerini al
                        var req = await connection.QueryFirstOrDefaultAsync<dynamic>(
                            "SELECT UserId, RequestedRole FROM RoleRequests WHERE RequestId = @Id", new { Id = requestId});
                        
                        if ( req == null) return NotFound("İstek bulunamadı.");

                        //İstek durumunu güncelle
                        await connection.ExecuteAsync(
                            "UPDATE RoleRequests SET Status = @Status WHERE RequestId = @Id",
                            new { Status = decision, Id = requestId  }
                        );

                        //Eğer onaylandı ise kullanıcının rolünü gerçekten değiştir
                        if (decision == "Approved")
                        {
                            await connection.ExecuteAsync(
                                "UPDATE Users SET Role = @Role WHERE UserId = @UserId",
                                new { Role = req.requestedrole, UserId = req.userid}
                            );
                        }

                        await transaction.CommitAsync();
                        return Ok(new { message = $"İşlem başarılı. Karar: {decision}"});
                    }catch(Exception ex)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { error = ex.Message });
                    }
                }
            }
        }
    }
}
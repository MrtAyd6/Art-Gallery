using Backend.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupportController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost;Database=art_gallery_db;Username=postgres;Password=7350";

        //GET: api/support/user/1
        //Kullanıcının destek taleplerini getir
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserTickets(int userId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = "SELECT * FROM SupportTickets WHERE UserId = @UserId ORDER BY CreatedAt DESC";
                var tickets = await connection.QueryAsync<SupportTicket>(sql, new { UserId = userId });
                return Ok(tickets);
            }
        }

        //POST: api/support
        //Yeni destek talebi oluştur
        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] SupportTicket ticket)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var sql = @"
                    INSERT INTO SupportTickets (UserId, Subject, Message)
                    VALUES (@UserId, @Subject, @Message)";
                
                var result = await connection.ExecuteAsync(sql, ticket);

                if(result > 0) return Ok(new { message = "Destek talebiniz başarıyla alındı." });

                return BadRequest(new { error = "Talep ouşturulamadı." });
            }
        }
    }
}
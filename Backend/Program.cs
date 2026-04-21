var builder = WebApplication.CreateBuilder(args);

//Controller servislerini sisteme dahil eder
builder.Services.AddControllers();

//Frontendden gelen isteklere izin ver (CORS)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

app.UseCors("AllowAll");

//Gelen HTTP isteklerinin controllera haritalar
app.MapControllers();

app.Run();
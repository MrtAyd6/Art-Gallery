var builder = WebApplication.CreateBuilder(args);

//Controller servislerini sisteme dahil eder
builder.Services.AddControllers();

var app = builder.Build();

//Gelen HTTP isteklerinin controllera haritalar
app.MapControllers();

app.Run();
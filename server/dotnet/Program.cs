using Stripe;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// This is to keep track of the Account's ID in the session.
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromSeconds(10);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();
app.UseSession();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "../../client")),
    RequestPath = ""
});

DotNetEnv.Env.Load();
StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

app.MapGet("/", () =>
{
  return Results.Redirect("/index.html");
});

app.MapPost("/onboard-user", (HttpContext context) =>
{
    // Create a new standard connected account.
    var accountOptions = new AccountCreateOptions
    {
        Type = "standard",
    };
    var accountService = new AccountService();
    var account = accountService.Create(accountOptions);
    context.Session.SetString("account_id", account.Id);

    // Create a new account link to onboard the new account.
    var options = new AccountLinkCreateOptions
    {
        Account = account.Id,
        RefreshUrl = "http://localhost:4242/onboard-user/refresh",
        ReturnUrl = "http://localhost:4242/success.html",
        Type = "account_onboarding",
    };
    var service = new AccountLinkService();
    var accountLink = service.Create(options);
    return Results.Redirect(accountLink.Url);
});

app.MapGet("/onboard-user/refresh", (HttpContext context) =>
{
    // Create a new standard connected account.
    var accountId = context.Session.GetString("account_id");

    // Create a new account link to onboard the new account.
    var options = new AccountLinkCreateOptions
    {
        Account = accountId,
        RefreshUrl = "http://localhost:4242/onboard-user/refresh",
        ReturnUrl = "http://localhost:4242/success.html",
        Type = "account_onboarding",
    };
    var service = new AccountLinkService();
    var accountLink = service.Create(options);
    return Results.Redirect(accountLink.Url);
});

app.Run("http://localhost:4242");

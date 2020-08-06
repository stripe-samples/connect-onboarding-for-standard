<?php
use Slim\Http\Request;
use Slim\Http\Response;
use Stripe\Stripe;

require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::create(__DIR__);
$dotenv->load();

require './config.php';

$app = new \Slim\App;

// Instantiate the logger as a dependency
$container = $app->getContainer();
$container['logger'] = function ($c) {
  $settings = $c->get('settings')['logger'];
  $logger = new Monolog\Logger($settings['name']);
  $logger->pushProcessor(new Monolog\Processor\UidProcessor());
  $logger->pushHandler(new Monolog\Handler\StreamHandler(__DIR__ . '/logs/app.log', \Monolog\Logger::DEBUG));
  return $logger;
};

$app->add(function ($request, $response, $next) {
    Stripe::setApiKey(getenv('STRIPE_SECRET_KEY'));
    return $next($request, $response);
});

$app->post('/onboard-user', function (Request $request, Response $response, array $args) {

  $account = \Stripe\Account::create(['type' => 'standard']);

  session_start();
  $_SESSION['account_id'] = $account->id;

  $origin = $request->getHeaderLine('Origin');
  $account_link_url = generate_account_link($account->id, $origin);

  return $response->withJson(array('url' => $account_link_url));
});

$app->get('/onboard-user/refresh', function (Request $request, Response $response, array $args) {
  session_start();
  if (empty($_SESSION['account_id'])) {
    return $response
      ->withHeader('Location', '/')
      ->withStatus(302);
  }
  $account_id = $_SESSION['account_id'];

  $origin =
    ($_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://')
    . $request->getHeaderLine('Host');

  $account_link_url = generate_account_link($account_id, $origin);

  return $response
    ->withHeader('Location', $account_link_url)
    ->withStatus(302);
});

function generate_account_link(string $account_id, string $origin) {
  $account_link = \Stripe\AccountLink::create([
    'type' => 'account_onboarding',
    'account' => $account_id,
    'refresh_url' => "{$origin}/onboard-user/refresh",
    'return_url' => "{$origin}/success.html"
  ]);
  return $account_link->url;
}

$app->get('/', function (Request $request, Response $response, array $args) {
  return $response->write(file_get_contents(getenv('STATIC_DIR') . '/index.html'));
});

$app->run();

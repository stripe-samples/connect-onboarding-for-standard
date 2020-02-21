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

  $account = \Stripe\Account::create([
    'type' => 'standard',
    'business_type' => 'individual',
    'country' => 'US'
  ]);

  $return_url = $request->getHeaderLine('Origin');

  $account_link = \Stripe\AccountLink::create([
    'type' => 'onboarding',
    'account' => $account->id,
    'failure_url' => "{$return_url}/failure.html",
    'success_url' => "{$return_url}/success.html"
  ]);
  
  return $response->withJson(array('url' => $account_link->url));
});

$app->get('/', function (Request $request, Response $response, array $args) {   
  return $response->write(file_get_contents(getenv('STATIC_DIR') . '/index.html'));
});

$app->run();

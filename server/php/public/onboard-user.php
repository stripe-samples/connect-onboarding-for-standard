<?php
require_once 'shared.php';

// Create a Standard Account
$stripe_account = $stripe->accounts->create(['type' => 'standard']);

if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')
  $base = "https://";
else
  $base = "http://";
$base .= $_SERVER['HTTP_HOST'];

// Create an account link
$account_link = $stripe->accountLinks->create([
  'account' => $stripe_account->id,
  'refresh_url' => $base . '/refresh.php',
  'return_url' => $base . '/success.html',
  'type' => 'account_onboarding',
]);

header("HTTP/1.1 303 See Other");
header("Location: " . $account_link->url);

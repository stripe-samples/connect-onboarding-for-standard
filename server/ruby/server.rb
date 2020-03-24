# frozen_string_literal: true

require 'stripe'
require 'sinatra'
require 'dotenv'

# Replace if using a different env file or config
Dotenv.load
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

enable :sessions
set :static, true
set :public_folder, File.join(File.dirname(__FILE__), ENV['STATIC_DIR'])
set :port, 4242

helpers do
  def request_headers
    env.each_with_object({}) { |(k, v), acc| acc[Regexp.last_match(1).downcase] = v if k =~ /^http_(.*)/i; }
  end
end

get '/' do
  content_type 'text/html'
  send_file File.join(settings.public_folder, 'index.html')
end

post '/onboard-user' do
  content_type 'application/json'

  account = Stripe::Account.create(
    type: 'standard',
    business_type: 'individual',
    country: 'US'
  )

  session[:account_id] = account.id

  origin = request_headers['origin']

  account_link = Stripe::AccountLink.create(
    type: 'onboarding',
    account: account.id,
    failure_url: "#{origin}/onboard-user/refresh",
    success_url: "#{origin}/success.html"
  )

  {
    url: account_link.url
  }.to_json
end

get '/onboard-user/refresh' do
  redirect '/' if session[:account_id].nil?

  account_id = session[:account_id]
  origin = "http://#{request_headers['host']}"

  account_link = Stripe::AccountLink.create(
    type: 'onboarding',
    account: account_id,
    failure_url: "#{origin}/onboard-user/refresh",
    success_url: "#{origin}/success.html"
  )

  redirect account_link.url
end

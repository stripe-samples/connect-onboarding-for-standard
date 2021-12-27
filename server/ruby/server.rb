# frozen_string_literal: true
require 'stripe'
require 'sinatra'
require 'dotenv'

# Replace if using a different env file or config.
Dotenv.load

# Used for sample support, not required for production.
Stripe.set_app_info(
  'stripe-samples/connect-onboarding-for-standard',
  version: '0.0.1',
  url: 'https://github.com/stripe-samples'
)
Stripe.api_version = '2020-08-27'
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

enable :sessions
set :static, true
set :public_folder, File.join(File.dirname(__FILE__), ENV['STATIC_DIR'])
set :port, 4242
set :bind, '0.0.0.0'

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

  begin
    account = Stripe::Account.create(type: 'standard')

    session[:account_id] = account.id

    origin = request_headers['origin']

    account_link = Stripe::AccountLink.create(
      type: 'account_onboarding',
      account: account.id,
      refresh_url: "#{origin}/onboard-user/refresh",
      return_url: "#{origin}/success.html"
    )

    redirect account_link.url
  rescue => e
    puts e
  end
end

get '/onboard-user/refresh' do
  redirect '/' if session[:account_id].nil?

  account_id = session[:account_id]
  origin = "http://#{request_headers['host']}"

  account_link = Stripe::AccountLink.create(
    type: 'account_onboarding',
    account: account_id,
    refresh_url: "#{origin}/onboard-user/refresh",
    return_url: "#{origin}/success.html"
  )

  redirect account_link.url
end

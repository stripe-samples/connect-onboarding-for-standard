require 'stripe'
require 'sinatra'
require 'dotenv'

# Replace if using a different env file or config
Dotenv.load
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

set :static, true
set :public_folder, File.join(File.dirname(__FILE__), ENV['STATIC_DIR'])
set :port, 4242

helpers do

  def request_headers
    env.inject({}){|acc, (k,v)| acc[$1.downcase] = v if k =~ /^http_(.*)/i; acc}
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
    country: 'US',
    requested_capabilities: ['card_payments', 'transfers']
  )

  return_url = request_headers['origin']
    
  account_link = Stripe::AccountLink.create(
      type: 'onboarding',
      account: account.id,
      failure_url: "#{return_url}/failure.html",
      success_url: "#{return_url}/success.html"
  )

  {
    url: account_link.url
  }.to_json
end



# app.post("/onboard-user", async (req, res) => {
#   try {
#     const account = await stripe.accounts.create({

#     });

#     let returnUrl = `${req.headers.origin}`;

#     const accountLink = await stripe.accountLinks.create({

#     });

#     res.send({
#       url: accountLink.url
#     });
#   } catch (err) {
#     res.status(500).send({
#       error: err.message
#     });
#   }
# });


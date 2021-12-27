require_relative './spec_helper.rb'

RSpec.describe 'server endpoints' do
  it 'creates a new account and redirects to the account link URL' do
    response = RestClient.post(
      "#{SERVER_URL}/onboard-user",
      {},
      {
        max_redirects: 0,
        origin: 'http://localhost:4242'
      }
    )
    redirect_response = response.history.first
    expect(redirect_response.code).to eq(303)

    redirect_url = redirect_response.headers[:location]
    expect(redirect_url).to start_with('https://connect.stripe.com')
  end
end

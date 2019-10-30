# Stripe Sample Blueprint
This is a repo to help you get started with creating a sample. 

1. Clone this repository and add the sample specific logic. 
```
git clone https://git.corp.stripe.com/adreyfus/stripe-sample-template
```

2. Language specific instructions: 
    - Update the Java artifactId to use a specific sample related name. Update the README with the right package name.

3. Update the sample sample README below and delete this boilerplate text.

4. Instructions on hosting TBD.

Below is everything you should include in your original sample README. Everything above should be deleted.

# Name of sample
A brief description of what this sample shows. Keep it 3 - 5 sentences.

A quick screenshot of the demo view:
<img src="https://cf.ltkcdn.net/dogs/images/std/236742-699x450-cutest-puppy-videos.jpg" alt="Preview of sample" align="center">

Features:
* One cool thing about this sample 😃
* Another cool thing about the sample 🏋️
* The final cool thing about the sample 💡

## How to run locally
This sample includes [5 server implementations](server/README.md) in our most popular languages. 

Copy the .env.example file into a file named .env in the folder of the server you want to use. For example:

```
cp .env.example using-webhooks/server/node/.env
```

You will need a Stripe account in order to run the demo. Once you set up your account, go to the Stripe [developer dashboard](https://stripe.com/docs/development#api-keys) to find your API keys.

```
STRIPE_PUBLISHABLE_KEY=<replace-with-your-publishable-key>
STRIPE_SECRET_KEY=<replace-with-your-secret-key>
```

## FAQ
Q: Why did you pick these frameworks?

A: We chose the most minimal framework to convey the key Stripe calls and concepts you need to understand. These demos are meant as an educational tool that helps you roadmap how to integrate Stripe within your own system independent of the framework.

Q: Can you show me how to build X?

A: We are always looking for new sample ideas, please email dev-samples@stripe.com with your suggestion!

## Author(s)
[@adreyfus-stripe](https://twitter.com/adrind)

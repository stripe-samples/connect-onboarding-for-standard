package com.stripe.sample;

import java.nio.file.Paths;

import java.util.HashMap;
import java.util.Map;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import com.google.gson.Gson;

import com.stripe.Stripe;

import com.stripe.exception.*;

import io.github.cdimascio.dotenv.Dotenv;

import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.param.AccountCreateParams.RequestedCapability;
import com.stripe.param.AccountCreateParams.Type;
import com.stripe.model.AccountLink;
import com.stripe.model.Account;

public class Server {
    private static Gson gson = new Gson();

    static class CreateResponse {
        private String url;

        public CreateResponse(String url) {
            this.url = url;
        }
    }

    public static void main(String[] args) {
        port(4242);
        Dotenv dotenv = Dotenv.load();
        Stripe.apiKey = dotenv.get("STRIPE_SECRET_KEY");
        staticFiles.externalLocation(
                Paths.get(Paths.get("").toAbsolutePath().toString(), dotenv.get("STATIC_DIR")).normalize().toString());

        get("/", (request, response) -> {
            response.type("application/json");

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("some_key", "some_value");
            return gson.toJson(responseData);
        });

        post("/onboard-user", (request, response) -> {
            response.type("application/json");

            AccountCreateParams createAccountParams = new AccountCreateParams.Builder().setType(Type.STANDARD)
                    .setCountry("US").addRequestedCapability(RequestedCapability.CARD_PAYMENTS)
                    .addRequestedCapability(RequestedCapability.PLATFORM_PAYMENTS).setBusinessType("individual")
                    .build();

            Account account = Account.create(createAccountParams);

            String returnUrl = request.headers("origin");

            AccountLinkCreateParams createAccountLinkParams = new AccountLinkCreateParams.Builder()
                    .setAccount(account.getId()).setType("onboarding")
                    .setFailureUrl(String.format("%s/faliure.html", returnUrl))
                    .setSuccessUrl(String.format("%s/success.html", returnUrl)).build();

            AccountLink accoutLink = AccountLink.create(createAccountLinkParams);

            return gson.toJson(new CreateResponse(accoutLink.getUrl()));
        });

    }
}
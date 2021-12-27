package com.stripe.sample;

import java.nio.file.Paths;

import java.util.HashMap;
import java.util.Map;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import com.stripe.Stripe;
import com.stripe.exception.*;

import io.github.cdimascio.dotenv.Dotenv;

import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.model.AccountLink;
import com.stripe.model.Account;

public class Server {
    public static void main(String[] args) {
        port(4242);
        Dotenv dotenv = Dotenv.load();
        Stripe.apiKey = dotenv.get("STRIPE_SECRET_KEY");
        // For sample support and debugging, not required for production:
        Stripe.setAppInfo(
            "stripe-samples/connect-onboarding-for-standard",
            "0.0.1",
            "https://github.com/stripe-samples"
        );
        staticFiles.externalLocation(
            Paths.get(
                Paths.get("").toAbsolutePath().toString(),
                dotenv.get("STATIC_DIR")
            ).normalize().toString());

        post("/onboard-user", (request, response) -> {
            response.type("application/json");

            AccountCreateParams createAccountParams = new AccountCreateParams
                .Builder()
                .setType(AccountCreateParams.Type.STANDARD)
                .build();
            Account account = Account.create(createAccountParams);

            request.session().attribute("account_id", account.getId());

            String origin = request.headers("origin");
            String accountID = account.getId();

            AccountLinkCreateParams createAccountLinkParams = new AccountLinkCreateParams
                .Builder()
                .setAccount(accountID)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .setRefreshUrl(String.format("%s/onboard-user/refresh", origin))
                .setReturnUrl(String.format("%s/success.html", origin))
                .build();

            AccountLink accountLink = AccountLink.create(createAccountLinkParams);

            response.redirect(accountLink.getUrl(), 303);
            return "";
        });

        get("/onboard-user/refresh", (request, response) -> {
            String sessionAccountId = request.session().attribute("account_id");

            if (sessionAccountId == null) {
                response.redirect("/");
                return "";
            }

            String origin = String.format("http://%s", request.headers("host"));

            AccountLinkCreateParams createAccountLinkParams = new AccountLinkCreateParams
                .Builder()
                .setAccount(sessionAccountId)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .setRefreshUrl(String.format("%s/onboard-user/refresh", origin))
                .setReturnUrl(String.format("%s/success.html", origin))
                .build();

            AccountLink accountLink = AccountLink.create(createAccountLinkParams);

            response.redirect(accountLink.getUrl(), 303);
            return "";
        });
    }
}

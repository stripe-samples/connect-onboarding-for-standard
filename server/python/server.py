#! /usr/bin/env python3.6

"""
server.py
Stripe Sample.
Python 3.6 or newer required.
"""

import stripe
import json
import os

from flask import Flask, render_template, jsonify, request, send_from_directory
from dotenv import load_dotenv, find_dotenv

# Setup Stripe python client library
load_dotenv(find_dotenv())
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
stripe.api_version = os.getenv('STRIPE_API_VERSION')

static_dir = str(os.path.abspath(os.path.join(__file__ , "..", os.getenv("STATIC_DIR"))))
app = Flask(__name__, static_folder=static_dir,
            static_url_path="", template_folder=static_dir)

@app.route('/', methods=['GET'])
def get_example():
    return render_template('index.html')

@app.route('/onboard-user', methods=['POST'])
def onboard_user():
    
    account = stripe.Account.create(
        type='standard',
        business_type='individual',
        country='US',
        requested_capabilities=['card_payments', 'transfers']
    )

    return_url = request.headers['origin']
    
    account_link = stripe.AccountLink.create(
        type='onboarding',
        account = account.id,
        failure_url = '{}/failure.html'.format(return_url),
        success_url = '{}/success.html'.format(return_url)
    )

    try:
        return jsonify({'url': account_link.url})
    except Exception as e:
        return jsonify(error=str(e)), 403

if __name__== '__main__':
    app.run(port=4242)

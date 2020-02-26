#! /usr/bin/env python3.6

"""
server.py
Stripe Sample.
Python 3.6 or newer required.
"""

import json
import os

import stripe
from dotenv import load_dotenv, find_dotenv
from flask import Flask, jsonify, render_template, redirect, request, session, send_from_directory

# Setup Stripe python client library
load_dotenv(find_dotenv())
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
stripe.api_version = os.getenv('STRIPE_API_VERSION', '2019-12-03')

static_dir = str(os.path.abspath(os.path.join(__file__ , "..", os.getenv("STATIC_DIR"))))
app = Flask(__name__, static_folder=static_dir,
            static_url_path="", template_folder=static_dir)

# Set the secret key to some random bytes. Keep this really secret!
# This enables Flask sessions.
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

@app.route('/', methods=['GET'])
def get_example():
    return render_template('index.html')


@app.route('/onboard-user', methods=['POST'])
def onboard_user():
    account = stripe.Account.create(
        type='standard',
        business_type='individual',
        country='US'
    )
    # Store the account ID.
    session['account_id'] = account.id

    origin = request.headers['origin']
    account_link_url = _generate_account_link(account.id, origin)
    try:
        return jsonify({'url': account_link_url})
    except Exception as e:
        return jsonify(error=str(e)), 403


@app.route('/onboard-user/refresh', methods=['GET'])
def onboard_user_refresh():
    if 'account_id' not in session:
        return redirect('/')

    account_id = session['account_id']

    origin = ('https://' if request.is_secure else 'http://') + request.headers['host']
    account_link_url = _generate_account_link(account_id, origin)
    return redirect(account_link_url)


def _generate_account_link(account_id, origin):
    account_link = stripe.AccountLink.create(
        type='onboarding',
        account=account_id,
        failure_url=f'{origin}/onboard-user/refresh',
        success_url=f'{origin}/success.html',
    )
    return account_link.url


if __name__== '__main__':
    app.run(port=4242)

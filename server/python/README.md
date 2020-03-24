# Name of sample

## Requirements
* Python 3.6+
* pipenv
* [Configured .env file](../README.md)

## How to run

1. Create and activate a new virtual environment

```sh
# If you don't have pipenv installed, install it
pip install pipenv
# Run `pipenv install` to install requirements
pipenv install
```

3. Export and run the application

**On Linux / Unix / MacOS**

```
pipenv shell
export FLASK_APP=server.py
python3 -m flask run --port=4242
```

**On Windows** (PowerShell)

```
pipenv shell
$env:FLASK_APP=“server.py"
python3 -m flask run --port=4242
```

4. Go to `localhost:4242` in your browser to see the demo
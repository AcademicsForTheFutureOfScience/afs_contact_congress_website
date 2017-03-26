import json
import urllib
import urllib2
from datetime import timedelta
from functools import update_wrapper

from flask import Flask, request, send_from_directory, make_response, current_app
import pymysql

import prod_config import Config

app = Flask(__name__, static_folder='/visualizations')
app.config.from_object(Config)


states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
          'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator


def get_state_counts():
        # Open database connection
    db = MySQLdb.connect(db_host, db_username, db_password, db_database)
    cursor = db.cursor()
    query = "SELECT stateabbreviation, COUNT(*) AS `num` FROM messages GROUP BY stateabbreviation;"
    cursor.execute(query)
    result = cursor.fetchall()
    db.close()
    state_to_count = {}
    for (state, count) in result:
        state_to_count[state] = count
    # fill in zeroes for other states
    for state in states:
        if not state in state_to_count:
            state_to_count[state] = 0
    return state_to_count


@app.route('/')
def api_root():
    return 'Welcome'


@app.route('/js/datamaps')
def api_send_js():
    return send_from_directory(app.static_folder, 'datamaps.usa.min.js')


@app.route('/get-state-counts')
@crossdomain(origin='*')
def api_get_state_counts():
    state_to_count = get_state_counts()
    return json.dumps(state_to_count)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

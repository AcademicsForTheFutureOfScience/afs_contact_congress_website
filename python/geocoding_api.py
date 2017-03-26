from flask import Flask, request
import json
import urllib
import urllib2

app = Flask(__name__)
GOOGLE_BASE_URL = 'http://maps.google.com/maps/api/geocode/'


def get_google_json(address):
    url_params = {}
    url_params['address'] = address
    url_params['sensor'] = 'false'
    url_params_encode = urllib.urlencode(url_params)
    url = GOOGLE_BASE_URL + 'json?' + url_params_encode
    google_json = json.load(urllib2.urlopen(url))
    return google_json


def parse_google_json(json_data):
    data = {}
    data['latitude'] = json_data['results'][0]['geometry']['location']['lat']
    data['longitude'] = json_data['results'][0]['geometry']['location']['lng']
    try:
        data['street_number'] = [x['short_name'] for x in json_data['results']
                                 [0]['address_components'] if 'street_number' in x['types']][0]
    except IndexError:
        data['street_number'] = None
    try:
        data['postal_code'] = [x['short_name'] for x in json_data['results']
                               [0]['address_components'] if 'postal_code' in x['types']][0]
    except IndexError:
        data['postal_code'] = None
    try:
        data['postal_code_suffix'] = [x['short_name'] for x in json_data['results']
                                      [0]['address_components'] if 'postal_code_suffix' in x['types']][0]
    except IndexError:
        data['postal_code_suffix'] = None
    try:
        data['state_abbreviation'] = [x['short_name'] for x in json_data['results']
                                      [0]['address_components'] if 'administrative_area_level_1' in x['types']][0]
    except IndexError:
        data['state_abbreviation'] = None
    try:
        data['city_name'] = [x['short_name'] for x in json_data['results']
                             [0]['address_components'] if 'locality' in x['types']][0]
    except IndexError:
        data['city_name'] = None
    try:
        data['county_name'] = [x['short_name'] for x in json_data['results'][0]
                               ['address_components'] if 'administrative_area_level_2' in x['types']][0]
    except IndexError:
        data['county_name'] = None
    try:
        route = [x['short_name'] for x in json_data['results'][0]
                 ['address_components'] if 'route' in x['types']][0]
        data['route'] = route
        route_split = route.split(' ')
        data['street_suffix'] = route_split[-1]
        data['street_name'] = ' '.join(route_split[:-1])
    except IndexError:
        data['route'] = None
        data['street_suffix'] = None
        data['street_name'] = None
    return data


def make_output_obj(parsed_google_json):
    result = {}
    result['input_index'] = 0
    result['candidate_index'] = 0
    result['delivery_line_1'] = parsed_google_json['street_number'] + \
        ' ' + parsed_google_json['route']
    result['last_line'] = ''
    result['delivery_point_barcode'] = ''

    result['components'] = {}
    result['components']['primary_number'] = parsed_google_json['street_number']
    result['components']['street_name'] = parsed_google_json['street_name']
    result['components']['street_suffix'] = parsed_google_json['street_suffix']
    result['components']['city_name'] = parsed_google_json['city_name']
    result['components']['state_abbreviation'] = parsed_google_json['state_abbreviation']
    result['components']['zipcode'] = parsed_google_json['postal_code']
    result['components']['plus4_code'] = parsed_google_json['postal_code_suffix']
    result['components']['delivery_point'] = ''
    result['components']['delivery_point_check_digit'] = ''

    result['metadata'] = {}
    result['metadata']['latitude'] = parsed_google_json['latitude']
    result['metadata']['longitude'] = parsed_google_json['longitude']
    result['metadata']['county_name'] = parsed_google_json['county_name']

    result['analysis'] = {}

    return [result]


@app.route('/')
def api_root():
    return 'Welcome'


@app.route('/street-address')
def api_articles():
    address = request.args.get('street')
    google_json = get_google_json(address)
    parsed_google_json = parse_google_json(google_json)
    output = make_output_obj(parsed_google_json)
    return json.dumps(output)
    # return
    # json.dumps(json.load(urllib2.urlopen('https://api.smartystreets.com/street-address?street=219%20Vassar%20St%2C%20Cambridge%2C%20MA%2C%2002139&auth-id=50a205cf-e12e-4751-95ef-b16cab8ce607&auth-token=Wcqx6Y377Om7RBQqfZPx')))


if __name__ == '__main__':
    app.run(host='0.0.0.0')

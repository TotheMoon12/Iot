# -*- coding: utf-8 -*- 
import requests
import json
from collections import OrderedDict
from datetime import datetime, timedelta
import timeit
import gc
url_items = "http://localhost:10023/saveData"

file_data = OrderedDict()
file_data['time'] = "2020-11-28-11-16"
file_data['temperature'] = [1,18]
file_data['humidity'] = [1, 34]
file_data['gas'] = [1, 20]

headers = {'content-type': 'application/json'}

try:
	response = requests.post(url_items, data=json.dumps(file_data), headers=headers)
except  Exception as ex:
	now = datetime.now()
	print(ex)
	print('error time : ', now)


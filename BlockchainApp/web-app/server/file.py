import requests
from collections import OrderedDict

#files = open('/opt/aibc/iot/web-app/server/video.avi', 'rb')
files = None

upload = {'file':files}
data = OrderedDict()
data['id'] = 1
data['date'] = '23423'
res = requests.post('http://192.168.0.106:10023/file', files = upload, data=data)
print(res)
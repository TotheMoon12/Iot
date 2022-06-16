docker run -d --name prometheus-server -p 9090:9090 -v /opt/aibc/prometheus20/prometheus.yml:/prometheus.yml prom/prometheus --config.file=/prometheus.yml

docker network connect iot_fabric-ca prometheus-server

docker run -d --name grafana -p 3000:3000 grafana/grafana 

sudo docker exec grafana sh -c "cd /usr/share/grafana; grafana-cli plugins install agenty-flowcharting-panel"

docker restart grafana

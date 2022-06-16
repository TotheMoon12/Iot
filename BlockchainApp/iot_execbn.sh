mode=$1
password=$2
#go environment variable config
export GOROOT=/opt/aibc/go
export PATH=$PATH:$GOROOT/bin
export GOPATH=/opt/aibc/projects/go
export PATH=/opt/aibc/projects/go/src/github.com/hyperledger/fabric-samples/bin:$PATH

if [ $mode == "init" ]
then
	cd /opt/aibc/iot/;./raftOrg3Orderer3.sh; cd /opt/aibc/iot/; ./PGstart.sh; cd /opt/aibc/iot/web-app/server;bash start.sh start; 
	#cd /opt/aibc/iot/;./raftOrg2Orderer5.sh; cd /opt/aibc/iot/web-app/server;./start.sh start; 
	#echo "waiting for blockchain 5 minutes"
	#sleep 300000
fi
if [ $mode == "up" ]
then
	docker start `docker ps -a | gawk '{print $1}'`
	cd /opt/aibc/iot/web-app/server
	bash start.sh
fi

if [ $mode == "down" ]
then
	start=$(date +%s)
	cd /opt/aibc/iot/web-app/server
	server_turn=`netstat -ntlp | grep 8081`
	use=`expr length "${server_turn}"`
	if [ $use != "0" ]
	then
		curl -k -c /opt/aibc/iot/web-app/server/.cookie/cookieres.txt -d '{"id":"admin", "password":"'"${password}"'" }' -H "Content-Type: application/json" -X POST https://localhost:8081/cookie
		while :; do
			state=`curl -k -b /opt/aibc/iot/web-app/server/.cookie/cookieres.txt -X GET https://localhost:8081/terminate`
			end=$(date +%s)
			DIFF=$(( $end - $start ))
			echo $state
			if [ "$state" == "true" ] || [ $DIFF -ge 5 ]; then break;
			fi
			
		done
		npm stop
		rm /opt/aibc/iot/web-app/server/.cookie/cookieres.txt
	fi
	docker stop `docker ps | gawk '{print $1}'`
fi


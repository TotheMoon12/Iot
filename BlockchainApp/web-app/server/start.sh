#!/bin/sh  
mode=$1
if [ $mode = "start" ]
then
	rm package-lock.json
	npm install
fi
./updateKeystore.sh 
sudo rm -r wallet/*
sudo node enrollAdmin.js

echo "***************************************************"
echo "*                                                 *"
echo "*    Web Application Server Initialize!!!!!!      *"
echo "*                                                 *"
echo "***************************************************"

bash portClear.sh
node src/app.js 

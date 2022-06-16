str=`netstat -ntlp | grep 8081 | gawk -F 'LISTEN' '{print $2}'`
pro=`echo "${str%%/*}"`
kill -9 $pro

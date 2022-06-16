function generate() {

    cat << EOF

{
        "key" : "$1",
	"data" : {"data_one" : "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "data_two" : "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "data_three" : "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "data_four" : "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "data_five" : "000000"}
}
EOF
}

 
function create_process(){

    for ((j=$2; j<$3; j++))

    do

        key=$1$j
	#echo `date +"%Y-%m-%d %H:%M:%S,%3N"`
        #curl -w "%{time_total}\n" --data "$(generate $key)" -H "Content-Type: application/json" -X POST "${data}" http://165.229.185.73:8081/test
	curl -k -b ./.cookie/cookieres.txt  -w "%{time_total}\n" --data "$(generate $key)" -H "Content-Type: application/json" -X POST "${data}" https://localhost:8081/insert
	#echo `date +"%Y-%m-%d %H:%M:%S,%3N"`
    done

}

rm -f log.txt
date


for ((i=$1; i<$2; i++)) 
do
	create_process $i $3 $4 >> log.txt 2>& 1 &
done





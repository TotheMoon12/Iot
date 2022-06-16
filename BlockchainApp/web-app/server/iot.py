import sys
import socket


# 서버의 주소입니다. hostname 또는 ip address를 사용할 수 있습니다.
HOST = '192.168.0.109'  
# 서버에서 지정해 놓은 포트 번호입니다. 
PORT = 9999       


# 소켓 객체를 생성합니다. 
# 주소 체계(address family)로 IPv4, 소켓 타입으로 TCP 사용합니다.  
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)


# 지정한 HOST와 PORT를 사용하여 서버에 접속합니다. 
client_socket.connect((HOST, PORT))

if sys.argv[1] == '0' :
    print("transConf")
    # 메시지를 전송합니다.
    data = sys.argv[1] + "," + sys.argv[2] + "," + sys.argv[3] + "," + sys.argv[4] 
    print(data)
    client_socket.send(data.encode())

elif sys.argv[1] == '1':
    print("door")
    data = sys.argv[1]
    print(data)
    client_socket.send(data.encode())

elif sys.argv[1] == '2':
    print("fan")    
    data = sys.argv[1]
    print(data)
    client_socket.send(data.encode())

# 소켓을 닫습니다.
client_socket.close()

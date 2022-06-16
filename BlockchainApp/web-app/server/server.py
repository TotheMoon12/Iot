import socket

while True:
    HOST = '127.0.0.1'
    PORT = 9999        
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((HOST, PORT))

    server_socket.listen(1)

    client_socket, addr = server_socket.accept()

    print('Connected by', addr)

    while True:

        data = client_socket.recv(1024)
        data = data.decode()

        if not data:
            break

        data = data.split(',')

        print('Received from', addr, data)
        print(data[0])

    client_socket.close()
    server_socket.close()
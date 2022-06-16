import socket
import RPi.GPIO as gp 
import time 
pin = 18
gp.setmode(gp.BCM)
gp.setup(pin,gp.OUT)
p=gp.PWM(pin,50)
p.start(0)
left_angle = 10
right_angle = 4.5
door = False
while True:
    HOST = '192.168.0.109'
    PORT = 9999
    server_socket=socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR,1)
    server_socket.bind((HOST,PORT))

    server_socket.listen(1)

    client_socket, addr = server_socket.accept()

    print('Connected by',addr)
    while True:
        data=client_socket.recv(1024)
        data = data.decode()
        if not data:
            break
        
        data = data.split(',')
        if data[0] == '0':
            if data[1] != '':
                f=open('temp.txt','w')
                f.write(data[1])
                f.close()

            if data[2] != '':
                f=open('hum.txt','w')
                f.write(data[2])
                f.close()

            if data[3] != '':
                f=open('gas.txt','w')
                f.write(data[3])
                f.close()

        elif data[0] =='1':
            gp.setup(pin,gp.OUT)
            print('door_open')
            p.ChangeDutyCycle(left_angle)
            time.sleep(0.5)
            gp.setup(pin,gp.IN)
        elif data[0] =='2':
            gp.setup(pin,gp.OUT)
            print('door_close')
            p.ChangeDutyCycle(right_angle)
            time.sleep(0.5) 
            gp.setup(pin,gp.IN)
        print(data[0])
    client_socket.close()
    server_socket.close()
p.stop()
gp.cleanup()

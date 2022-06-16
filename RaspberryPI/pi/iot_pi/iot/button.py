import RPi.GPIO as gp
from time import sleep 
import requests

B1 = 17
B2 = 22
#pin = 18

gp.setmode(gp.BCM)
gp.setwarnings(False)
gp.setup(B1,gp.IN,pull_up_down=gp.PUD_UP)
gp.setup(B2, gp.IN,pull_up_down=gp.PUD_UP)
#gp.setup(pin, gp.OUT)

#p=gp.PWM(pin,50)
#p.start(0)
#left_angle = 8
#right_angle = 3
try: 
    print("Initiate")
    while True:
        if gp.input(B1)==False:
            print("OPEN")
            requests.post("http://192.168.0.106:10023/openDoor")
            #p.ChangeDutyCycle(right_angle)
            sleep(0.5)
        elif gp.input(B2)==False:
            print("CLOSE")
            requests.post("http://192.168.0.106:10023/closeDoor")
            sleep(0.5)
        #else:
            #p.stop()
            #break
except KeyboardInterrupt:
    print("END")
gp.cleanup()

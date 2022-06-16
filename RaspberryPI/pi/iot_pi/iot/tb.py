import RPi.GPIO as gp
from time import sleep 
import requests

B1 = 17
B2 = 22
pin = 18

gp.setmode(gp.BCM)
gp.setwarnings(False)
gp.setup(B1,gp.IN,pull_up_down=gp.PUD_UP)
gp.setup(B2, gp.IN,pull_up_down=gp.PUD_UP)
gp.setup(pin, gp.OUT)
p=gp.PWM(pin,50)
p.start(0)
left_angle = 10
right_angle = 4.5
try: 
    print("Initiate")
    while True:
        if gp.input(B1)==False:
            gp.setup(pin, gp.OUT)
            print("OPEN")
            p.ChangeDutyCycle(right_angle)
            sleep(0.5)
            gp.setup(pin, gp.IN)
        elif gp.input(B2)==False:
            gp.setup(pin, gp.OUT)
            print("CLOSE")
            p.ChangeDutyCycle(left_angle)
            sleep(0.5)
            gp.setup(pin, gp.IN)
except KeyboardInterrupt:
    print("END")
    p.stop()
gp.cleanup()

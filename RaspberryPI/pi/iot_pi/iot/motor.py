import RPi.GPIO as gp
import time 

pin = 18
gp.setmode(gp.BCM)
gp.setup(pin,gp.OUT)
p=gp.PWM(pin,50)
p.start(0)
left_angle = 8
right_angle = 3

def setA(angle):
    p.ChangeDutyCycle(angle)
    time.sleep(0.5)

try:
    while True:
        op = 1
        cl = 0
        now = 0
        if now = 0:
                
        #var = input("Enter L/R: ")
        #if var == 'R' or var == 'r':
        #    setA(right_angle)
        #elif var == 'L' or var == 'l':
        #    setA(left_angle)
        
        else:
            p.stop()
            break
        print("======================")

except KeyboardInterrupt:
    p.stop
gp.cleanup()

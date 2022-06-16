import os 
import RPi.GPIO as gp
from time import sleep

pin = 21

gp.setmode(gp.BCM)
gp.setup(pin,gp.OUT)

try:    
    gp.setmode(gp.BCM)
    gp.setup(pin,gp.OUT)
    while True:
        gp.output(pin,gp.HIGH)
        sleep(5)
except KeyboardInterrupt:
    gp.cleanup()

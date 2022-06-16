import spidev
import time 
import Adafruit_DHT as ada
import requests
import json
import os
import RPi.GPIO as gp
from time import sleep
from collections import OrderedDict
from datetime import datetime, timedelta
url_items = "http://192.168.0.106:10023/saveData"
#############################################################################
spi=spidev.SpiDev()
spi.open(0,0)
spi.max_speed_hz=500000
sensor = ada.DHT11
pin1 = '3'
pin2 = '4'
pin3 = 21
gp.setmode(gp.BCM)
gp.setup(pin3, gp.OUT)
##############################################################################
def read_spi_adc(adcChannel):
    adcValue=0
    buff=spi.xfer2([1,(8+adcChannel)<<4,0])
    adcValue=((buff[1]&3)<<8)+buff[2]
    return adcValue
try:
    while True:
        ftemp=open('temp.txt','r')
        fgas=open('gas.txt','r')
        fhum=open('hum.txt','r')
        xtemp=float( ftemp.readline())
        xgas=float(fgas.readline())
        xhum=float(fhum.readline())
        ftemp.close()
        fhum.close()
        fgas.close()
        data=OrderedDict()
        adcChannel1=0 #gas_sensor1_output
        #adcChannel2=1 #gas_sensor2_output
        adcValue1=read_spi_adc(adcChannel1)
        #adcValue2=read_spi_adc(adcChannel2)
        hum1,temp1 = ada.read_retry(sensor, pin1)
        hum2,temp2 = ada.read_retry(sensor, pin2)
        gp.setmode(gp.BCM)
        gp.setup(pin3, gp.OUT)
        ge=1
        te=1
        he=1
        if (hum1 is not None and temp1 is not None) and (hum2 is not None and temp2 is not None):
            print("------------------")
            print("gas1 %d"%adcValue1)
            #print("gas2 %d"%adcValue2)
            print('Temp1 = {0:0.1f}*C Humidity1 = {1:0.1f}%'.format(temp1,hum1))
            print('Temp2 = {0:0.1f}*C Humidity2 = {1:0.1f}%'.format(temp2,hum2))
            print("------------------")
            #if (abs(adcValue1-adcValue2)>45):
            #    print("Error in Gas sensor Please check!")
            #    ge=0
            if(abs(temp2-temp1)>5) or (abs(hum2-hum1)>5):
                print("Error in Temp/humidity Sensor Please check")
                te=0
                he=0
            else:
                count = 0
                if(xtemp < temp1):
                    print("temp fan on")
                    gp.output(pin3, gp.HIGH)
                else:
                    count=count+1
                if(xgas < adcValue1):
                    print("gas fan on")
                    gp.output(pin3, gp.HIGH)
                else:
                    count=count+1
                if(xhum<hum1):
                    print("hum fan on")
                    gp.output(pin3, gp.HIGH)
                else:
                    count=count+1
                if count ==3:
                    print("Fan OFF")
                    gp.output(pin3, gp.LOW)
            now=datetime.now()
            headers={'content-type':'application/json'}
            data['time']=str(now)
            data['gas']=[ge,adcValue1]
            data['humidity']=[he,hum1]
            data['temperature']=[te,temp1]
            response=requests.post(url_items,data=json.dumps(data), headers=headers)
            print("######result######")
            print(response)
            ge=0
            he=0
            te=0
            adcValue1=0
            adcValue2=0
            hum1=0
            hum2=0
            temp1=0
            temp2=0
            time.sleep(1)
        else:
            print('Failed to get reading!') 
        
except Keyboardinterrupt:
    spi.close()

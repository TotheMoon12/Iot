import spidev
import time 
spi=spidev.SpiDev()
spi.open(0,0)
spi.max_speed_hz=500000
def read_spi_adc(adcChannel):
    adcValue=0
    buff=spi.xfer2([1,(8+adcChannel)<<4,0])
    adcValue=((buff[1]&3)<<8)+buff[2]
    return adcValue
try:
    while True:
        adcChannel1=0
        adcChannel2=1
        adcValue1=read_spi_adc(adcChannel1)
        adcValue2=read_spi_adc(adcChannel2)
        print("------------------")
        print(" gas1 %d"%adcValue1)
        print(" gas2 %d"%adcValue2)
        print("------------------")
        time.sleep(1)
except Keyboardinterrupt:
    spi.close()

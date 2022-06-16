import cv2
import os
import requests
import json
from collections import OrderedDict
from datetime import datetime, timedelta
import timeit
import gc
import numpy as np
import time
# headers = {'content-type': 'application/json'}
def face_detecting(img, size=0.5):
    face_detector = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    gray = cv2.cvtColor(cv2.UMat(img), cv2.COLOR_BGR2GRAY)
    faces = face_detector.detectMultiScale(gray, 1.3, 10)
    if faces == ():
        return img, []
    for(x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 255), 2)
        roi = img[y:y+h, x:x+w]
        roi = cv2.resize(roi, (200, 200))
    return img, roi


def detecting(models):
    try:
        reqURL = 'http://192.168.0.106:10023/detectPerson'
        pivotValue = 80 # 유사도 판단 기준값
        timeInterval = 0.1

        cam = cv2.VideoCapture(0)
        cam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        while True:

            ret, frame = cam.read()

            image, face = face_detecting(frame)

            try:
                min_score = 999  # 가장 낮은 점수로 예측된 사람의 점수
                min_score_name = ""  # 가장 높은 점수로 예측된 사람의 이름

                face = cv2.cvtColor(np.float32(face), cv2.COLOR_BGR2GRAY)

                for key, model in models.items():
                    result = model.predict(face)
                    if min_score > result[1]:
                        min_score = result[1]
                        min_score_name = key

                # min_score 신뢰도, 0에 가까우면 완벽
                if min_score < 500:

                    confidence = int(100*(1-(min_score)/300))
                    # 유사도 화면에 표시
                    display_string = F"{min_score_name} {str(confidence)}%"

                # 가장 높은 유사도의 인물 텍스트로 표시
                cv2.putText(image, display_string, (100, 120),
                            cv2.FONT_HERSHEY_COMPLEX, 1, (250, 120, 255), 2)

                # 기준 이상이면 감지성공
                if confidence >= pivotValue:
                    cv2.putText(image, F"{min_score_name} is detected!",
                                (250, 450), cv2.FONT_HERSHEY_COMPLEX, 1, (0, 255, 0), 2)
                    datetimeNow = datetime.now().strftime("%Y-%m-%d %H:%M%S")
                    fileName = F"{datetimeNow}{min_score_name}.jpg"
                    cv2.imwrite(fileName, face)
                    files = open(fileName, 'rb')
                    upload = {
                        'file': files
                    }

                    data = OrderedDict()
                    data['user_id']= min_score_name
                    data['datatime']= datetimeNow
                    
                    res = requests.post(reqURL, files=upload, data=data)
                    print("data request")

                    os.remove(fileName)

                else:  # 87% 이하 감지일때는 아직 잠금해제 안함
                    cv2.putText(image, "Unknown", (250, 450),
                                cv2.FONT_HERSHEY_COMPLEX, 1, (0, 0, 255), 2)
                    datetimeNow = datetime.now().strftime("%Y-%m-%d %H:%M%S")
                    fileName = F"{datetimeNow}unknown.jpg"
                    cv2.imwrite(fileName, face)
                    files = open(fileName, 'rb')
                    
                    upload = {
                        'file': files
                    }
                    data = OrderedDict()
                    data['user_id']= 'unknown'
                    data['datatime']= datetimeNow

                    res = requests.post(reqURL, files=upload, data=data)
                    print("unknown request")

                    os.remove(fileName)

                cv2.imshow('img', image)
                time.sleep(timeInterval)

            except Exception as e:
                # 얼굴 검출 안됨
                if("OpenCV" not in str(e)):
                    print(e)
                else:
                    print('face not found')
                cv2.putText(image, "Face detecting...", (250, 450),
                            cv2.FONT_HERSHEY_COMPLEX, 1, (255, 0, 0), 2)

                cv2.imshow('img', image)
                time.sleep(timeInterval)
            
            key = cv2.waitKey(50)
            if key == ord('q'):
                break
        cam.release()
    except Exception as e:
        print(e)
        
    cv2.destroyAllWindows()
    cv2.waitKey(1)

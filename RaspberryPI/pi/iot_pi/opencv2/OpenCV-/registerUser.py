  
import cv2
import os
import init


def registUser():
    try:
        face_detector = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

        cam = cv2.VideoCapture(0)
        cam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        user_id = input("\n user id ==> ")

        if(os.path.exists(F"dataset/{user_id}")):
            print("Already registeted.")
            user_id = input('\n user id ==>  ')

        init.createFolder(F"dataset/{user_id}")

        print("\n Plz see the camera...")

        count = 0
        save_img_num = 30  # 저장할 사진 갯수

        while(True):
            ret, img = cam.read()

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = face_detector.detectMultiScale(
                gray,
                scaleFactor=1.3,  # 이미지 스케일
                minNeighbors=10  # face 후보들의 개수
            )
            cv2.imshow("IMG", img)

            for x, y, w, h in faces:
                cv2.rectangle(
                    img, (x, y), (x+w, y+h), (0, 255, 0), 2
                )
                count += 1
                print(F"save images.. {count}/{save_img_num}")
                cv2.imwrite(F"dataset/{user_id}/" +
                            str(user_id)+F"_{count}"+".jpg", gray[y:y+h, x:x+w])

            key = cv2.waitKey(50)
            if key == ord('q'):
                break
            if(count >= save_img_num):
                break
        cam.release()
    except Exception as e:
        print(e)

    cv2.destroyAllWindows()
    cv2.waitKey(1)


if __name__ == "__main__":
    try:
        registUser()
    except Exception as e:
        print(e)
import os
import init
import registerUser
import trainer
import detection


if __name__ == "__main__":
    # 필요한 폴더 없으면 생성
    if(not os.path.exists("dataset")):
        init.createFolder("dataset")

    while(True):
        try:
            order = input("""
    1: regist user
    2: detection
    3: initialize
    0: exit
""")
            if(order == "1"):
                registerUser.registUser()
            elif(order == "2"):
                detection.detecting(trainer.trainer())
            elif(order == "3"):
                init.allClear()
                init.init()
                print("initialization completed.\n")
            # elif(order == "4"):
            #     print(trainer.trainer())
            elif(order == "0"):
                break
            # elif(order == "5"):
            #     test.detecting(trainer.trainer())
            else:
                print("\n Wrong input")
        except Exception as e:
            print(e)

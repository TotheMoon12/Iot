import os
import shutil


def createFolder(directory):
    try:
        if not os.path.exists(directory):
            os.makedirs(directory)
    except OSError:
        print('폴더를 만들 수 없습니다. ' + directory)


def init():
    createFolder("dataset")


def allClear():
    shutil.rmtree("dataset")

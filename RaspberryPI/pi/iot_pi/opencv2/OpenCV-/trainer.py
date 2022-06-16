import cv2
import numpy as np
import os
from os import listdir
from os.path import isdir, isfile, join


# 사용자 얼굴 학습


def train(name):
    data_path = 'dataset/' + name + '/'

    face_pics = [f for f in listdir(data_path) if isfile(join(data_path, f))]

    Training_Data, Labels = [], []

    for i, files in enumerate(face_pics):
        image_path = data_path + face_pics[i]
        images = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

        if images is None:
            continue
        Training_Data.append(np.asarray(images, dtype=np.uint8))
        Labels.append(i)
    if len(Labels) == 0:
        print("Fail to training")
        return None
    Labels = np.asarray(Labels, dtype=np.int32)

    model = cv2.face.LBPHFaceRecognizer_create()

    model.train(np.asarray(Training_Data), np.asarray(Labels))
    print(name + " => Training completed!")

    return model


def trainer():

    data_path = 'dataset/'

    faceFolders = [f for f in listdir(data_path) if isdir(join(data_path, f))]

    models = dict()

    for faceFolder in faceFolders:
        name = os.path.split(faceFolder)[1]
        result = train(name)
        if result is None:
            continue
        models[name] = result

    return models

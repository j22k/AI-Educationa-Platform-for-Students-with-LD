import numpy as np
import cv2
import mediapipe as mp
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from flask import Blueprint, request, jsonify
from app.Helpers.userHelper import check_diagnosed  # Corrected import path
import math  # Import the math module

bp_user = Blueprint('user', __name__)

class Bottleneck(nn.Module):
    expansion = 4
    def __init__(self, in_channels, out_channels, i_downsample=None, stride=1):
        super(Bottleneck, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, padding=0, bias=False)
        self.batch_norm1 = nn.BatchNorm2d(out_channels, eps=0.001, momentum=0.99)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, padding='same', bias=False)
        self.batch_norm2 = nn.BatchNorm2d(out_channels, eps=0.001, momentum=0.99)
        self.conv3 = nn.Conv2d(out_channels, out_channels*self.expansion, kernel_size=1, stride=1, padding=0, bias=False)
        self.batch_norm3 = nn.BatchNorm2d(out_channels*self.expansion, eps=0.001, momentum=0.99)
        self.i_downsample = i_downsample
        self.stride = stride
        self.relu = nn.ReLU()
        
    def forward(self, x):
        identity = x.clone()
        x = self.relu(self.batch_norm1(self.conv1(x)))
        x = self.relu(self.batch_norm2(self.conv2(x)))
        x = self.conv3(x)
        x = self.batch_norm3(x)
        if self.i_downsample is not None:
            identity = self.i_downsample(identity)
        x += identity
        x = self.relu(x)
        return x

class Conv2dSame(torch.nn.Conv2d):
    def calc_same_pad(self, i: int, k: int, s: int, d: int) -> int:
        return max((math.ceil(i / s) - 1) * s + (k - 1) * d + 1 - i, 0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ih, iw = x.size()[-2:]
        pad_h = self.calc_same_pad(i=ih, k=self.kernel_size[0], s=self.stride[0], d=self.dilation[0])
        pad_w = self.calc_same_pad(i=iw, k=self.kernel_size[1], s=self.stride[1], d=self.dilation[1])
        if pad_h > 0 or pad_w > 0:
            x = F.pad(x, [pad_w // 2, pad_w - pad_w // 2, pad_h // 2, pad_h - pad_h // 2])
        return F.conv2d(x, self.weight, self.bias, self.stride, self.padding, self.dilation, self.groups)

class ResNet(nn.Module):
    def __init__(self, ResBlock, layer_list, num_classes, num_channels=3):
        super(ResNet, self).__init__()
        self.in_channels = 64
        self.conv_layer_s2_same = Conv2dSame(num_channels, 64, 7, stride=2, groups=1, bias=False)
        self.batch_norm1 = nn.BatchNorm2d(64, eps=0.001, momentum=0.99)
        self.relu = nn.ReLU()
        self.max_pool = nn.MaxPool2d(kernel_size=3, stride=2)
        self.layer1 = self._make_layer(ResBlock, layer_list[0], planes=64, stride=1)
        self.layer2 = self._make_layer(ResBlock, layer_list[1], planes=128, stride=2)
        self.layer3 = self._make_layer(ResBlock, layer_list[2], planes=256, stride=2)
        self.layer4 = self._make_layer(ResBlock, layer_list[3], planes=512, stride=2)
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc1 = nn.Linear(512*ResBlock.expansion, 512)
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Linear(512, num_classes)

    def extract_features(self, x):
        x = self.relu(self.batch_norm1(self.conv_layer_s2_same(x)))
        x = self.max_pool(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.avgpool(x)
        x = x.reshape(x.shape[0], -1)
        x = self.fc1(x)
        return x
        
    def forward(self, x):
        x = self.extract_features(x)
        x = self.relu1(x)
        x = self.fc2(x)
        return x
        
    def _make_layer(self, ResBlock, blocks, planes, stride=1):
        ii_downsample = None
        layers = []
        if stride != 1 or self.in_channels != planes*ResBlock.expansion:
            ii_downsample = nn.Sequential(
                nn.Conv2d(self.in_channels, planes*ResBlock.expansion, kernel_size=1, stride=stride, bias=False, padding=0),
                nn.BatchNorm2d(planes*ResBlock.expansion, eps=0.001, momentum=0.99)
            )
        layers.append(ResBlock(self.in_channels, planes, i_downsample=ii_downsample, stride=stride))
        self.in_channels = planes*ResBlock.expansion
        for i in range(blocks-1):
            layers.append(ResBlock(self.in_channels, planes))
        return nn.Sequential(*layers)
        
def ResNet50(num_classes, channels=3):
    return ResNet(Bottleneck, [3, 4, 6, 3], num_classes, channels)

class LSTMPyTorch(nn.Module):
    def __init__(self):
        super(LSTMPyTorch, self).__init__()
        self.lstm1 = nn.LSTM(input_size=512, hidden_size=512, batch_first=True, bidirectional=False)
        self.lstm2 = nn.LSTM(input_size=512, hidden_size=256, batch_first=True, bidirectional=False)
        self.fc = nn.Linear(256, 7)
        self.softmax = nn.Softmax(dim=1)

    def forward(self, x):
        x, _ = self.lstm1(x)
        x, _ = self.lstm2(x)        
        x = self.fc(x[:, -1, :])
        x = self.softmax(x)
        return x

def pth_processing(fp):
    class PreprocessInput(torch.nn.Module):
        def init(self):
            super(PreprocessInput, self).init()

        def forward(self, x):
            x = x.to(torch.float32)
            x = torch.flip(x, dims=(0,))
            x[0, :, :] -= 91.4953
            x[1, :, :] -= 103.8827
            x[2, :, :] -= 131.0912
            return x

    def get_img_torch(img):
        ttransform = transforms.Compose([
            transforms.PILToTensor(),
            PreprocessInput()
        ])
        img = img.resize((224, 224), Image.Resampling.NEAREST)
        img = ttransform(img)
        img = torch.unsqueeze(img, 0)
        return img
    return get_img_torch(fp)

def norm_coordinates(normalized_x, normalized_y, image_width, image_height):
    x_px = min(math.floor(normalized_x * image_width), image_width - 1)
    y_px = min(math.floor(normalized_y * image_height), image_height - 1)
    return x_px, y_px

def get_box(fl, w, h):
    idx_to_coors = {}
    for idx, landmark in enumerate(fl.landmark):
        landmark_px = norm_coordinates(landmark.x, landmark.y, w, h)
        if landmark_px:
            idx_to_coors[idx] = landmark_px
    x_min = np.min(np.asarray(list(idx_to_coors.values()))[:, 0])
    y_min = np.min(np.asarray(list(idx_to_coors.values()))[:, 1])
    endX = np.max(np.asarray(list(idx_to_coors.values()))[:, 0])
    endY = np.max(np.asarray(list(idx_to_coors.values()))[:, 1])
    (startX, startY) = (max(0, x_min), max(0, y_min))
    (endX, endY) = (min(w - 1, endX), (min(h - 1, endY)))
    return startX, startY, endX, endY

DICT_EMO = {0: 'Neutral', 1: 'Happiness', 2: 'Sadness', 3: 'Surprise', 4: 'Fear', 5: 'Disgust', 6: 'Anger'}

pth_backbone_model = ResNet50(7, channels=3)
pth_backbone_model.load_state_dict(torch.load('app/models/FER_static_ResNet50_AffectNet.pt'))
pth_backbone_model.eval()

pth_LSTM_model = LSTMPyTorch()
pth_LSTM_model.load_state_dict(torch.load('app/models/FER_dinamic_LSTM_Aff-Wild2.pt'))
pth_LSTM_model.eval()

mp_face_mesh = mp.solutions.face_mesh

@bp_user.route('/users/checkdiagnosed/<user_id>', methods=['GET'])
def check_diagnosed_route(user_id):
    try:
        response = check_diagnosed(user_id)
        print(f"\n\n response : {response} ")
        return jsonify(response)
    except Exception as e:
        print(f"Error in check_diagnosed: {str(e)}")  # Log the error
        return jsonify({"message": "Server error"}), 500

@bp_user.route('/users/facedetection', methods=['POST'])
def face_detection_route():
    try:
        file = request.files['image']
        npimg = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        h, w, _ = img.shape

        with mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5) as face_mesh:

            results = face_mesh.process(img_rgb)
            if results.multi_face_landmarks:
                for fl in results.multi_face_landmarks:
                    startX, startY, endX, endY = get_box(fl, w, h)
                    cur_face = img_rgb[startY:endY, startX:endX]
                    cur_face = pth_processing(Image.fromarray(cur_face))
                    features = torch.nn.functional.relu(pth_backbone_model.extract_features(cur_face)).detach().numpy()

                    lstm_features = [features] * 10
                    lstm_f = torch.from_numpy(np.vstack(lstm_features))
                    lstm_f = torch.unsqueeze(lstm_f, 0)
                    output = pth_LSTM_model(lstm_f).detach().numpy()

                    cl = np.argmax(output)
                    label = DICT_EMO[cl]
                    print(f"Emotion: {label}, Confidence: {output[0][cl]}")
                    return jsonify({
                        "emotion": label,
                        "confidence": float(output[0][cl]),
                        "box": [int(startX), int(startY), int(endX), int(endY)]
                    })
            else:
                return jsonify({"message": "No face detected"}), 400
    except Exception as e:
        print(f"Error in face_detection: {str(e)}")  # Log the error
        return jsonify({"message": "Server error"}), 500
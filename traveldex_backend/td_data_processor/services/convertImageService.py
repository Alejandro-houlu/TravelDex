import os
import uuid
import shutil
import subprocess
import io
from PIL import Image
from django.conf import settings
from RealESRGAN import RealESRGAN
import torch


def convert_image(uploaded_file,
                  version,
                  direction='sunny2rainy',
                  resize=True,
                  target_size=(256, 256),
                  upscale=False,
                  upscale_size=(1024, 1024),
                  rescale=True):
    """
    Convert an uploaded image using the CycleGAN service, with optional resizing and upscaling.

    Args:
        uploaded_file: Django UploadedFile (InMemoryUploadedFile or TemporaryUploadedFile)
        direction: 'sunny2rainy' or 'rainy2sunny'
        resize: whether to resize input to the model's training resolution
        target_size: (width, height) for resizing input images
        upscale: whether to upscale the output image, we wont be using this as we are using REAL-ERSGAN
        upscale_size: (width, height) for upscaling output images

    Returns:
        bytes: PNG image bytes of the converted (and optionally upscaled) output
    """
    # Load configuration from Django settings
    BASEDIR = settings.BASE_DIR
    STATIC = settings.STATIC_DIR
    PYTHON_CMD = 'python'

    print('*****ConvertImage Service*****')
    print('Version: ', version)

    # Prepare temporary directories
    input_dir = os.path.join(STATIC, 'input')
    test_root = os.path.join(STATIC, 'test')
    output_dir = os.path.join(
        BASEDIR,
        'results',
        direction,
        'test_latest',
        'images'
    )
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(test_root, exist_ok=True)
    os.makedirs(output_dir,exist_ok=True)

    # Save the uploaded file
    ext = '.jpg'
    filename = f"{uuid.uuid4()}{ext}"
    input_path = os.path.join(input_dir, filename)
    with open(input_path, 'wb') as f:
        f.write(uploaded_file)

    # Resize to model resolution if requested
    if resize:
        img = Image.open(input_path).convert('RGB')
        img = img.resize(target_size, Image.BICUBIC)
        # img = img.resize(target_size, resample=Image.LANCZOS)
        img.save(input_path)

    # Set up CycleGAN test inputs
    # There is no need for testB because we are only ever doing 1 image and 1 way at a time. 
    # subdir = 'testA'
    # test_subdir = os.path.join(test_root, subdir)
    # if os.path.exists(test_subdir):
    #     shutil.rmtree(test_subdir)
    # os.makedirs(test_subdir)
    # shutil.copy(input_path, test_subdir)
    for side in ('testA','testB'):
        d = os.path.join(test_root, side)
        shutil.rmtree(d, ignore_errors=True)
        os.makedirs(d, exist_ok=True)
        shutil.copy(input_path, d)

    # Run inference
    cmd = [
        PYTHON_CMD,
        os.path.join(STATIC,'models', 'pytorch-CycleGAN-and-pix2pix', 'test.py'),
        '--dataroot', test_root,
        '--name', direction,
        '--model', 'cycle_gan',
        '--num_test', '1',
        '--checkpoints_dir', os.path.join(STATIC,'checkpoints'),
        '--gpu_ids', '-1',
    ]
    subprocess.run(cmd, check=True)
    side = ''
    if  version=='sunny2rainy':
        side = 'B'
    else:
        side = 'A'

    # Locate and load the generated image
    base_name = os.path.splitext(filename)[0]
    fake_name = f"{base_name}_fake_{side}.png"
    fake_path = os.path.join(output_dir, fake_name)
    print('HERE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    print(fake_path)
    if not os.path.exists(fake_path):
        raise FileNotFoundError(f"Converted image not found at {fake_path}")
    img = Image.open(fake_path).convert('RGB')

    # Upscale output if requested
    if upscale:
        img = img.resize(upscale_size, Image.BICUBIC)
        # img = img.resize(upscale_size, resample=Image.LANCZOS)

    if rescale:
        final_image = upscaleImage(img, os.path.join(STATIC, 'models','Real-ERSGAN','weights', 'RealESRGAN_x4.pth'))

    # Return image bytes
    buf = io.BytesIO()
    final_image.save(buf, format='PNG')
    return buf.getvalue(), os.path.splitext(filename)[0]

def upscaleImage(image, weights_path):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = RealESRGAN(device, scale=4)
    model.load_weights(weights_path,download=False)

    final_img = model.predict(image)
    return final_img

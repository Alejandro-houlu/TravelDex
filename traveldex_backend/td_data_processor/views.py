from datetime import datetime
from django.utils import timezone
import traceback
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
import base64
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes

from td_data_processor.models import ConvertedImage, LandmarkReferences, Landmarks, UserAlbum
from .repository import landmarkRepo
from .services import convertImageService, detectService,s3BucketService
from .serializers import MyTokenObtainPairSerializer
from .serializers import UserRegistrationSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics
import logging
import requests

logger = logging.getLogger(__name__)  

class LoginView(TokenObtainPairView):
    # this allows all access without the jwt token
    permission_classes = [AllowAny]
    serializer_class = MyTokenObtainPairSerializer
    def post(self, request, *args, **kwargs):
        # grab the username/email from the incoming payload
        user_id = request.data.get('username') or request.data.get('email') or '<unknown>'

        # attempt the normal JWT flow
        response: Response = super().post(request, *args, **kwargs)

        # log based on status
        if response.status_code == 200:
            logger.info(f"Login SUCCESS for user: {user_id}")
        else:
            logger.warning(f"Login FAILURE for user: {user_id} — status {response.status_code}")

        return response

class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(
                {'detail': 'Invalid or expired refresh token'},
                status=status.HTTP_400_BAD_REQUEST
            )
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'userId':       user.userId,
            'email':        user.email,
            'username':     user.username,
            'profile_pic_url':  user.profile_pic_url
        })

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class   = UserRegistrationSerializer

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def pong(request):
    return HttpResponse("Pong")

@csrf_exempt
@require_POST
@api_view(['POST'])
def detectFrame(request):
    """
    POST
    Form field: 'frame' -> image file 
    returns {boxes [{x,y,width, height}, ...]}
    """
    if request.method != "POST" or "frame" not in request.FILES:
        return JsonResponse({"error":"Expected POST with a file field named 'frame'" })
    
    user = request.user
    print(request.data)
    print(request.user.username)
    logger.info(request.user.username)
    logger.info(request.data)
    to_be_saved_str = request.POST.get('tobeSaved', 'false')
    print("TO BE SAVED: ",to_be_saved_str)
    logger.info("TO BE SAVED: ",to_be_saved_str)
    to_be_saved = to_be_saved_str.lower() == 'true'
    print(to_be_saved)
    logger.info(to_be_saved)
    # Read the uploaded image bytes
    img_file = request.FILES["frame"]
    image_bytes = img_file.read()
    content_type = img_file.content_type
    try:
        result = detectService.detect_and_annotate_frame(image_bytes)
    except Exception as ex:
        traceback.print_exc()
        boxes = []
        annotated_jpeg = image_bytes
    else:
        # If result is not the expected (boxes, jpeg) tuple, fallback
        if (
            not result
            or not isinstance(result, tuple)
            or len(result) != 2
        ):
            boxes          = []
            annotated_jpeg = image_bytes
        else:
            boxes, annotated_jpeg = result

    try:
        annotated_b64 = base64.b64encode(annotated_jpeg).decode("utf-8")
    except Exception as ex:
        annotated_jpeg = ''
        traceback.print_exc()

    response_data = {
        "boxes": boxes,
        "annotated_frame": annotated_b64
    }
    if to_be_saved and boxes:
        upload_id = datetime.now().strftime('%Y%m%dT%H%M%S%f')

        orig_url = s3BucketService.upload_bytes(
            data_bytes   = image_bytes,
            uploadId    = upload_id,
            userId      = user.userId,
            location     = 'original',
            content_type = content_type,
            metaDetail = boxes
        )
        ann_url  = s3BucketService.upload_bytes(
            data_bytes   = annotated_jpeg,
            uploadId    = upload_id,
            userId      = user.userId,
            location     = 'annotated',
            content_type = 'image/jpeg',
            metaDetail = boxes
        )

        landmarkRepo.savePicture(user,orig_url, ann_url, boxes)


        response_data['urls'] = {
            "original":  orig_url,
            "annotated": ann_url
        }
    return JsonResponse(response_data)

@csrf_exempt
@require_GET
@api_view(['GET'])
def details(request):
    landmark_id = request.GET.get('id')
    logger.info(f"Getting landmark details...: {request.user.username}")

    if not landmark_id:
        return JsonResponse({'error': 'Missing id parameter'}, status=400)

    try:
        lm = Landmarks.objects.get(pk=landmark_id)
    except Landmarks.DoesNotExist:
        return JsonResponse({'error': 'Landmark not found'}, status=404)

    refs = LandmarkReferences.objects.filter(landmark=lm)
    refs_data = []
    for r in refs:
        refs_data.append({
            'id':        r.id,
            'url':       r.url,
            'title':     r.title,
            'source':    r.source,
            'added_at':  r.added_at,
            'image_url': r.image_url,
        })

    payload = {
        'id':          lm.id,
        'tag':         lm.tag,
        'name':        lm.name,
        'latitude':    str(lm.latitude),
        'longitude':   str(lm.longitude),
        'description': lm.description,
        'category':    lm.category,
        'city':        lm.city,
        'country':     lm.country,
        'references':  refs_data,
    }
    return JsonResponse(payload)

@csrf_exempt
@require_GET
@api_view(['GET'])
def album(request):
    userAlbumResult = (UserAlbum.objects.filter(user = request.user).prefetch_related('detected_landmarks'))
    print(userAlbumResult)
    logger.info(f"Getting album...: {request.user.username}")

    album = []
    for pic in userAlbumResult:
        # build a list of primitives for each landmark
        landmarks = [
            {
                "class_id":   lm.class_id,
                "class_name": lm.class_name,
                "x":          lm.x,
                "y":          lm.y,
                "width":      lm.width,
                "height":     lm.height,
                "confidence": lm.confidence,
            }
            for lm in pic.detected_landmarks.all()
        ]

        album.append({
            "user":               pic.user.userId,
            "pic_id":             pic.pic_id,
            "pic_url_orig":       pic.pic_url_original or '',
            "pic_url_ann":        pic.pic_url_annotated or '',
            "ts":                 pic.pic_timestamp.isoformat(),
            "detected_landmarks": landmarks,
        })

    return JsonResponse({"album": album})

@csrf_exempt
@api_view(['GET'])
def get_converted_images(request):
    user = request.user
    logger.info(f"Getting converted images...: {user.username}")

    # Fetch all converted images for this user, 
    # along with their original album and its landmarks
    qs = ConvertedImage.objects.filter(
        original_pic_id__user=user
    ).select_related(
        'original_pic_id'
    ).prefetch_related(
        'original_pic_id__detected_landmarks'
    )

    results = []
    for conv in qs:
        album = conv.original_pic_id
        landmarks = [
            {
                "class_id":   lm.class_id,
                "class_name": lm.class_name,
                "x":          lm.x,
                "y":          lm.y,
                "width":      lm.width,
                "height":     lm.height,
                "confidence": lm.confidence,
            }
            for lm in album.detected_landmarks.all()
        ]

        results.append({
            "converted_pic_id":        conv.converted_pic_id,
            "pic_id":                  album.pic_id,
            "converted_pic_url":       conv.converted_pic_url,
            "direction":               conv.direction,
            "converted_pic_timestamp": conv.converted_pic_timestamp.isoformat(),
            "detected_landmarks":      landmarks,
        })

    return JsonResponse({"converted_images": results})

@csrf_exempt
@api_view(['POST'])
def convertImage(request):
    user = request.user
    logger.info(f"Converting Image...: {user.username}")

    print(request.data)
    pic_url = request.data.get("pic_url")
    direction = request.data.get("direction")
    pic_id = request.data.get("pic_id")
    resp = requests.get(pic_url, stream=True)
    img_file = resp.content
    try:
        img_bytes,filename = convertImageService.convert_image(img_file, version=direction)
    except Exception as e:
        # simple print to console
        print(f"convertImage failed: {e}")
        # if you want the full traceback:
        traceback.print_exc()

        # OR, better, log it
        logger.exception("Error in convertImage")

        # and return an error response if appropriate
        return HttpResponse(f"Error: {e}", status=500)

    converted_pic_url = s3BucketService.upload_bytes(
            data_bytes   = img_bytes,
            uploadId    = filename,
            userId      = user.userId,
            location     = 'converted',
            content_type = 'image/png',
            metaDetail = [{"pic_id": pic_id}]
        )
    # Consider putting this in a proper repo, don't be lazy
    album = UserAlbum.objects.get(pic_id=pic_id)
    ConvertedImage.objects.create(
        converted_pic_id   = filename,
        original_pic_id    = album,
        converted_pic_url  = converted_pic_url,
        direction          = direction,
    )
    
    return JsonResponse({"converted_pic_url": converted_pic_url})
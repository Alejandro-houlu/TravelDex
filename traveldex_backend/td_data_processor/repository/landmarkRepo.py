
import uuid

from td_data_processor.models import UserAlbum, DetectedLandmark
from django.db import transaction


def savePicture(user, orig_url,ann_url, boxes):

    pic_id_new = uuid.uuid4().hex

    try:
        with transaction.atomic():
            userAlbum = UserAlbum(
                user=user,
                pic_id = pic_id_new,
                pic_url_original = orig_url,
                pic_url_annotated = ann_url,
            )
            userAlbum.save()


            landmarks = [
                DetectedLandmark(
                    pic=userAlbum,
                    class_id=box['class_id'],
                    class_name=box['class_name'],
                    x=box['x'],
                    y=box['y'],
                    width=box['width'],
                    height=box['height'],
                    confidence=box['confidence']
                )
                for box in boxes
            ]
            if landmarks:
                DetectedLandmark.objects.bulk_create(landmarks)

        return userAlbum
    
    except Exception as ex:
        print("landmarkRepo error")
        print(ex)
        return 
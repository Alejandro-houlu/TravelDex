import mimetypes
import os
import traceback
import boto3


bucket_name ='traveldex'

s3 = boto3.client(
    's3',
    region_name='sgp1',
    endpoint_url='https://sgp1.digitaloceanspaces.com/',
    aws_access_key_id=os.getenv('ACCESS_KEY'),
    aws_secret_access_key=os.getenv('SECRET_KEY')
)

def upload_bytes(data_bytes, uploadId, userId, location, content_type, metaDetail):
    # s3_path = os.path.join('TravelDex','users'+ str(userId),location,uploadId).replace('\\','/')
    print(content_type)
    key = f"TravelDex/users/{userId}/{location}/{uploadId}.jpg"
    try:
        s3.put_object(
            Bucket      = bucket_name,
            Key         = key,
            Body        = data_bytes,
            ACL         = 'public-read',
            ContentType = content_type,
            Metadata    = {'user': str(userId), 'details': str(metaDetail)}
        )
        return f"https://{bucket_name}.sgp1.digitaloceanspaces.com/{key}"
    except Exception:
        traceback.print_exc()
        return None
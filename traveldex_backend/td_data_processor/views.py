import json
from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST


def pong(request):
    if request.method == 'GET':
        return HttpResponse("Pong")
    else:
        return HttpResponse('invalid request', status=400)

@csrf_exempt
@require_POST   
def processFile(request):
    data = json.loads(request.body)
    userId = data.get('userId')
    picId = data.get('picId')
    contentType = data.get('contentType')
    picFile = data.get('file')
    
    return None
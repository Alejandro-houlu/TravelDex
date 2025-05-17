import cv2
import numpy as np
from ultralytics import YOLO
import supervision as sv
from io import BytesIO
from PIL import Image
import os

from traveldex_backend import settings

print(settings.STATIC_DIR)
model = os.path.join(settings.STATIC_DIR, 'models', 'best.pt') 
TRACKER_CPG = "bytetrack.yaml"
yolo_model = YOLO(model)

box_annotator = sv.BoxAnnotator()
dot_annotator = sv.DotAnnotator(
    radius=15,
    outline_thickness=5,
    outline_color=sv.Color.from_hex('#FFFFFF')
)

rich_label_annotator = sv.RichLabelAnnotator(
    font_path = "<TTF_FONT_PATH>",
    font_size = 35,
    text_position = sv.Position.TOP_CENTER,
    text_padding = 12,
    border_radius = 15,
    smart_position=True
)

def detect_and_annotate_frame(image_bytes: bytes, conf_threshold: float = 0.8):
    """
    Runs track + detect on one frame:
        - returns a List of dicts:
        { x, y, width, height, confidence, class_id, class_name, track_id }
        - and the annotated frame as JPEG bytes 
    """
    pil_img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img_np = np.array(pil_img)[:, :, ::-1]

    # Run the tracker in stream mode (batch size = 1)

    results = yolo_model.track(
        source=img_np,
        stream=True,
        show=False,
        save=False,
        tracker = TRACKER_CPG
    )

    # get the single frame's result
    result = next(results, None)
    if result is None:
        return [], image_bytes # no inference, return original
    
    frame = result.orig_img.copy() # BGR
    # Build a Supervision Detections objects + NMS
    dets = sv.Detections.from_ultralytics(result)
    dets = dets.with_nms(threshold=conf_threshold, class_agnostic=False)
    id_tensor = result.boxes.id
    num_boxes = len(dets.class_id)
    if id_tensor is None:
    # No tracker ran → fill with None (or 0 if you prefer)
        id_list = [None] * num_boxes
    else:
    # Convert tensor of IDs into plain Python ints
        id_list = [int(x.item()) for x in id_tensor]

    # Pick highest-confidence per class

    by_class = {}
    for i, cid in enumerate(dets.class_id):
        conf = float(dets.confidence[i])
        if cid not in by_class or conf > by_class[cid]["confidence"]:
            by_class[cid] = {
                "xyxy": dets.xyxy[i],
                "confidence": conf,
                "class_id": int(cid),
                "class_name": dets.data["class_name"][i],
                "track_id": id_list[i]
                # "track_id": int(result.boxes.id[i]) if hasattr(result.boxes, "id") else None
            }
    boxes_out = []
    annotated = frame.copy()

    if by_class:
        filtered = list(by_class.values())
        # Build a new 'Detections' for annatation
        xyxy = np.stack([v["xyxy"] for v in filtered],axis=0)
        confs = np.stack([v["confidence"] for v in filtered], dtype=float)
        cids = np.stack([v["class_id"] for v in filtered],dtype=int)
        names = np.stack([v["class_name"] for v in filtered],dtype=object)
        # tracks = np.stack([v["track_id"] for v in filtered],dtype=int)
        tracks = np.array(
        [v["track_id"] if v["track_id"] is not None else 0 for v in filtered],
        dtype=int)

        filt_dets = sv.Detections(
            xyxy=xyxy,
            confidence=confs,
            class_id=cids,
            data={"class_name": names, "track_id": tracks}
        )

        # Prepare labels
        labels= [
            f"{n}#{t} {c:.2f}" for n, t, c in zip(names, tracks, confs)
        ]
        dot_annotator.annotate(annotated, filt_dets)
        rich_label_annotator.annotate(annotated, filt_dets, labels=labels)

        # Prepare JSON box list
        boxes_out = [
            {
                "x": float(x1),
                "y": float(y1),
                "width": float(x2 - x1),
                "height": float(y2 - y1),
                "confidence": v["confidence"],
                "class_id": v["class_id"],
                "class_name": v["class_name"],
                "track_id": v["track_id"]
            }
            for v, (x1, y1, x2, y2) in zip(filtered, xyxy.tolist())
        ]

        # pil_annot = Image.fromarray(
        #     cv2.cvtColor(annotated, cv2.COLOR_BGR2BGRA)
        # )
        if annotated.shape[2] == 4:
            rgb = cv2.cvtColor(annotated, cv2.COLOR_BGRA2RGB)
        else:
            rgb = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)

        pil_annot = Image.fromarray(rgb)
        pil_annot = pil_annot.convert('RGB')
        buf = BytesIO()
        pil_annot.save(buf, format='JPEG')
        annotated_bytes = buf.getvalue()

        return boxes_out, annotated_bytes
        

export interface DetectedLandmark {
  class_id: number;
  class_name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface UserAlbum {
  user: number;                      
  pic_id: string;                   
  pic_url_orig: string;             
  pic_url_ann: string;              
  ts: string;                       
  detected_landmarks: DetectedLandmark[];
}

export interface EnhancedUserAlbum{
  converted_pic_id: string;  
  pic_id: string;
  converted_pic_url: string;
  direction: string;
  converted_pic_timestamp: string;
  detected_landmarks: DetectedLandmark[];
}
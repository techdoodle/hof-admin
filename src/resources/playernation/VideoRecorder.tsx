import React, { useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  Stop as StopIcon,
  Replay as ReplayIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

interface VideoRecorderProps {
  open: boolean;
  onClose: () => void;
  onVideoRecorded: (videoBlob: Blob, fileName: string) => void;
  playerName: string;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  open,
  onClose,
  onVideoRecorded,
  playerName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // Front camera for selfie-style recording
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8', // Rollback to WebM for better browser support
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        setHasVideo(true);
        setIsProcessing(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      // Stop all tracks
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording]);

  const retakeVideo = useCallback(() => {
    setHasVideo(false);
    chunksRef.current = [];
    setError(null);
  }, []);

  const saveVideo = useCallback(() => {
    if (chunksRef.current.length > 0) {
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      const fileName = `player-${playerName.replace(/\s+/g, '-')}-${Date.now()}.webm`;
      onVideoRecorded(videoBlob, fileName);
      onClose();
    }
  }, [playerName, onVideoRecorded, onClose]);

  const handleClose = useCallback(() => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    
    // Stop all tracks
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Reset state
    setIsRecording(false);
    setHasVideo(false);
    setError(null);
    setIsProcessing(false);
    chunksRef.current = [];
    
    onClose();
  }, [isRecording, stopRecording, onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        Record 360° Video for {playerName}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Position the player in the center of the frame and record a 360° video
          </Typography>
        </Box>

        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          height: '300px',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {!hasVideo && !isRecording && (
            <Box sx={{ textAlign: 'center' }}>
              <VideocamIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Camera will start when you begin recording
              </Typography>
            </Box>
          )}
          
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: hasVideo || isRecording ? 'block' : 'none'
            }}
          />
          
          {isProcessing && (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Processing video...
              </Typography>
            </Box>
          )}
        </Box>

        {hasVideo && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Video recorded successfully! You can retake or save it.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        
        {!hasVideo && !isRecording && (
          <Button
            variant="contained"
            startIcon={<VideocamIcon />}
            onClick={startRecording}
            disabled={isProcessing}
          >
            Start Recording
          </Button>
        )}
        
        {isRecording && (
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={stopRecording}
          >
            Stop Recording
          </Button>
        )}
        
        {hasVideo && (
          <>
            <Button
              startIcon={<ReplayIcon />}
              onClick={retakeVideo}
              disabled={isProcessing}
            >
              Retake
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={saveVideo}
              disabled={isProcessing}
            >
              Save Video
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VideoRecorder;

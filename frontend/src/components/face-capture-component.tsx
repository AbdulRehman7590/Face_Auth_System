"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, RefreshCw, CheckCircle, Upload } from "lucide-react";
import api from "@/utils/api";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

interface FaceCaptureComponentProps {
  mode: "register" | "login";
  onSuccess?: (email?: string) => void;
}

export function FaceCaptureComponent({
  mode = "register",
  onSuccess,
}: FaceCaptureComponentProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem("userEmail") || ""
      : "";

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCapturedImage(null);
      setIsVerified(false);
      setShowUploadOption(false);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Start new stream with square constraints
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 500 },
          height: { ideal: 500 },
          frameRate: { ideal: 30 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
      }

      setIsCapturing(true);
    } catch (err) {
      console.error("Camera error:", err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set square dimensions
    const size = 500;
    canvas.width = size;
    canvas.height = size;

    // Center and crop the image to square
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;
    context.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsCapturing(false);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedImage(event.target.result as string);
        setShowUploadOption(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = useCallback(async () => {
    if (!capturedImage) {
      toast({
        title: "Error",
        description: "No image available",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const mimeType = blob.type;
      const file = new File([blob], `face-image.${mimeType.split("/")[1]}`, {
        type: mimeType,
      });

      const formData = new FormData();
      formData.append("file", file);

      const endpoint =
        mode === "register" ? `/face/store?email=${email}` : "/face/match";

      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsVerified(true);

      if (mode === "register") {
        localStorage.setItem("isAuthenticated", "true");
        setTimeout(
          () => (onSuccess ? onSuccess() : router.push("/dashboard")),
          1000
        );
      } else {
        setTimeout(() => onSuccess && onSuccess(res.data.email), 1000);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast({
        title: "Error",
        description: "Face verification failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [capturedImage, email, mode, onSuccess, router]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setIsVerified(false);
    startCamera();
  }, [startCamera]);

  const toggleUploadOption = () => {
    setShowUploadOption(!showUploadOption);
    if (!showUploadOption && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card className="overflow-hidden border-2 border-gray-200 rounded-lg shadow-lg">
        <div className="relative w-full" style={{ height: "500px" }}>
          {!capturedImage ? (
            isCapturing ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                  <Button
                    onClick={captureImage}
                    size="lg"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capture
                  </Button>
                  <Button
                    onClick={toggleUploadOption}
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-white text-gray-800 hover:bg-gray-100 border-gray-300 shadow-md"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </>
            ) : showUploadOption ? (
              <div className="flex flex-col h-full items-center justify-center gap-6 p-6 bg-gray-50">
                <div className="text-center space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Upload your photo
                  </h3>
                  <p className="text-sm text-gray-500">
                    Supported formats: JPG, PNG
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-4 w-full px-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="flex-1 text-black bg-blue-600 hover:bg-blue-700 shadow-md"
                  >
                    Select Image
                  </Button>
                  <Button
                    onClick={toggleUploadOption}
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-white text-gray-800 hover:bg-gray-100 border-gray-300 shadow-md"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full items-center justify-center gap-6 p-6 bg-gray-50">
                <div className="text-center space-y-2">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {mode === "register"
                      ? "Register your face"
                      : "Verify your identity"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Capture a photo or upload an existing one
                  </p>
                </div>
                <div className="flex gap-4 w-full px-4">
                  <Button
                    onClick={startCamera}
                    size="lg"
                    className="flex-1 text-black bg-blue-600 hover:bg-blue-700 shadow-md"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Open Camera
                  </Button>
                  <Button
                    onClick={toggleUploadOption}
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-white text-gray-800 hover:bg-gray-100 border-gray-300 shadow-md"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="relative w-[500px] h-[500px]">
                <Image
                  width={500}
                  height={500}
                  src={capturedImage}
                  alt="Captured face"
                  className="w-full h-full object-cover rounded-md"
                  priority
                />
                {isVerified && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                )}
              </div>
              {!isVerified && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-white text-gray-800 hover:bg-gray-100 border-gray-300 shadow-md"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    className="flex-1 text-black bg-blue-600 hover:bg-blue-700 shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Processing..."
                      : mode === "register"
                      ? "Register"
                      : "Verify"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {isVerified && (
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="mx-auto h-6 w-6 text-green-600 mb-2" />
          <p className="text-green-800 font-medium">
            {mode === "register"
              ? "Face registered successfully!"
              : "Face verified successfully!"}
          </p>
        </div>
      )}
    </div>
  );
}

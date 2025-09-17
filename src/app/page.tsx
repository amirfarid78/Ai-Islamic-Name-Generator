"use client";

import { useState, useRef, useCallback, ChangeEvent } from "react";
import Image from "next/image";
import { Camera, RefreshCcw, Sparkles, Wand2, LoaderCircle, Upload, MessageSquare } from "lucide-react";

import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAiSuggestions } from "./actions";
import { Chat } from "@/components/app/chat";
import type { NameSuggestion } from "./types";


type Gender = "male" | "female";
type Step = "initial" | "scanning" | "captured" | "loading" | "results" | "error" | "chat";

export default function Home() {
  const [step, setStep] = useState<Step>("initial");
  const [gender, setGender] = useState<Gender | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Basic validation for image data URL
        if (dataUrl.startsWith('data:image/')) {
            setImageDataUrl(dataUrl);
            setStep("captured");
        } else {
            toast({
                variant: "destructive",
                title: "Invalid File",
                description: "Please upload a valid image file.",
            });
        }
      };
      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected file.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    setStep("scanning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access is required. Please enable it in your browser settings.");
      setStep("error");
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access the camera. Please check your permissions and try again.",
      });
    }
  };

  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        const aspectRatio = video.videoWidth / video.videoHeight;
        canvas.width = 640;
        canvas.height = 640 / aspectRatio;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImageDataUrl(dataUrl);
        setStep("captured");
        stopScan();
      }
    }
  }, [videoRef, canvasRef]);

  const retakePhoto = () => {
    setImageDataUrl(null);
    setGender(null);
    startScan();
  };
  
  const reset = () => {
    setStep("initial");
    setGender(null);
    setImageDataUrl(null);
    setSuggestions([]);
    setError(null);
    stopScan();
  };

  const handleGenerateNames = async () => {
    if (!imageDataUrl || !gender) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please capture a photo and select a gender.",
        });
        return;
    }
    setStep("loading");
    setError(null);

    try {
        const result = await getAiSuggestions(imageDataUrl, gender);
        if(result && result.length > 0) {
          setSuggestions(result);
          setStep("results");
        } else {
          setError("We couldn't generate any names from this photo. Please try again with a different or clearer picture.");
          setStep("error");
        }
    } catch (err) {
        console.error("AI suggestion failed:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to generate names. ${errorMessage}`);
        setStep("error");
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "An unexpected error occurred. Please try again.",
        });
    }
  };

  const renderContent = () => {
    switch (step) {
      case "initial":
        return (
          <div className="text-center">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-primary">Find the Perfect Islamic Name</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
              Our AI analyzes facial features or works with our experts to suggest beautiful and meaningful names for your newborn.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={startScan}>
                    <Camera className="mr-2" />
                    Scan Baby's Face
                </Button>
                <Button size="lg" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" />
                    Upload a Photo
                </Button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <div className="mt-8 text-center">
                <p className="text-foreground/60 mb-2">Or, for a different approach...</p>
                <Button size="lg" onClick={() => setStep('chat')}>
                    <MessageSquare className="mr-2" />
                    Chat with an Agent
                </Button>
            </div>
          </div>
        );
      case "scanning":
        return (
          <Card className="w-full max-w-md mx-auto shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="font-headline">Center Face in Frame</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-square w-full overflow-hidden rounded-full border-4 border-primary mx-auto bg-muted">
                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover scale-x-[-1]" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <Button size="lg" className="w-full mt-6" onClick={capturePhoto}>
                <Camera className="mr-2" />
                Capture Photo
              </Button>
            </CardContent>
          </Card>
        );
      case "captured":
        return (
          <Card className="w-full max-w-lg mx-auto shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="font-headline">Confirm Photo & Gender</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              {imageDataUrl && (
                <Image
                  src={imageDataUrl}
                  alt="Captured face"
                  width={256}
                  height={256}
                  className="rounded-full border-4 border-primary object-cover"
                />
              )}
              <div className="flex gap-4">
                 <Button variant="outline" onClick={retakePhoto}>
                  <RefreshCcw className="mr-2" />
                  Use Camera
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2" />
                  Change Photo
                </Button>
              </div>

              <RadioGroup
                onValueChange={(value: Gender) => setGender(value)}
                defaultValue={gender || undefined}
                className="flex gap-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="text-lg">Boy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="text-lg">Girl</Label>
                </div>
              </RadioGroup>

              <Button size="lg" className="w-full" onClick={handleGenerateNames} disabled={!gender}>
                <Wand2 className="mr-2" />
                Generate Names
              </Button>
            </CardContent>
          </Card>
        );
      case "loading":
        return (
          <div className="text-center flex flex-col items-center gap-4">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
            <h2 className="font-headline text-3xl font-bold text-primary">Generating Names...</h2>
            <p className="text-lg text-foreground/80">Our AI is finding the perfect names for you.</p>
          </div>
        );
      case "results":
        return (
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="font-headline text-4xl md:text-5xl font-bold text-primary">Your Name Suggestions</h2>
                <p className="mt-2 text-lg text-foreground/80">Here are some names our AI thought would be a good fit.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((s, i) => (
                <Card key={i} className="shadow-lg transform hover:scale-105 transition-transform duration-300 animate-in fade-in-50" style={{animationDelay: `${i * 100}ms`}}>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                           <Sparkles className="text-accent"/> {s.name}
                        </CardTitle>
                        <CardDescription className="text-accent font-semibold">{s.origin}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/90">{s.meaning}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
                <Button size="lg" onClick={reset}>
                    <RefreshCcw className="mr-2"/>
                    Start Over
                </Button>
            </div>
          </div>
        );
       case "error":
        return (
            <div className="text-center flex flex-col items-center gap-4">
                 <h2 className="font-headline text-3xl font-bold text-destructive">Something went wrong</h2>
                 <p className="text-lg text-foreground/80 max-w-md">{error}</p>
                 <Button size="lg" onClick={reset}>
                    <RefreshCcw className="mr-2"/>
                    Try Again
                </Button>
            </div>
        );
    case "chat":
        return <Chat onBack={reset} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-sm text-foreground/60">
        <p>Powered by Gemini AI. &copy; {new Date().getFullYear()} Ummah Name. All rights reserved.</p>
      </footer>
    </div>
  );
}

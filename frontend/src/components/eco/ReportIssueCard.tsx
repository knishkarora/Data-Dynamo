import { GlassCard } from "./GlassCard";
import { ChevronDown, MapPin, ShieldCheck, Upload, Loader2, CheckCircle2, Lock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const categories = [
  { id: "stubble_burning", label: "Stubble Burning" },
  { id: "garbage_burning", label: "Garbage Burning" },
  { id: "industrial_pollution", label: "Industrial Pollution" },
  { id: "water_misuse", label: "Water Misuse" },
  { id: "illegal_dumping", label: "Illegal Dumping" },
  { id: "toxic_waste", label: "Toxic Waste" }
];

export function ReportIssueCard() {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0].id);
  const [severity, setSeverity] = useState("medium");
  const [location, setLocation] = useState({ lat: 30.901, lng: 75.8573 }); // Default Ludhiana
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Ludhiana, Punjab (Default)");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let failCount = 0;

    const fetchLocation = (highAccuracy = true) => {
      if (!("geolocation" in navigator)) return;
      
      setIsLocating(true);
      console.log(`Fetching location (High Accuracy: ${highAccuracy})...`);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setLocationLabel(`${latitude.toFixed(5)}, ${longitude.toFixed(5)} (${highAccuracy ? 'GPS' : 'Approx'})`);
          setIsLocating(false);
          failCount = 0;
        },
        (error) => {
          console.error("Geolocation error:", error);
          
          if (highAccuracy && (error.code === 3 || error.code === 1)) {
            // Timeout or permission issue with high accuracy, try lower accuracy
            console.log("Retrying with lower accuracy...");
            fetchLocation(false);
            return;
          }

          setIsLocating(false);
          failCount++;
          
          if (locationLabel.includes("Default")) {
            setLocationLabel("Punjab Region (Signal Weak)");
          }

          if (failCount > 3) {
            console.warn("Too many location failures, stopping auto-updates");
            clearInterval(interval);
          }
        },
        { 
          enableHighAccuracy: highAccuracy, 
          timeout: highAccuracy ? 15000 : 10000, 
          maximumAge: highAccuracy ? 0 : 30000 
        }
      );
    };

    const initialTimer = setTimeout(() => fetchLocation(true), 5000);
    const interval = setInterval(() => fetchLocation(true), 180000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Starting submission mutation...");
      const token = await getToken();
      console.log("Token acquired:", !!token);
      
      if (!token) {
        throw new Error("You must be signed in to report an issue");
      }

      console.log("Sending POST request to:", `${import.meta.env.VITE_API_URL}/api/reports`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Submission failed response:', errorText);
        let errorMessage = "Failed to submit report";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Submission successful!", data);
      setSuccess(true);
      toast.success("Report submitted successfully!");
      // Instant update of the feed!
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports:geojson"] }); // Update map too
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setDescription("");
      }, 3000);
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(error.message || "Submission failed. Please try again.");
    }
  });

  const handleSubmit = () => {
    console.log("Submit button clicked!");
    
    if (!isSignedIn) {
      console.warn("Submission blocked: User not signed in");
      return toast.error("Please sign in first");
    }

    if (isLocating) {
      console.warn("Submission blocked: Location fetch in progress");
      return toast.error("Please wait while we pinpoint your location...");
    }

    if (locationLabel.includes("Default")) {
      console.warn("Submission blocked: GPS coordinates not verified");
      return toast.error("Precision GPS coordinates required for civic reporting.");
    }

    if (!file) {
      console.warn("Submission blocked: No file selected");
      return toast.error("Please upload an image");
    }
    
    if (description.length < 10) {
      console.warn("Submission blocked: Description too short");
      return toast.error("Description must be at least 10 characters");
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("severity", severity);
    formData.append("latitude", location.lat.toString());
    formData.append("longitude", location.lng.toString());

    console.log("Form data prepared, starting mutation with live coordinates:", location);
    mutation.mutate(formData);
  };

  if (success) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-12 text-center min-h-[300px]">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-good/10 text-good mb-6"
        >
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CheckCircle2 className="h-10 w-10" />
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-foreground">Report Received!</h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-[200px] mx-auto">
            Our AI is processing your report. Your contribution helps make India cleaner.
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="mt-8 text-xs text-teal hover:underline font-medium"
          >
            Submit another report
          </button>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <SignedIn>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Report an issue</p>
            <p className="mt-1 text-sm text-foreground/80">Help your community</p>
          </div>
        </div>

        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] py-7 text-center transition hover:border-teal/40 hover:bg-white/[0.03]"
        >
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-teal", file && "bg-teal/20")}>
            <Upload className="h-4 w-4" strokeWidth={1.6} />
          </div>
          <p className="text-sm text-foreground">{file ? file.name : "Drop photo or video"}</p>
          <p className="text-[11px] text-muted-foreground">or browse · max 10MB</p>
        </button>

        <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-white/[0.025] px-3 py-2.5 ring-1 ring-white/5">
          <div className="flex items-center gap-2">
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-teal" />
            ) : (
              <MapPin className="h-3.5 w-3.5 text-teal" strokeWidth={1.8} />
            )}
            <span className="flex-1 text-xs text-foreground truncate">
              {isLocating ? "Detecting high-accuracy location..." : locationLabel}
            </span>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] ring-1 transition-colors",
              isLocating ? "bg-teal/10 text-teal ring-teal/20" : "bg-good/15 text-good ring-good/20"
            )}>
              GPS
            </span>
          </div>
        </div>

        <div className="mt-2 relative">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none rounded-2xl bg-white/[0.025] px-3 py-2.5 text-xs text-foreground ring-1 ring-white/5 focus:outline-none"
          >
            {categories.map(c => <option key={c.id} value={c.id} className="bg-[#121212]">{c.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>

        <div className="mt-2 relative">
          <select 
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full appearance-none rounded-2xl bg-white/[0.025] px-3 py-2.5 text-xs text-foreground ring-1 ring-white/5 focus:outline-none"
          >
            <option value="low" className="bg-[#121212]">Low Severity</option>
            <option value="medium" className="bg-[#121212]">Medium Severity</option>
            <option value="high" className="bg-[#121212]">High Severity</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>

        <textarea 
          placeholder="Describe the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 w-full rounded-2xl bg-white/[0.025] px-3 py-2.5 text-xs text-foreground ring-1 ring-white/5 focus:outline-none min-h-[80px] resize-none placeholder:text-muted-foreground"
        />

        <button 
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="mt-4 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-teal to-blueaccent px-4 py-3 text-sm font-medium text-background shadow-[0_10px_30px_-12px_var(--teal)] transition active:scale-[0.99] disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit report"}
        </button>

        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" /> Reports are public and anonymized
        </p>
      </SignedIn>

      <SignedOut>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal/10 text-teal">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Sign in Required</h3>
          <p className="mt-2 text-xs text-muted-foreground max-w-[200px]">
            Please sign in to your account to report civic issues and earn impact points.
          </p>
          <SignInButton mode="modal">
            <button className="mt-6 w-full rounded-2xl bg-teal px-4 py-2.5 text-xs font-medium text-background transition hover:bg-teal/90">
              Sign In to Report
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </GlassCard>
  );
}
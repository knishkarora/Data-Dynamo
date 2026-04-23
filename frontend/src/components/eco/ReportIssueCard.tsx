import { GlassCard } from "./GlassCard";
import { ChevronDown, MapPin, ShieldCheck, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const categories = [
  { id: "stubble_burning", label: "Stubble Burning" },
  { id: "garbage_burning", label: "Garbage Burning" },
  { id: "industrial_pollution", label: "Industrial Pollution" },
  { id: "water_misuse", label: "Water Misuse" },
  { id: "illegal_dumping", label: "Illegal Dumping" },
  { id: "toxic_waste", label: "Toxic Waste" }
];

export function ReportIssueCard() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0].id);
  const [location, setLocation] = useState({ lat: 30.901, lng: 75.8573 }); // Default Ludhiana
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

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
    onSuccess: () => {
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
      console.error(error);
      toast.error(error.message || "Submission failed. Please try again.");
    }
  });

  const handleSubmit = () => {
    if (!file) return toast.error("Please upload an image");
    if (description.length < 10) return toast.error("Description must be at least 10 characters");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("latitude", location.lat.toString());
    formData.append("longitude", location.lng.toString());

    mutation.mutate(formData);
  };

  if (success) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-good/10 text-good">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">Report Received!</h3>
        <p className="mt-2 text-sm text-muted-foreground">Your contribution helps make Punjab cleaner.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
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
          <MapPin className="h-3.5 w-3.5 text-teal" strokeWidth={1.8} />
          <span className="flex-1 text-xs text-foreground">Ludhiana, Punjab (Detected)</span>
          <span className="rounded-full bg-good/15 px-2 py-0.5 text-[10px] text-good ring-1 ring-good/20">GPS</span>
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
    </GlassCard>
  );
}


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TrackBus from "./pages/TrackBus";
import NearbyBuses from "./pages/NearbyBuses";
import Favourites from "./pages/Favourites";
import Emergency from "./pages/Emergency";
import Feedback from "./pages/Feedback";
import DriverLogin from "./pages/DriverLogin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Student Routes (Public) */}
          <Route path="/" element={<Index />} />
          <Route path="/track" element={<TrackBus />} />
          <Route path="/nearby" element={<NearbyBuses />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/feedback" element={<Feedback />} />
          
          {/* Hidden Routes for Future Use */}
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

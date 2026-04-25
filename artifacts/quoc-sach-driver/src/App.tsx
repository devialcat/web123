import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/layout/FloatingContact";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Destinations from "@/pages/destinations";
import DestinationDetail from "@/pages/destination-detail";
import MapPage from "@/pages/map";
import TourBuilder from "@/pages/tour-builder";
import Booking from "@/pages/booking";
import BookingConfirmation from "@/pages/booking-confirmation";
import Contact from "@/pages/contact";
import Admin from "@/pages/admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/destinations" component={Destinations} />
          <Route path="/destinations/:id" component={DestinationDetail} />
          <Route path="/map" component={MapPage} />
          <Route path="/tour-builder" component={TourBuilder} />
          <Route path="/booking" component={Booking} />
          <Route path="/booking/:id" component={BookingConfirmation} />
          <Route path="/contact" component={Contact} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const carouselImages = [
  {
    title: "Design Sprint Feedback",
    description: "See what's next and hop on calls with one click. Always be there on time.",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=900&h=600&fit=crop&q=80"
  },
  {
    title: "Join Your Next Meeting",
    description: "Never miss a meeting with instant notifications and one-click join.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=600&fit=crop&q=80"
  },
  {
    title: "Automatic time blocking",
    description: "AI suggests and schedules tasks on your calendar. Like your own personal assistant.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=900&h=600&fit=crop&q=80"
  }
];

export function GoogleCalendarPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const handleConnectGoogle = () => {
    console.log("Connect Google Calendar clicked");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Moving Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="moving-grid" />
      </div>

      <style>{`
        .moving-grid {
          position: absolute;
          inset: -100%;
          width: 200%;
          height: 200%;
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: moveGrid 30s linear infinite;
        }
        
        @keyframes moveGrid {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>

      <div className="container mx-auto px-6 py-8 lg:py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left Column - Hero Content */}
          <div className="text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Stay Organized,{" "}
                <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Effortlessly
                </span>
                .
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Connect your Google Calendar to manage events, block focus time, and sync meetings with your projects.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Get started with
              </div>
              
              <Button
                onClick={handleConnectGoogle}
                size="lg"
                className="px-6 py-6 text-base font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm hover:shadow transition-all duration-200"
                data-testid="button-connect-google-calendar"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="4" width="40" height="40" rx="4" fill="#4285F4"/>
                  <path d="M15 18.5V16.5C15 15.6716 15.6716 15 16.5 15H17.5C18.3284 15 19 15.6716 19 16.5V18.5M29 18.5V16.5C29 15.6716 29.6716 15 30.5 15H31.5C32.3284 15 33 15.6716 33 16.5V18.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="10" y="18" width="28" height="20" rx="2" fill="white"/>
                  <text x="24" y="32" textAnchor="middle" fill="#4285F4" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">31</text>
                </svg>
                Google Calendar
              </Button>
            </div>
          </div>

          {/* Right Column - Carousel */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Carousel Image */}
              <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-900">
                <img
                  src={carouselImages[currentImageIndex].image}
                  alt={carouselImages[currentImageIndex].title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 dark:bg-gray-800/95 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all flex items-center justify-center group"
                  data-testid="button-carousel-prev"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 dark:bg-gray-800/95 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all flex items-center justify-center group"
                  data-testid="button-carousel-next"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
                </button>
              </div>

              {/* Carousel Content */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {carouselImages[currentImageIndex].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {carouselImages[currentImageIndex].description}
                </p>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 pb-6">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-blue-600 w-6"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 w-2"
                    }`}
                    data-testid={`button-carousel-indicator-${index}`}
                    aria-label={`Go to image ${index + 1}`}
                    aria-current={index === currentImageIndex ? "true" : "false"}
                  />
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 dark:bg-blue-900/30 rounded-full blur-3xl opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface StepProps {
  step: number;
}

export default function Step({ step }: StepProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Luister naar de succesvolle toast melding die aangeeft dat het profiel is opgeslagen
  useEffect(() => {
    // Functie om te luisteren naar de toast events
    const handleToasterSuccess = (event: Event) => {
      // Controleer of het een custom event is voor toast success en of het over opslaan gaat
      if (event instanceof CustomEvent && 
          event.detail && 
          typeof event.detail.message === 'string' && 
          event.detail.message.includes('opgeslagen')) {
        
        console.log('Toast success detected, navigating...');
        
        // Als er een pending navigatie is, voer deze dan uit
        if (pendingNavigation) {
          setTimeout(() => {
            router.push(pendingNavigation);
            setPendingNavigation(null);
          }, 1000); // Geef de gebruiker tijd om de toast te zien
        }
      }
    };
    
    // Voeg event listener toe
    document.addEventListener('toastSuccess', handleToasterSuccess);
    
    // Cleanup
    return () => {
      document.removeEventListener('toastSuccess', handleToasterSuccess);
    };
  }, [pendingNavigation, router]);

  // Functie om de Save Profile knop te observeren en het form submit event te detecteren
  useEffect(() => {
    if (pathname === "/kosten-berekening") {
      // Observeer het form submit event
      const handleFormSubmit = () => {
        // Als er een pending navigatie is, dan navigeren we na een korte vertraging
        if (pendingNavigation) {
          setTimeout(() => {
            router.push(pendingNavigation);
            setPendingNavigation(null);
          }, 1000); // Geef de gebruiker tijd om de toast te zien
        }
      };

      // Vind het save profile formulier als dat bestaat
      const saveProfileModal = document.querySelector('.save-profile-modal');
      if (saveProfileModal) {
        const saveForm = saveProfileModal.querySelector('form');
        if (saveForm) {
          saveForm.addEventListener('submit', handleFormSubmit);
          return () => saveForm.removeEventListener('submit', handleFormSubmit);
        }
      }
    }
  }, [pathname, pendingNavigation, router]);

  const handleNavigation = async (direction: "back" | "forward") => {
    setIsNavigating(true);
    
    // Bepaal de juiste URL gebaseerd op de huidige stap en de richting
    let targetUrl = "/";
    
    if (direction === "forward") {
      if (step === 1) targetUrl = "/kosten-berekening";
      else if (step === 2) targetUrl = "/vergelijken";
    } else {
      if (step === 2) targetUrl = "/";
      else if (step === 3) targetUrl = "/kosten-berekening";
    }
    
    // // Als we op de kostenbereking pagina zijn en vooruit willen, dan moeten we eerst het profiel opslaan
    // if (pathname === "/kosten-berekening" && direction === "forward") {
    //   // Zoek naar de SaveProfileButton en trigger een klik
    //   const saveButton = document.querySelector(".save-profile-btn") as HTMLButtonElement;
      
    //   if (saveButton) {
    //     // Sla de doelbestemming op voor later gebruik
    //     setPendingNavigation(targetUrl);
        
    //     // Klik op de save button om het opslaan te starten
    //     saveButton.click();
        
    //     // Wacht op een mogelijke modal om in te vullen
    //     toast.info("Vul de profielnaam in en sla op om door te gaan", {
    //       duration: 5000,
    //     });
        
    //     // Reset navigatie status maar we navigeren nog niet
    //     setIsNavigating(false);
    //     return;
    //   }
    // }
    
    // Voor directe navigatie zonder opslaan
    router.push(targetUrl);
    setIsNavigating(false);
  };

  return (
    <>
      <section className="step">
        <div className="step__container">
          {/* Geen navigatieknoppen op stap 1 */}
          {step > 1 && step < 3 && (
            <button 
              className="step__nav-button step__nav-button--back"
              onClick={() => handleNavigation("back")}
              disabled={isNavigating}
            >
              <ArrowLeft size={24} />
              <span>Vorige</span>
            </button>
          )}
          
          <a href="/" className="step__no">
            <div className={`step__circle ${step == 1 ? "active" : ""}`}>1</div>
            <h4 className="step__title">Woninggegevens</h4>
          </a>
          <a href="/kosten-berekening" className="step__no">
            <div className={`step__circle ${step == 2 ? "active" : ""}`}>2</div>
            <h4 className="step__title">Kosten berekening</h4>
          </a>
          <a href="/vergelijken" className="step__no">
            <div className={`step__circle ${step == 3 ? "active" : ""}`}>3</div>
            <h4 className="step__title">Vergelijken</h4>
          </a>
          
          {step > 1 && step < 3 && (
            <button 
              className="step__nav-button step__nav-button--forward"
              onClick={() => handleNavigation("forward")}
              disabled={isNavigating}
            >
              <span>Volgende</span>
              <ArrowRight size={24} />
            </button>
          )}
        </div>
      </section>
      
    </>
  );
}
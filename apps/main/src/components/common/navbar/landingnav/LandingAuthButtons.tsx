import { Button } from "@taskflow/ui";
import { useNavigate } from "react-router-dom";

interface LandingAuthButtonsProps {
  className?: string;
}

export function LandingAuthButtons({ className = "" }: LandingAuthButtonsProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/signin");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleDemo = () => {
    // TODO: Implement demo functionality
    console.log("Book demo clicked");
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button 
        onClick={handleLogin}
        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
      >
        Log In
      </button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDemo}
        className="border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500"
      >
        Book Demo
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={handleSignup}
        className="bg-teal-500 hover:bg-teal-600 text-white"
      >
        Get Started Free
      </Button>
    </div>
  );
}

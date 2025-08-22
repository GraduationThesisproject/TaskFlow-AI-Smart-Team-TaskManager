import { Button } from "@taskflow/ui";
import { useNavigate } from "react-router-dom";

interface AuthButtonsProps {
  className?: string;
  variant?: "desktop" | "mobile";
}

export function AuthButtons({ className = "", variant = "desktop" }: AuthButtonsProps) {
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

  if (variant === "mobile") {
    return (
      <div className={`space-y-2 ${className}`}>
        <Button
          variant="ghost"
          className="w-full text-left justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={handleLogin}
        >
          Log In
        </Button>
        <Button
          variant="outline"
          className="w-full border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500"
          onClick={handleDemo}
        >
          Book Demo
        </Button>
        <Button
          variant="default"
          className="w-full bg-teal-500 hover:bg-teal-600 text-white"
          onClick={handleSignup}
        >
          Get Started Free
        </Button>
      </div>
    );
  }

  return (
    <div className={`hidden md:flex items-center space-x-4 ${className}`}>
      <Button
        variant="ghost"
        className="text-gray-300 hover:text-white transition-colors duration-200 bg-transparent"
        onClick={handleLogin}
      >
        Log In
      </Button>
      <Button
        variant="outline"
        className="border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500"
        onClick={handleDemo}
      >
        Book Demo
      </Button>
      <Button
        variant="default"
        className="bg-teal-500 hover:bg-teal-600 text-white"
        onClick={handleSignup}
      >
        Get Started Free
      </Button>
    </div>
  );
}

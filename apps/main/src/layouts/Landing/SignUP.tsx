import { useState } from "react";
import { Input, Button } from "@taskflow/ui";

export default function Index() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    console.log("Form submitted:", formData);
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen w-full bg-taskflow-dark font-['Inter'] flex items-center justify-center p-4">
      <div className="w-full max-w-[448px] bg-taskflow-card border border-taskflow-green rounded-3xl shadow-[0_20px_60px_0_rgba(0,0,0,0.40)] p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo */}
          <div className="w-12 h-12 bg-gradient-to-r from-taskflow-gradient-from to-taskflow-gradient-to rounded-xl shadow-[0_8px_32px_0_rgba(79,70,229,0.30)] flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 14L12.8333 16.3333L17.5 11.6667M24.5 14C24.5 15.3789 24.2284 16.7443 23.7007 18.0182C23.1731 19.2921 22.3996 20.4496 21.4246 21.4246C20.4496 22.3996 19.2921 23.1731 18.0182 23.7007C16.7443 24.2284 15.3789 24.5 14 24.5C12.6211 24.5 11.2557 24.2284 9.98182 23.7007C8.70791 23.1731 7.55039 22.3996 6.57538 21.4246C5.60036 20.4496 4.82694 19.2921 4.29926 18.0182C3.77159 16.7443 3.5 15.3789 3.5 14C3.5 11.2152 4.60625 8.54451 6.57538 6.57538C8.54451 4.60625 11.2152 3.5 14 3.5C16.7848 3.5 19.4555 4.60625 21.4246 6.57538C23.3938 8.54451 24.5 11.2152 24.5 14Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          
          {/* Title */}
          <h1 className="text-taskflow-text-primary text-2xl font-normal leading-9 mb-2">
            Taskflow
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-taskflow-green text-[28px] font-normal leading-[42px] text-center mb-4">
            Create Account
          </h2>
          
          {/* Description */}
          <p className="text-taskflow-text-muted text-base font-normal leading-6 text-center max-w-[343px]">
            Join thousands of users managing their tasks efficiently
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-taskflow-text-secondary text-sm font-normal leading-[21px] mb-2">
              Full Name
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange('fullName')}
                className="w-full h-[50px] bg-taskflow-input border border-taskflow-border rounded-xl pl-4 pr-12 text-taskflow-text-primary text-base transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-taskflow-green focus:border-taskflow-green placeholder-taskflow-text-muted"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-taskflow-text-secondary text-sm font-normal leading-[21px] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="w-full h-[50px] bg-taskflow-input border border-taskflow-border rounded-xl pl-4 pr-12 text-taskflow-text-primary text-base transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-taskflow-green focus:border-taskflow-green placeholder-taskflow-text-muted"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-taskflow-text-secondary text-sm font-normal leading-[21px] mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                key={showPassword ? 'text' : 'password'}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                className="w-full h-[50px] bg-taskflow-input border border-taskflow-border rounded-xl pl-4 pr-12 text-taskflow-text-primary text-base transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-taskflow-green focus:border-taskflow-green placeholder-taskflow-text-muted"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-taskflow-text-secondary text-sm font-normal leading-[21px] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                key={showConfirmPassword ? 'text' : 'password'}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                className="w-full h-[50px] bg-taskflow-input border border-taskflow-border rounded-xl pl-4 pr-12 text-taskflow-text-primary text-base transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-taskflow-green focus:border-taskflow-green placeholder-taskflow-text-muted"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} variant="gradient" size="lg" className="w-full">
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Divider */}
          <div className="relative mt-6 mb-6">
            <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center">
              <div className="w-full border-t border-taskflow-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-taskflow-card px-2 text-taskflow-text-faded">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="h-[50px] bg-taskflow-input border border-taskflow-border rounded-xl flex items-center justify-center gap-3 text-taskflow-text-secondary text-base font-normal leading-6 transition-all duration-150 ease-out hover:bg-taskflow-border"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.8 10.2084C18.8 9.55837 18.7417 8.93337 18.6333 8.33337H10V11.8834H14.9333C14.7167 13.025 14.0667 13.9917 13.0917 14.6417V16.95H16.0667C17.8 15.35 18.8 13 18.8 10.2084Z" fill="white"/>
                <path d="M9.99974 19.1667C12.4747 19.1667 14.5497 18.35 16.0664 16.95L13.0914 14.6417C12.2747 15.1917 11.2331 15.525 9.99974 15.525C7.61641 15.525 5.59141 13.9167 4.86641 11.75H1.81641V14.1167C3.32474 17.1083 6.41641 19.1667 9.99974 19.1667Z" fill="white"/>
                <path d="M4.86732 11.7417C4.68398 11.1917 4.57565 10.6084 4.57565 10.0001C4.57565 9.39172 4.68398 8.80839 4.86732 8.25839V5.89172H1.81732C1.19232 7.12506 0.833984 8.51672 0.833984 10.0001C0.833984 11.4834 1.19232 12.8751 1.81732 14.1084L4.19232 12.2584L4.86732 11.7417Z" fill="white"/>
                <path d="M9.99974 4.48337C11.3497 4.48337 12.5497 4.95004 13.5081 5.85004L16.1331 3.22504C14.5414 1.74171 12.4747 0.833374 9.99974 0.833374C6.41641 0.833374 3.32474 2.89171 1.81641 5.89171L4.86641 8.25837C5.59141 6.09171 7.61641 4.48337 9.99974 4.48337Z" fill="white"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="h-[50px] bg-taskflow-input border border-taskflow-border rounded-xl flex items-center justify-center gap-3 text-taskflow-text-secondary text-base font-normal leading-6 transition-all duration-150 ease-out hover:bg-taskflow-border"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" fill="white"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-6">
            <p className="text-taskflow-text-faded text-sm font-normal leading-[21px]">
              <span>Already have an account? </span>
              <a href="#" className="text-taskflow-cyan hover:underline">
                Sign in here
              </a>
            </p>
          </div>

          <div className="text-center mt-4">
            <p className="text-taskflow-text-faded text-xs font-normal leading-[18px]">
              <span>By continuing, you agree to our </span>
              <a href="#" className="text-taskflow-cyan hover:underline">
                Terms of Service
              </a>
              <span> and </span>
              <a href="#" className="text-taskflow-cyan hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

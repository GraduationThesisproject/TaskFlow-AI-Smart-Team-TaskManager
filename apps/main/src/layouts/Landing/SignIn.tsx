import { useState } from "react";
import { Card, Input, Button, Checkbox } from "@taskflow/ui";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  // Focus states removed; not needed for current styling

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempted with:", { email, password, rememberMe });
  };

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center font-inter">
      <Card
        className="w-[448px] h-[715px] bg-taskflow-dark border border-taskflow-accent rounded-2xl relative"
        style={{ boxShadow: "0 20px 40px 0 rgba(0, 0, 0, 0.40)" }}
      >
        {/* Header with Logo */}
        <div className="absolute top-[33px] left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(90deg, #007ADF 100%, #00EBCB 0%)",
              boxShadow: "0 4px 15px 0 rgba(0, 122, 223, 0.20)"
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M9 12L11 14L15 10M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z" 
                fill="black"
              />
            </svg>
          </div>
          <span className="text-white text-2xl font-normal leading-9">Taskflow</span>
        </div>

        {/* Welcome Text */}
        <div className="absolute top-[97px] left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-taskflow-accent text-[28px] font-normal leading-[42px] mb-2">
            Welcome back
          </h1>
          <p className="text-taskflow-text-muted text-base font-normal leading-6">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="absolute top-[203px] left-[33px] right-[33px]">
          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-taskflow-text-secondary text-sm font-normal leading-[21px] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={undefined}
                onBlur={undefined}
                className="h-[50px] bg-taskflow-darker border-taskflow-border rounded-lg px-4 text-white text-base"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-taskflow-text-secondary text-sm font-normal leading-[21px] mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                // key={showPassword ? 'text' : 'password'}
                type="email"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={undefined}
                onBlur={undefined}
                className="h-[50px] bg-taskflow-darker border-taskflow-border rounded-lg px-4 pr-12 text-taskflow-text-primary text-base placeholder-taskflow-text-muted"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-taskflow-text-secondary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 10c0 .663-.263 1.299-.732 1.768A2.494 2.494 0 0 1 10 12.5a2.5 2.5 0 1 1 0-5c.663 0 1.299.263 1.768.732.469.469.732 1.105.732 1.768Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.048 10C3.11 6.619 6.269 4.167 10 4.167S16.89 6.619 17.951 10C16.89 13.381 13.731 15.833 10 15.833S3.11 13.381 2.048 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
              label="Remember me"
              className="text-white border-taskflow-text-dimmed"
            />
            <a 
              href="#" 
              className="text-taskflow-secondary text-sm font-normal leading-[21px] hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {/* Sign In Button */}
          <Button type="submit" variant="gradient" size="lg" className="w-full">
            Sign In
          </Button>

          {/* Divider */}
          <div className="relative mt-8 mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-taskflow-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-taskflow-dark px-1 text-taskflow-text-dimmed">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              className="flex-1 h-[50px] bg-taskflow-darker border border-taskflow-border rounded-lg flex items-center justify-center gap-3 text-taskflow-text-secondary text-base font-normal transition-all duration-150 hover:bg-opacity-80 hover:border-taskflow-text-dimmed"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18.8 10.2084C18.8 9.55837 18.7417 8.93337 18.6333 8.33337H10V11.8834H14.9333C14.7167 13.025 14.0667 13.9917 13.0917 14.6417V16.95H16.0667C17.8 15.35 18.8 13 18.8 10.2084Z" fill="currentColor"/>
                <path d="M9.99974 19.1667C12.4747 19.1667 14.5497 18.35 16.0664 16.95L13.0914 14.6417C12.2747 15.1917 11.2331 15.525 9.99974 15.525C7.61641 15.525 5.59141 13.9167 4.86641 11.75H1.81641V14.1167C3.32474 17.1083 6.41641 19.1667 9.99974 19.1667Z" fill="currentColor"/>
                <path d="M4.86634 11.7417C4.68301 11.1917 4.57467 10.6084 4.57467 10.0001C4.57467 9.39172 4.68301 8.80839 4.86634 8.25839V5.89172H1.81634C1.19134 7.12506 0.833008 8.51672 0.833008 10.0001C0.833008 11.4834 1.19134 12.8751 1.81634 14.1084L4.19134 12.2584L4.86634 11.7417Z" fill="currentColor"/>
                <path d="M9.99974 4.48337C11.3497 4.48337 12.5497 4.95004 13.5081 5.85004L16.1331 3.22504C14.5414 1.74171 12.4747 0.833374 9.99974 0.833374C6.41641 0.833374 3.32474 2.89171 1.81641 5.89171L4.86641 8.25837C5.59141 6.09171 7.61641 4.48337 9.99974 4.48337Z" fill="currentColor"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              className="flex-1 h-[50px] bg-taskflow-darker border border-taskflow-border rounded-lg flex items-center justify-center gap-3 text-taskflow-text-secondary text-base font-normal transition-all duration-150 hover:bg-opacity-80 hover:border-taskflow-text-dimmed"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" fill="currentColor"/>
              </svg>
              <span>Github</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-taskflow-text-dimmed text-sm font-normal leading-[21px] mb-4">
              <span>Don't have an account? </span>
              <a href="#" className="text-taskflow-secondary hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="absolute bottom-[33px] left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-taskflow-text-dimmed text-xs font-normal leading-[18px]">
            <span>By continuing, you agree to our </span>
            <a href="#" className="text-taskflow-secondary hover:underline">
              Terms of Service
            </a>
            <span> and </span>
            <a href="#" className="text-taskflow-secondary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}


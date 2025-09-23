import { Routes, Route, useLocation } from 'react-router-dom';
import { PageTransition, AnimatedPage, usePageTransition } from '../components/common/PageTransition';
import EmailVerification from "../layouts/Landing/EmailVerif";
import RecoverPassword from "../layouts/Landing/RecoverPass";
import ForgotPassword from "../layouts/Landing/ForgotPassword";
import LandingPageHome from '../layouts/Landing/StaticPages/homePage';
import Features from '../layouts/Landing/StaticPages/Features';
import Pricing from '../layouts/Landing/StaticPages/Pricing';
import About from '../layouts/Landing/StaticPages/About';
import Contact from '../layouts/Landing/StaticPages/Contact';
import SupportPage from '../layouts/Landing/StaticPages/SupportPage';

interface LandingPageProps {
  onSignUpClick?: () => void;
}

export const LandingPage = ({ onSignUpClick }: LandingPageProps) => {
    const location = useLocation();
    const { handleAnimationStart, handleAnimationComplete } = usePageTransition();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <PageTransition location={location}>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={
                        <AnimatedPage 
                          animationType="scale"
                          onAnimationStart={handleAnimationStart}
                          onAnimationComplete={handleAnimationComplete}
                        >
                            <LandingPageHome 
                              onSignUpClick={onSignUpClick}
                            />
                        </AnimatedPage>
                    } />
                    <Route path="/verify-email" element={
                        <AnimatedPage 
                          animationType="fade"
                          onAnimationStart={handleAnimationStart}
                          onAnimationComplete={handleAnimationComplete}
                        >
                            <EmailVerification />
                        </AnimatedPage>
                    } />
                    <Route path="/forgot-password" element={
                        <AnimatedPage 
                          animationType="fade"
                          onAnimationStart={handleAnimationStart}
                          onAnimationComplete={handleAnimationComplete}
                        >
                            <ForgotPassword />
                        </AnimatedPage>
                    } />
                    <Route path="/reset-password" element={
                        <AnimatedPage 
                          animationType="fade"
                          onAnimationStart={handleAnimationStart}
                          onAnimationComplete={handleAnimationComplete}
                        >
                            <RecoverPassword />
                        </AnimatedPage>
                    } />
                    <Route path="/features" element={
                        <AnimatedPage 
                          animationType="scale"
                          onAnimationStart={handleAnimationStart}
                          onAnimationComplete={handleAnimationComplete}
                        >
                            <Features />
                        </AnimatedPage>
                    } />
                    <Route path="/pricing" element={
                        <AnimatedPage 
                          animationType="scale"
                          onAnimationStart={handleAnimationStart}
                          onAnimationComplete={handleAnimationComplete}
                        >
                            <Pricing />
                        </AnimatedPage>
                    } />
                    <Route path="/about" element={
                        <AnimatedPage 
                          animationType="fade"
                          onAnimationStart={handleAnimationStart}
                          onAnimationComplete={handleAnimationComplete}
                        >
                            <About />
                        </AnimatedPage>
                    } />
                    <Route path="/contact" element={
                        <AnimatedPage 
                          animationType="fade"
                          onAnimationStart={handleAnimationStart}
                          onAnimationComplete={handleAnimationComplete}
                        >
                            <Contact />
                        </AnimatedPage>
                    } />
                    <Route path="/support" element={
                        <AnimatedPage 
                          animationType="fade"
                          onAnimationStart={handleAnimationStart}
                          onAnimationComplete={handleAnimationComplete}
                        >
                            <SupportPage />
                        </AnimatedPage>
                    } />
                </Routes>
            </PageTransition>
        </div>
    );
};

export default LandingPage;
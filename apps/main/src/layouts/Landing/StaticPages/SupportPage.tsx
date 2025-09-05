import { useState } from "react";
import ChatWidget from "../../../components/chat/ChatWidget";

const SupportPage = () => {
    const [isChatOpen, setIsChatOpen] = useState(true);
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Customer Support
            </h1>
            <p className="text-muted-foreground text-lg">
              Need help? Our support team is here to assist you 24/7.
            </p>
          </div>
  
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <p>
                    <strong>Email:</strong> support@taskflow.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +1 (555) 123-4567
                  </p>
                  <p>
                    <strong>Hours:</strong> 24/7 Support
                  </p>
                </div>
              </div>
  
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">Quick Help</h3>
                <div className="space-y-3">
                  <p>
                    •{" "}
                    <a href="/docs" className="text-blue-500 hover:underline">
                      Documentation
                    </a>
                  </p>
                  <p>
                    •{" "}
                    <a href="/faq" className="text-blue-500 hover:underline">
                      FAQ
                    </a>
                  </p>
                  <p>
                    •{" "}
                    <a
                      href="/community"
                      className="text-blue-500 hover:underline"
                    >
                      Community Forum
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Chat Widget for Support Page */}
        <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    );
  };
  export default SupportPage;
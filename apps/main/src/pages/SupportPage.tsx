import React from 'react';
import { Typography } from '@taskflow/ui';
import { Container } from '@taskflow/ui';
import { Button } from '@taskflow/ui';
import { Card, CardContent } from '@taskflow/ui';
import { Mail, MessageCircle, Phone, HelpCircle } from 'lucide-react';

const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Container size="4xl" className="py-24">
        <div className="text-center mb-16">
          <Typography variant="h1" className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Need Help?
          </Typography>
          <Typography variant="lead" className="text-xl text-slate-600 max-w-2xl mx-auto">
            We're here to help you get the most out of TaskFlow. Choose the best way to reach us.
          </Typography>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                Live Chat
              </Typography>
              <Typography variant="body" className="text-slate-600 mb-4">
                Get instant help from our support team
              </Typography>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                Email Support
              </Typography>
              <Typography variant="body" className="text-slate-600 mb-4">
                Send us a detailed message
              </Typography>
              <Button variant="outline" className="w-full">
                support@taskflow.com
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                Phone Support
              </Typography>
              <Typography variant="body" className="text-slate-600 mb-4">
                Call us for urgent issues
              </Typography>
              <Button variant="outline" className="w-full">
                +1 (555) 123-4567
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <Typography variant="h2" className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </Typography>
          </div>

          <div className="space-y-6">
            <div>
              <Typography variant="h4" className="text-lg font-semibold mb-2">
                How do I create a new workspace?
              </Typography>
              <Typography variant="body" className="text-slate-600">
                Navigate to your dashboard and click the "Create Workspace" button. Follow the setup wizard to configure your workspace settings.
              </Typography>
            </div>

            <div>
              <Typography variant="h4" className="text-lg font-semibold mb-2">
                Can I invite team members to my workspace?
              </Typography>
              <Typography variant="body" className="text-slate-600">
                Yes! Go to your workspace settings and use the "Invite Members" section to send invitations via email.
              </Typography>
            </div>

            <div>
              <Typography variant="h4" className="text-lg font-semibold mb-2">
                How do I export my data?
              </Typography>
              <Typography variant="body" className="text-slate-600">
                You can export your data from the workspace settings. We support CSV, JSON, and PDF formats for different types of data.
              </Typography>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SupportPage;

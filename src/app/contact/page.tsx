'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  Building,
  HelpCircle,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitted(true);
    setIsSubmitting(false);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      type: 'general'
    });
  };

  const contactOptions = [
    {
      icon: Users,
      title: 'Job Seeker Support',
      description: 'Issues with AI matching or account settings?',
      email: 'hello@flumberico.com',
      color: 'text-neon-blue'
    },
    {
      icon: Building,
      title: 'Enterprise Inquiries',
      description: 'Want to integrate our AI into your hiring pipeline?',
      email: 'hello@flumberico.com',
      color: 'text-neon-purple'
    },
    {
      icon: HelpCircle,
      title: 'Technical Support',
      description: 'Bug reports or API integration help.',
      email: 'hello@flumberico.com',
      color: 'text-neon-pink'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center px-4">
        <div className="max-w-xl w-full text-center glass-card p-12 rounded-3xl border-neon-green/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-transparent pointer-events-none" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-neon-green/10 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-neon-green" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-4">Message Received!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Our AI agents have flagged your message for priority review. Expect a response within 24 hours.
          </p>

          <button
            onClick={() => setIsSubmitted(false)}
            className="px-8 py-3 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-xl font-semibold hover:bg-neon-blue/20 transition-all"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <div className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue mb-8">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">24/7 AI Support</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Get in Touch
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Whether you have a question about our Resume DNA engine, pricing, or just want to say hi,
            our team matches human empathy with AI efficiency.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Quick Contact Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 rounded-2xl border-border/50 hover:border-neon-blue/30 transition-all hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center mb-6 ${option.color}`}>
                <option.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{option.title}</h3>
              <p className="text-muted-foreground mb-4 text-sm">{option.description}</p>
              <a href={`mailto:${option.email}`} className={`font-medium hover:underline ${option.color}`}>
                {option.email}
              </a>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-3xl border-border/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5 pointer-events-none" />

            <h3 className="text-2xl font-bold mb-6 relative z-10">Send a Message</h3>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10 w-full">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue outline-none transition-all"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing & Pricing</option>
                  <option value="partnerships">Partnerships</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue outline-none transition-all"
                    placeholder="Alex Chen"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue outline-none transition-all"
                    placeholder="alex@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue outline-none transition-all"
                  placeholder="How can we help you?"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="futuristic-button w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Message <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="glass-card p-8 rounded-3xl border-border/50">
              <h3 className="text-xl font-bold mb-6">Direct Contact</h3>

              <div className="space-y-6">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=4976+Keyser+Ridge+Road+Greensboro+NC+27401"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center shrink-0 group-hover:bg-neon-blue/20 transition-colors">
                    <MapPin className="w-5 h-5 text-neon-blue" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1 group-hover:text-neon-blue transition-colors">HQ Location</h4>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      4976 Keyser Ridge Road<br />
                      Greensboro, NC 27401
                    </p>
                  </div>
                </a>

                <a
                  href="tel:13364573841"
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-neon-purple/10 flex items-center justify-center shrink-0 group-hover:bg-neon-purple/20 transition-colors">
                    <Phone className="w-5 h-5 text-neon-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1 group-hover:text-neon-purple transition-colors">Phone Support</h4>
                    <p className="text-sm text-muted-foreground mb-1 group-hover:text-foreground transition-colors">1 336-457-3841</p>
                    <p className="text-xs text-muted-foreground/60">Mon-Fri, 9am - 6pm EST</p>
                  </div>
                </a>

                <a
                  href="mailto:hello@flumberico.com"
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-neon-pink/10 flex items-center justify-center shrink-0 group-hover:bg-neon-pink/20 transition-colors">
                    <Mail className="w-5 h-5 text-neon-pink" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1 group-hover:text-neon-pink transition-colors">Email</h4>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">hello@flumberico.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Emergency Box */}
            <div className="glass-card p-6 rounded-2xl border-neon-orange/20 bg-neon-orange/5">
              <div className="flex items-center gap-3 mb-2 text-neon-orange">
                <Zap className="w-5 h-5" />
                <h3 className="font-bold">Priority Support?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Pro & Power users get access to our dedicated slack channel for <span className="text-foreground font-medium">10-minute response times</span>.
              </p>
              <a
                href="/pricing?plan=pro"
                className="text-sm font-medium text-neon-orange hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Upgrade Options <Zap className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
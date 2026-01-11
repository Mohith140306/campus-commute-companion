import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, CheckCircle2, Bus, User, Smartphone, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackCategory {
  id: string;
  value: 'bus' | 'driver' | 'app' | 'safety';
  label: string;
  description: string;
  icon: typeof Bus;
}

const feedbackCategories: FeedbackCategory[] = [
  {
    id: '1',
    value: 'bus',
    label: 'Bus',
    description: 'Condition, cleanliness, timing',
    icon: Bus,
  },
  {
    id: '2',
    value: 'driver',
    label: 'Driver',
    description: 'Behavior, driving, punctuality',
    icon: User,
  },
  {
    id: '3',
    value: 'app',
    label: 'App',
    description: 'Features, bugs, suggestions',
    icon: Smartphone,
  },
  {
    id: '4',
    value: 'safety',
    label: 'Safety',
    description: 'Safety concerns and issues',
    icon: Shield,
  },
];

export default function Feedback() {
  const [category, setCategory] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - will be replaced with Supabase
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock saving to backend
    const feedback = {
      id: Date.now().toString(),
      category,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log('Feedback:', feedback);

    setIsSubmitting(false);
    setIsSuccess(true);

    toast.success('Feedback submitted successfully!', {
      description: 'Thank you for your feedback.',
    });

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setCategory('');
      setMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Feedback" 
        subtitle="Share your suggestions and concerns"
      />

      <main className="px-4 -mt-4 pb-8 safe-bottom">
        <div className="container max-w-lg mx-auto">
          {/* Success State */}
          {isSuccess ? (
            <div className="card-elevated p-8 text-center animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-success/10 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection */}
              <div className="card-elevated p-4 animate-fade-in">
                <label className="block font-semibold text-foreground mb-3">
                  Select Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {feedbackCategories.map((cat, index) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        category === cat.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <cat.icon className={`w-6 h-6 mb-2 ${
                        category === cat.value ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div className="font-medium text-foreground">{cat.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{cat.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Message */}
              <div className="card-elevated p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <label className="block font-semibold text-foreground mb-3">
                  Your Feedback
                </label>
                <Textarea
                  placeholder="Share your thoughts, suggestions, or report any issues..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground mt-2 text-right">
                  {message.length}/500 characters
                </div>
              </div>

              {/* Submit Button */}
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Button
                  type="submit"
                  disabled={isSubmitting || !category || !message.trim()}
                  className="w-full gradient-accent text-accent-foreground"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>

              {/* Tips */}
              <div className="card-elevated p-4 bg-secondary/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Tips for Good Feedback</h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Be specific about the issue or suggestion</li>
                      <li>• Include bus number or route if applicable</li>
                      <li>• Mention date and time if reporting an incident</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

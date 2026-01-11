import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, CheckCircle2, Bus, User, Smartphone, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackCategory {
  id: string;
  value: 'bus' | 'driver' | 'app' | 'safety';
  label: string;
  description: string;
  icon: typeof Bus;
  bgClass: string;
}

const feedbackCategories: FeedbackCategory[] = [
  {
    id: '1',
    value: 'bus',
    label: 'Bus',
    description: 'Condition, cleanliness, timing',
    icon: Bus,
    bgClass: 'bg-blue-100 text-blue-600',
  },
  {
    id: '2',
    value: 'driver',
    label: 'Driver',
    description: 'Behavior, driving, punctuality',
    icon: User,
    bgClass: 'bg-green-100 text-green-600',
  },
  {
    id: '3',
    value: 'app',
    label: 'App',
    description: 'Features, bugs, suggestions',
    icon: Smartphone,
    bgClass: 'bg-purple-100 text-purple-600',
  },
  {
    id: '4',
    value: 'safety',
    label: 'Safety',
    description: 'Safety concerns and issues',
    icon: Shield,
    bgClass: 'bg-red-100 text-red-600',
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Feedback" 
        subtitle="Share your suggestions and report issues"
        icon={MessageSquare}
        iconColorClass="bg-blue-100 text-blue-600"
      />

      <main className="px-6 pb-8">
        <div className="container max-w-4xl mx-auto">
          {/* Success State */}
          {isSuccess ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <label className="block font-semibold text-foreground mb-3">
                  Select Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {feedbackCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        category === cat.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${cat.bgClass} flex items-center justify-center mb-2`}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <div className="font-medium text-foreground">{cat.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{cat.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Message */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
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
              <Button
                type="submit"
                disabled={isSubmitting || !category || !message.trim()}
                className="w-full h-12 bg-[hsl(190,55%,55%)] hover:bg-[hsl(190,55%,50%)] text-white text-base font-medium"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>

              {/* Tips */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
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

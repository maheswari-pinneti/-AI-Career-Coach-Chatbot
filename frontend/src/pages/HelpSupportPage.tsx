import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import {
  ChevronDown,
  Mail,
  Send,
  BookOpen,
} from 'lucide-react';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppInput } from '../components/common/AppInput';
import { AppTextarea } from '../components/common/AppTextarea';
import { AppToast } from '../components/common/AppToast';

const FAQS = [
  {
    q: 'How does the AI Resume Analyzer calculate the ATS score?',
    a: 'The engine parses standard sections (Contact, Experience, Skills, Education) and benchmarks the content against 20+ job description keywords, measuring keyword density, section readability, and quantifiable business outcomes.',
  },
  {
    q: 'What is the STAR framework used in the Interview Simulator?',
    a: 'STAR stands for Situation, Task, Action, and Result. It is the gold standard framework used by FAANG and enterprise interviewers to evaluate behavioral responses. The AI grades each of these 4 pillars independently.',
  },
  {
    q: 'How is user data privacy and isolation maintained?',
    a: 'The platform employs strict tenant isolation: every resume, mock interview session, and roadmap milestone is bound to your authenticated user ID. In production, row-level access control prevents unauthorized data cross-talk.',
  },
  {
    q: 'Can I connect my own OpenAI or Hugging Face API key?',
    a: 'Yes. In your backend environment settings (.env), you can configure AI_PROVIDER to openai or huggingface with your respective API keys. The application defaults to deterministic local mock responses for local testing.',
  },
];

export const HelpSupportPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setToastOpen(true);
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="Help, Support & Documentation"
        subtitle="Frequently asked questions, architecture documentation links, and engineering support."
        breadcrumbs={[{ label: 'Account' }, { label: 'Help & Support' }]}
        badge={<AppBadge label="Knowledge Hub" color="primary" variant="subtle" />}
      />

      <Grid container spacing={3}>
        {/* Left Column: FAQs */}
        <Grid item xs={12} md={7}>
          <AppCard title="Frequently Asked Questions" subtitle="Essential answers regarding AI features and methodology.">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {FAQS.map((faq, index) => (
                <Accordion
                  key={index}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px !important',
                    mb: 1,
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {faq.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {faq.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </AppCard>
        </Grid>

        {/* Right Column: Contact Support Form */}
        <Grid item xs={12} md={5}>
          <AppCard
            title="Contact Support"
            subtitle="Send feedback or report an issue directly to the platform team."
            avatar={
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover', color: 'primary.main', display: 'flex' }}>
                <Mail size={20} />
              </Box>
            }
          >
            <AppInput
              label="Subject"
              placeholder="e.g. Question about ATS score calculation"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              isRequired
            />

            <AppTextarea
              label="Description / Feedback"
              placeholder="Provide context or details..."
              minRows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              isRequired
            />

            <AppButton
              variant="primary"
              leftIcon={<Send size={16} />}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!subject.trim() || !message.trim()}
              fullWidth
            >
              Submit Ticket
            </AppButton>
          </AppCard>

          {/* Quick Docs Link Card */}
          <Paper variant="outlined" sx={{ p: 2.5, mt: 3, borderRadius: 2.5, bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BookOpen size={18} color="#6366f1" />
              <Typography variant="subtitle2" fontWeight={700}>
                Architecture Documentation
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Explore the detailed guides located in <code>docs/</code> covering System Architecture, Frontend Setup, Backend Factory, and Database Configuration.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <AppToast
        open={toastOpen}
        message="Support ticket submitted successfully. Our engineering team will review it."
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

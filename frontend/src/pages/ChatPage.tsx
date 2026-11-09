import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  Chip,
  CircularProgress,
  Alert,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import {
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Briefcase,
  Code2,
  FileText,
  Users2,
  GraduationCap,
  Compass,
  Menu as MenuIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { chatApi } from '../api/chatApi';
import { Persona, PersonaMode, ChatMessage } from '../types/chat';

const PERSONA_ICONS: Record<string, React.ReactNode> = {
  career_mentor: <Briefcase size={18} color="#6366f1" />,
  technical_mentor: <Code2 size={18} color="#0ea5e9" />,
  resume_coach: <FileText size={18} color="#10b981" />,
  interview_coach: <Users2 size={18} color="#f59e0b" />,
  learning_mentor: <GraduationCap size={18} color="#8b5cf6" />,
  career_switch: <Compass size={18} color="#ec4899" />,
};

export const ChatPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaMode>('career_mentor');
  const [inputText, setInputText] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  // 1. Fetch Personas
  const { data: personasData } = useQuery({
    queryKey: ['personas'],
    queryFn: chatApi.getPersonas,
  });

  // 2. Fetch Conversations
  const { data: convsData, isLoading: isLoadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
  });

  const conversations = convsData?.conversations || [];

  // Auto-select first conversation or handle active conversation
  const currentConversation = conversations.find((c) => c.id === activeConvId);

  // 3. Fetch active conversation messages
  const { data: convDetails, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['conversation-details', activeConvId],
    queryFn: () => chatApi.getConversationDetails(activeConvId!),
    enabled: Boolean(activeConvId),
  });

  const activeMessages: ChatMessage[] = convDetails?.conversation?.messages || [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  // 4. Create Conversation Mutation
  const createConvMutation = useMutation({
    mutationFn: chatApi.createConversation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setActiveConvId(data.conversation.id);
      setSelectedPersona(data.conversation.persona_mode);
      setMobileDrawerOpen(false);
    },
  });

  // 5. Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: ({ convId, text }: { convId: number; text: string }) =>
      chatApi.sendMessage(convId, text),
    onSuccess: () => {
      setLastFailedPrompt(null);
      queryClient.invalidateQueries({ queryKey: ['conversation-details', activeConvId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      setLastFailedPrompt(inputText);
    },
  });

  // 6. Regenerate Mutation
  const regenMutation = useMutation({
    mutationFn: (convId: number) => chatApi.regenerateResponse(convId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-details', activeConvId] });
    },
  });

  // 7. Delete Conversation Mutation
  const deleteMutation = useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (activeConvId === deletedId) {
        setActiveConvId(null);
      }
    },
  });

  const handleStartNewChat = (personaMode: PersonaMode = selectedPersona) => {
    const persona = personasData?.personas.find((p) => p.id === personaMode);
    createConvMutation.mutate({
      persona_mode: personaMode,
      title: `Consultation: ${persona?.name || 'Career Mentor'}`,
    });
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || sendMutation.isPending) return;

    if (!activeConvId) {
      // Create new conversation and immediately send message
      createConvMutation.mutate(
        {
          persona_mode: selectedPersona,
          title: text.slice(0, 35) + '...',
        },
        {
          onSuccess: (res) => {
            sendMutation.mutate({ convId: res.conversation.id, text });
            setInputText('');
          },
        }
      );
      return;
    }

    sendMutation.mutate({ convId: activeConvId, text });
    setInputText('');
  };

  const handleCopyMessage = (msgId: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activePersonaConfig: Persona | undefined = personasData?.personas.find(
    (p) => p.id === (currentConversation?.persona_mode || selectedPersona)
  );

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* New Consultation CTA */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <AppButton
          variant="primary"
          fullWidth
          leftIcon={<Plus size={16} />}
          onClick={() => handleStartNewChat(selectedPersona)}
          isLoading={createConvMutation.isPending}
        >
          New Consultation
        </AppButton>
      </Box>

      {/* Persona Selection Bar */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1 }}>
          SELECT COACH PERSONA
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {personasData?.personas.map((persona) => {
            const isSelected = selectedPersona === persona.id;
            return (
              <Box
                key={persona.id}
                onClick={() => {
                  setSelectedPersona(persona.id);
                  if (!activeConvId) {
                    handleStartNewChat(persona.id);
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.25,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: `1px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
                  bgcolor: isSelected
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(99,102,241,0.15)'
                      : 'rgba(99,102,241,0.08)'
                    : 'transparent',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                {PERSONA_ICONS[persona.id] || <Sparkles size={16} />}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" fontWeight={isSelected ? 700 : 500} noWrap>
                    {persona.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {persona.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ px: 1, mb: 1 }}>
          PAST THREADS ({conversations.length})
        </Typography>

        {isLoadingConvs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conversations.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ px: 1, py: 2, display: 'block' }}>
            No consultation history yet.
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <ListItem
                  key={conv.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(conv.id);
                      }}
                      sx={{ opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  }
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton
                    selected={isActive}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setSelectedPersona(conv.persona_mode);
                      setMobileDrawerOpen(false);
                    }}
                    sx={{
                      borderRadius: 1.5,
                      py: 1,
                      px: 1.5,
                      border: `1px solid ${isActive ? theme.palette.primary.main : 'transparent'}`,
                    }}
                  >
                    <ListItemText
                      primary={conv.title}
                      secondary={new Date(conv.created_at).toLocaleDateString()}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: isActive ? 700 : 500,
                        noWrap: true,
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        noWrap: true,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: 'calc(100vh - 120px)' }}>
      {/* Page Header */}
      <AppPageHeader
        title="AI Career Coach & Advisory"
        subtitle="Consult intelligent personas for interview rehearsal, ATS resume optimization, and promotion roadmaps."
        breadcrumbs={[{ label: 'AI Career Tools' }, { label: 'AI Career Coach' }]}
        actions={
          isMobile ? (
            <AppButton
              variant="outlined"
              size="small"
              leftIcon={<MenuIcon size={16} />}
              onClick={() => setMobileDrawerOpen(true)}
            >
              Threads & Personas
            </AppButton>
          ) : undefined
        }
      />

      {/* Main Container */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Box
            sx={{
              width: 320,
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.01)',
            }}
          >
            {sidebarContent}
          </Box>
        )}

        {/* Mobile Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{ sx: { width: 300 } }}
        >
          {sidebarContent}
        </Drawer>

        {/* Chat Feed & Composer Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat Window Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                {PERSONA_ICONS[currentConversation?.persona_mode || selectedPersona] || <Bot size={20} />}
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {activePersonaConfig?.name || 'Career Mentor'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentConversation?.title || 'Interactive AI Career Consultation'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AppBadge
                label={`Engine: ${currentConversation?.provider || 'Mock AI'}`}
                color="neutral"
                size="small"
              />
              <AppBadge label="Verified Coach" color="success" size="small" />
            </Box>
          </Box>

          {/* Messages Feed */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
            {isLoadingMessages ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={32} />
              </Box>
            ) : activeMessages.length === 0 ? (
              /* Empty Welcome Screen */
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  height: '100%',
                  maxWidth: 640,
                  mx: 'auto',
                  py: 4,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {PERSONA_ICONS[activePersonaConfig?.id || selectedPersona] || <Sparkles size={28} />}
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {activePersonaConfig?.title || 'Career Mentor Consultation'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {activePersonaConfig?.description}
                </Typography>

                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
                  SUGGESTED EXPLORATION PROMPTS:
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                  {activePersonaConfig?.starter_prompts.map((prompt, pIdx) => (
                    <Paper
                      key={pIdx}
                      variant="outlined"
                      onClick={() => handleSendMessage(prompt)}
                      sx={{
                        p: 1.5,
                        textAlign: 'left',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)',
                        },
                      }}
                    >
                      <Typography variant="body2" color="text.primary">
                        "{prompt}"
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {activeMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.25,
                          maxWidth: { xs: '90%', sm: '82%' },
                          flexDirection: isUser ? 'row-reverse' : 'row',
                        }}
                      >
                        {/* Avatar */}
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            bgcolor: isUser ? 'primary.main' : 'background.paper',
                            color: isUser ? '#ffffff' : 'primary.main',
                            border: `1px solid ${isUser ? 'transparent' : theme.palette.divider}`,
                          }}
                        >
                          {isUser ? <User size={16} /> : <Bot size={16} />}
                        </Box>

                        {/* Message Bubble */}
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: isUser
                              ? 'primary.main'
                              : theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.04)'
                                : 'rgba(0,0,0,0.02)',
                            color: isUser ? '#ffffff' : 'text.primary',
                            border: `1px solid ${isUser ? 'transparent' : theme.palette.divider}`,
                          }}
                        >
                          {isUser ? (
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              {msg.content}
                            </Typography>
                          ) : (
                            <MarkdownRenderer content={msg.content} />
                          )}
                        </Paper>
                      </Box>

                      {/* Message Footer Actions */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 0.5,
                          px: 5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>

                        {!isUser && (
                          <>
                            <Tooltip title={copiedId === msg.id ? 'Copied' : 'Copy Message'}>
                              <IconButton
                                size="small"
                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                sx={{ p: 0.5 }}
                              >
                                {copiedId === msg.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Regenerate Response">
                              <IconButton
                                size="small"
                                onClick={() => regenMutation.mutate(activeConvId!)}
                                disabled={regenMutation.isPending}
                                sx={{ p: 0.5 }}
                              >
                                <RotateCcw size={12} />
                              </IconButton>
                            </Tooltip>

                            {msg.total_tokens ? (
                              <Chip
                                label={`${msg.total_tokens} tokens • ${msg.latency_ms}ms`}
                                size="small"
                                sx={{ height: 18, fontSize: '0.625rem' }}
                              />
                            ) : null}
                          </>
                        )}
                      </Box>
                    </Box>
                  );
                })}

                {/* Generating / Typing Indicator */}
                {(sendMutation.isPending || regenMutation.isPending) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                      }}
                    >
                      <Bot size={16} />
                    </Box>
                    <Paper
                      variant="outlined"
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <CircularProgress size={14} color="primary" />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        AI Career Coach is analyzing your prompt...
                      </Typography>
                    </Paper>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>
            )}
          </Box>

          {/* Error Banner */}
          {lastFailedPrompt && (
            <Alert
              severity="error"
              action={
                <AppButton
                  size="small"
                  variant="outlined"
                  onClick={() => handleSendMessage(lastFailedPrompt)}
                >
                  Retry Request
                </AppButton>
              }
              sx={{ mx: 2, mb: 1, borderRadius: 2 }}
            >
              Failed to connect with AI coach engine. Please click Retry.
            </Alert>
          )}

          {/* Message Composer Area */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.01)',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                p: 1.5,
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                '&:focus-within': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask ${activePersonaConfig?.name || 'Career Coach'} about resumes, STAR interviews, promotions...`}
                rows={2}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  backgroundColor: 'transparent',
                  color: 'inherit',
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <AppButton
                  variant="primary"
                  size="small"
                  onClick={() => handleSendMessage()}
                  isLoading={sendMutation.isPending || createConvMutation.isPending}
                  disabled={!inputText.trim()}
                  rightIcon={<Send size={14} />}
                >
                  Send
                </AppButton>
              </Box>
            </Paper>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, textAlign: 'center' }}>
              Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line. AI advice is indicative and adheres to ethical career mentoring guardrails.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

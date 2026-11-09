import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, useTheme, Theme } from '@mui/material';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const theme = useTheme();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, wordBreak: 'break-word' }}>
      {parts.map((part, partIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const language = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : '';
          const codeBody = (language ? lines.slice(1) : lines).join('\n');

          return (
            <Paper
              key={partIdx}
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#1e293b',
                color: '#f8fafc',
                my: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 0.75,
                  bgcolor: theme.palette.mode === 'dark' ? '#090d16' : '#0f172a',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94a3b8' }}>
                  {language || 'code'}
                </Typography>
                <Tooltip title={copiedIndex === partIdx ? 'Copied!' : 'Copy Code'}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyCode(codeBody, partIdx)}
                    sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
                  >
                    {copiedIndex === partIdx ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  overflowX: 'auto',
                }}
              >
                <code>{codeBody}</code>
              </Box>
            </Paper>
          );
        }

        // Render standard markdown lines
        const paragraphs = part.split(/\n\n+/);
        return (
          <React.Fragment key={partIdx}>
            {paragraphs.map((p, pIdx) => {
              const trimmed = p.trim();
              if (!trimmed) return null;

              // Headers
              if (trimmed.startsWith('### ')) {
                return (
                  <Typography key={pIdx} variant="subtitle1" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
                    {trimmed.replace(/^###\s+/, '')}
                  </Typography>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <Typography key={pIdx} variant="h6" fontWeight={700} sx={{ mt: 1.5, mb: 0.5 }}>
                    {trimmed.replace(/^##\s+/, '')}
                  </Typography>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <Typography key={pIdx} variant="h5" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
                    {trimmed.replace(/^#\s+/, '')}
                  </Typography>
                );
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <Box
                    key={pIdx}
                    sx={{
                      borderLeft: `3px solid ${theme.palette.primary.main}`,
                      pl: 2,
                      py: 0.5,
                      my: 1,
                      fontStyle: 'italic',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)',
                      borderRadius: '0 8px 8px 0',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {trimmed.replace(/^>\s+/, '').replace(/\*/g, '')}
                    </Typography>
                  </Box>
                );
              }

              // Bullet lists
              if (trimmed.includes('\n- ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const listItems = trimmed
                  .split(/\n[-*]\s+/)
                  .map((item) => item.replace(/^[-*]\s+/, '').trim())
                  .filter(Boolean);

                return (
                  <Box component="ul" key={pIdx} sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {listItems.map((li, liIdx) => (
                      <Typography component="li" key={liIdx} variant="body2">
                        {renderInlineFormatting(li, theme)}
                      </Typography>
                    ))}
                  </Box>
                );
              }

              return (
                <Typography key={pIdx} variant="body2" sx={{ lineHeight: 1.65 }}>
                  {renderInlineFormatting(trimmed, theme)}
                </Typography>
              );
            })}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

function renderInlineFormatting(text: string, theme: Theme): React.ReactNode {
  // Simple token parser for **bold** and `code`
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={idx} style={{ fontWeight: 700 }}>
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={idx}
          style={{
            fontFamily: 'monospace',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            padding: '2px 5px',
            borderRadius: '4px',
            fontSize: '0.85em',
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}

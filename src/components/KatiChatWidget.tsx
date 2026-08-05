import React, { useState, useRef, useEffect } from 'react';
import { KatiChatMessage, CompanyTenant, User } from '../types';
import { sendKatiChatMessage } from '../services/api';
import { Sparkles, Send, FileText, ExternalLink, Mail, CheckCircle, RefreshCw, Bot, User as UserIcon } from 'lucide-react';

interface KatiChatWidgetProps {
  tenant: CompanyTenant;
  currentUser: User | null;
  onSelectActionForm?: (formName: string) => void;
}

export const KatiChatWidget: React.FC<KatiChatWidgetProps> = ({
  tenant,
  currentUser,
  onSelectActionForm,
}) => {
  const [messages, setMessages] = useState<KatiChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'kati',
      text: tenant.katiConfig.customGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'What is our PTO & leave policy?', actionType: 'suggested_question', value: 'What is our PTO & vacation allowance?' },
        { label: 'How do health benefits & 401k work?', actionType: 'suggested_question', value: 'Explain our health insurance and 401k match details.' },
        { label: 'Remote work stipend details', actionType: 'suggested_question', value: 'What is our remote work & home office stipend?' },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: KatiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const katiReply = await sendKatiChatMessage(
        tenant.id,
        textToSend,
        currentUser?.name || 'Employee',
        currentUser?.role || 'employee'
      );
      setMessages((prev) => [...prev, katiReply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'kati',
          text: `I apologize, I encountered a connection issue. Please contact ${tenant.katiConfig.escalationEmail} directly or try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: { label: string; actionType: string; value: string }) => {
    if (action.actionType === 'suggested_question') {
      handleSend(action.value);
    } else if (action.actionType === 'form' && onSelectActionForm) {
      onSelectActionForm(action.value);
    } else if (action.actionType === 'escalate') {
      window.location.href = `mailto:${action.value}?subject=Kati HR Escalation from ${currentUser?.name || 'Employee'}`;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-xl">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white">{tenant.katiConfig.botName}</span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-300">
              Isolated AI HR Assistant &bull; {tenant.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-teal-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 font-bold">
            Tone: {tenant.katiConfig.tone}
          </span>
        </div>
      </div>

      {/* Messages Scroll Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'kati' && (
              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 mt-1 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs space-y-2 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none shadow-md font-medium'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm font-medium'
              }`}
            >
              {/* Message text with whitespace preservation */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Citations if available */}
              {msg.policyCitations && msg.policyCitations.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-teal-600" />
                    <span>Policy Citation Sources ({tenant.name}):</span>
                  </span>
                  {msg.policyCitations.map((cite, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] space-y-0.5"
                    >
                      <span className="font-bold text-slate-900">{cite.policyTitle} ({cite.section})</span>
                      <p className="text-slate-600 italic font-mono text-[10px] line-clamp-2">
                        &quot;{cite.relevanceSnippet}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(act)}
                      className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1"
                    >
                      {act.actionType === 'escalate' && <Mail className="w-3 h-3 text-rose-600" />}
                      {act.actionType === 'form' && <CheckCircle className="w-3 h-3 text-teal-600" />}
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] ${
                  msg.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400 text-left'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-teal-700 font-bold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Kati is searching {tenant.name} policy knowledge base...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Shortcuts */}
      <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-bold shrink-0">Quick Topics:</span>
        <button
          onClick={() => handleSend('What is our PTO & vacation allowance?')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-700 font-semibold whitespace-nowrap shadow-xs"
        >
          🌴 PTO Rules
        </button>
        <button
          onClick={() => handleSend('What remote work stipend do we get?')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-700 font-semibold whitespace-nowrap shadow-xs"
        >
          💻 WFH Stipend
        </button>
        <button
          onClick={() => handleSend('How does 401k matching work?')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-700 font-semibold whitespace-nowrap shadow-xs"
        >
          📈 401(k) Match
        </button>
      </div>

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask Kati AI HR about ${tenant.name} policies...`}
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="p-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all shadow-md font-extrabold"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

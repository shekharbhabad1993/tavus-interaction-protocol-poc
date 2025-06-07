import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Video, Mic, MicOff, Settings, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { DailyCall } from '@daily-co/daily-js';

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface Message {
  id: number;
  sender: 'user' | 'replica' | 'system';
  text: string;
  timestamp: string;
}

const TavusPOC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationUrl, setConversationUrl] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState('');
  
  const callRef = useRef<DailyCall | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Inline styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    } as React.CSSProperties,
    header: {
      marginBottom: '32px'
    } as React.CSSProperties,
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px'
    } as React.CSSProperties,
    subtitle: {
      color: '#6b7280'
    } as React.CSSProperties,
    configSection: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px'
    } as React.CSSProperties,
    configTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    } as React.CSSProperties,
    inputGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    } as React.CSSProperties,
    inputField: {
      display: 'flex',
      flexDirection: 'column'
    } as React.CSSProperties,
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    } as React.CSSProperties,
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s'
    } as React.CSSProperties,
    statusBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    } as React.CSSProperties,
    statusIndicator: {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    } as React.CSSProperties,
    statusConnected: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    } as React.CSSProperties,
    statusConnecting: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    } as React.CSSProperties,
    statusDisconnected: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    } as React.CSSProperties,
    statusError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    } as React.CSSProperties,
    button: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s'
    } as React.CSSProperties,
    buttonPrimary: {
      backgroundColor: '#3b82f6',
      color: 'white'
    } as React.CSSProperties,
    buttonDanger: {
      backgroundColor: '#ef4444',
      color: 'white'
    } as React.CSSProperties,
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    } as React.CSSProperties,
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px'
    } as React.CSSProperties,
    section: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '16px'
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    } as React.CSSProperties,
    videoContainer: {
      width: '100%',
      height: '400px',
      backgroundColor: '#000',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #e5e7eb'
    } as React.CSSProperties,
    videoPlaceholder: {
      textAlign: 'center' as const,
      color: '#9ca3af'
    },
    controls: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '16px',
      gap: '8px'
    } as React.CSSProperties,
    controlButton: {
      padding: '8px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer'
    } as React.CSSProperties,
    messagesContainer: {
      height: '300px',
      overflowY: 'auto' as const,
      marginBottom: '16px',
      padding: '12px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '6px'
    },
    messagesPlaceholder: {
      textAlign: 'center' as const,
      color: '#6b7280',
      paddingTop: '64px',
      paddingBottom: '64px'
    },
    messageRow: {
      marginBottom: '12px'
    } as React.CSSProperties,
    messageRightAlign: {
      textAlign: 'right' as const
    },
    messageLeftAlign: {
      textAlign: 'left' as const
    },
    messageUser: {
      display: 'inline-block',
      maxWidth: '70%',
      padding: '8px 12px',
      borderRadius: '8px',
      backgroundColor: '#3b82f6',
      color: 'white'
    } as React.CSSProperties,
    messageReplica: {
      display: 'inline-block',
      maxWidth: '70%',
      padding: '8px 12px',
      borderRadius: '8px',
      backgroundColor: '#e5e7eb',
      color: '#1f2937'
    } as React.CSSProperties,
    messageSystem: {
      display: 'inline-block',
      maxWidth: '70%',
      padding: '8px 12px',
      borderRadius: '8px',
      backgroundColor: '#fef3c7',
      color: '#92400e'
    } as React.CSSProperties,
    messageText: {
      fontSize: '0.875rem',
      margin: '0'
    } as React.CSSProperties,
    messageTime: {
      fontSize: '0.75rem',
      opacity: 0.7,
      marginTop: '4px'
    } as React.CSSProperties,
    messageSender: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '4px'
    } as React.CSSProperties,
    inputRow: {
      display: 'flex',
      gap: '8px'
    } as React.CSSProperties,
    messageInput: {
      flex: 1,
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none'
    } as React.CSSProperties,
    sendButton: {
      padding: '12px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    } as React.CSSProperties,
    errorAlert: {
      marginTop: '16px',
      padding: '12px',
      backgroundColor: '#fee2e2',
      border: '1px solid #fca5a5',
      color: '#991b1b',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    } as React.CSSProperties,
    instructions: {
      marginTop: '32px',
      backgroundColor: '#eff6ff',
      borderRadius: '8px',
      padding: '24px'
    } as React.CSSProperties,
    instructionsTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1e40af',
      marginBottom: '12px'
    } as React.CSSProperties,
    instructionsList: {
      color: '#1e40af',
      lineHeight: '1.6'
    } as React.CSSProperties
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Daily SDK and initialize connection
  const initializeCall = async () => {
    if (!conversationUrl || !conversationId) {
      setError('Please provide both Conversation URL and Conversation ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setConnectionStatus('connecting');

    try {
      // Dynamically import Daily
      const DailyIframe = (await import('@daily-co/daily-js')).default;
      
      // Create Daily frame
      callRef.current = DailyIframe.createFrame({
        iframeStyle: {
          width: '100%',
          height: '400px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          backgroundColor: '#000'
        }
      });

      // Append to container
      if (containerRef.current && callRef.current) {
        containerRef.current.innerHTML = '';
        const iframe = callRef.current.iframe();
        if (iframe) {
          containerRef.current.appendChild(iframe);
        }
      }

      // Set up event listeners
      callRef.current?.on('joined-meeting', () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setIsLoading(false);
        addMessage('system', 'Connected to Tavus conversation');
      });

      callRef.current?.on('left-meeting', () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        addMessage('system', 'Disconnected from conversation');
      });

      callRef.current?.on('error', (errorEvent: any) => {
        setError(`Connection error: ${errorEvent.message || 'Unknown error'}`);
        setConnectionStatus('error');
        setIsLoading(false);
      });

      // Handle incoming app messages
      callRef.current?.on('app-message', (event: any) => {
        console.log('Received app message:', event);
        
        if (event.data) {
          const messageData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          
          // Add received message to chat
          if (messageData.properties?.text) {
            addMessage('replica', messageData.properties.text);
          }
          
          // Handle different event types
          switch (messageData.event_type) {
            case 'conversation.replica_speaking':
              addMessage('system', 'Replica is speaking...');
              break;
            case 'conversation.replica_finished':
              addMessage('system', 'Replica finished speaking');
              break;
            default:
              console.log('Unhandled event type:', messageData.event_type);
          }
        }
      });

      // Join the conversation
      await callRef.current.join({
        url: conversationUrl,
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to initialize: ${err.message}`);
      } else {
        setError('Failed to initialize: Unknown error');
      }
      setConnectionStatus('error');
      setIsLoading(false);
    }
  };

  // Disconnect from call
  const disconnectCall = async () => {
    if (callRef.current) {
      try {
        await callRef.current.leave();
        callRef.current.destroy();
        callRef.current = null;
        setIsConnected(false);
        setConnectionStatus('disconnected');
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error('Error disconnecting:', err.message);
        } else {
          console.error('Error disconnecting: unknown error');
        }
      }
    }
  };

  // Send message to replica
  const sendMessage = () => {
    if (!message.trim() || !callRef.current || !isConnected) return;

    const interaction = {
      message_type: 'conversation',
      event_type: 'conversation.echo',
      conversation_id: conversationId,
      properties: {
        text: message
      }
    };

    try {
      callRef.current.sendAppMessage(interaction, '*');
      addMessage('user', message);
      console.log('Sent message:', interaction);
      setMessage('');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to send message: ${err.message}`);
      } else {
        setError('Failed to send message: Unknown error');
      }
    }
  };

  // Add message to chat
  const addMessage = (sender: 'user' | 'replica' | 'system', text: string) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle mute (placeholder - would need actual implementation)
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, you'd call callRef.current.setLocalAudio(!isMuted)
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Tavus Interactions Protocol POC</h1>
        <p style={styles.subtitle}>Test real-time interactions with Tavus digital replicas</p>
      </div>

      {/* Configuration Section */}
      <div style={styles.configSection}>
        <h2 style={styles.configTitle}>
          <Settings size={20} />
          Configuration
        </h2>
        
        <div style={styles.inputGrid}>
          <div style={styles.inputField}>
            <label style={styles.label}>
              Conversation URL
            </label>
            <input
              type="text"
              value={conversationUrl}
              onChange={(e) => setConversationUrl(e.target.value)}
              placeholder="https://your-tavus-conversation-url.com"
              style={{
                ...styles.input,
                ...(isConnected ? styles.buttonDisabled : {})
              }}
              disabled={isConnected}
            />
          </div>
          
          <div style={styles.inputField}>
            <label style={styles.label}>
              Conversation ID
            </label>
            <input
              type="text"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              placeholder="your-conversation-id"
              style={{
                ...styles.input,
                ...(isConnected ? styles.buttonDisabled : {})
              }}
              disabled={isConnected}
            />
          </div>
        </div>

        <div style={styles.statusBar}>
          <div>
            <div style={{
              ...styles.statusIndicator,
              ...(connectionStatus === 'connected' ? styles.statusConnected :
                 connectionStatus === 'connecting' ? styles.statusConnecting :
                 connectionStatus === 'error' ? styles.statusError :
                 styles.statusDisconnected)
            }}>
              {connectionStatus === 'connected' && <CheckCircle size={16} />}
              {connectionStatus === 'connecting' && <Loader size={16} />}
              {connectionStatus === 'error' && <AlertCircle size={16} />}
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </div>
          </div>
          
          <div>
            {!isConnected ? (
              <button
                onClick={initializeCall}
                disabled={isLoading || !conversationUrl || !conversationId}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(isLoading || !conversationUrl || !conversationId ? styles.buttonDisabled : {})
                }}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Video size={16} />
                    Connect
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={disconnectCall}
                style={{
                  ...styles.button,
                  ...styles.buttonDanger
                }}
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Main Interface */}
      <div style={styles.mainGrid}>
        {/* Video Container */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Video size={20} />
            Video Feed
          </h3>
          <div 
            ref={containerRef} 
            style={styles.videoContainer}
          >
            {!isConnected && (
              <div style={styles.videoPlaceholder}>
                <Video size={48} style={{marginBottom: '8px', opacity: 0.5}} />
                <p>Connect to start video conversation</p>
              </div>
            )}
          </div>
          
          {/* Controls */}
          {isConnected && (
            <div style={styles.controls}>
              <button
                onClick={toggleMute}
                style={{
                  ...styles.controlButton,
                  backgroundColor: isMuted ? '#ef4444' : '#e5e7eb',
                  color: isMuted ? 'white' : '#374151'
                }}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <MessageCircle size={20} />
            Conversation Log
          </h3>
          
          {/* Messages */}
          <div style={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div style={styles.messagesPlaceholder}>
                <MessageCircle size={32} style={{marginBottom: '8px', opacity: 0.5}} />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{
                    ...styles.messageRow,
                    ...(msg.sender === 'user' ? styles.messageRightAlign : styles.messageLeftAlign)
                  }}
                >
                  <div style={
                    msg.sender === 'user' ? styles.messageUser :
                    msg.sender === 'replica' ? styles.messageReplica :
                    styles.messageSystem
                  }>
                    <p style={styles.messageText}>{msg.text}</p>
                    <p style={styles.messageTime}>{msg.timestamp}</p>
                  </div>
                  <div style={{
                    ...styles.messageSender,
                    ...(msg.sender === 'user' ? styles.messageRightAlign : styles.messageLeftAlign)
                  }}>
                    {msg.sender === 'user' ? 'You' : msg.sender === 'replica' ? 'Replica' : 'System'}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={styles.inputRow}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={{
                ...styles.messageInput,
                ...(isConnected ? {} : styles.buttonDisabled)
              }}
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || !isConnected}
              style={{
                ...styles.sendButton,
                ...(!message.trim() || !isConnected ? styles.buttonDisabled : {})
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={styles.instructions}>
        <h3 style={styles.instructionsTitle}>Getting Started</h3>
        <ol style={styles.instructionsList}>
          <li>1. Sign up for a Tavus account and create a replica</li>
          <li>2. Get your conversation URL from the Tavus dashboard</li>
          <li>3. Enter your conversation URL and ID in the configuration section</li>
          <li>4. Click "Connect" to establish the connection</li>
          <li>5. Start typing messages to interact with your replica</li>
        </ol>
      </div>
    </div>
  );
};

export default TavusPOC;
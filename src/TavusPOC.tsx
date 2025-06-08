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
  const [error, setError] = useState('');  const [showVideo, setShowVideo] = useState(false);
  
  // Interaction controls state
  const [echoText, setEchoText] = useState('');
  const [respondText, setRespondText] = useState('');
  const [contextText, setContextText] = useState('');
  const [pauseSensitivity, setPauseSensitivity] = useState<'low' | 'medium' | 'high'>('medium');
  const [interruptSensitivity, setInterruptSensitivity] = useState<'low' | 'medium' | 'high'>('medium');
  
  const callRef = useRef<DailyCall | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
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
      border: '1px solid #e5e7eb',
      position: 'relative'
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (callRef.current) {
        try {
          callRef.current.destroy();
          callRef.current = null;
        } catch (err) {
          console.error('Error cleaning up Daily call:', err);
        }
      }
    };
  }, []);

  // Mount the Daily frame in the video container
  useEffect(() => {
    if (showVideo && videoContainerRef.current && callRef.current) {
      try {
        // Only append if not already present
        const existingFrame = videoContainerRef.current.querySelector('iframe');
        if (!existingFrame) {
          const frameElement = callRef.current.iframe();
          if (frameElement) {
            frameElement.style.width = '100%';
            frameElement.style.height = '100%';
            frameElement.style.border = 'none';
            frameElement.style.borderRadius = '8px';
            videoContainerRef.current.appendChild(frameElement);
          }
        }
      } catch (err) {
        console.error('Error mounting video frame:', err);
      }
    }
  }, [showVideo]);
  // Load Daily SDK and initialize connection
  const initializeCall = async () => {
    if (!conversationUrl || !conversationId) {
      setError('Please provide both Conversation URL and Conversation ID');
      return;
    }

    // Basic URL validation
    try {
      new URL(conversationUrl);
    } catch {
      setError('Please enter a valid URL (e.g., https://domain.daily.co/room-name)');
      return;
    }

    setIsLoading(true);
    setError('');
    setConnectionStatus('connecting');
    addMessage('system', 'Initializing connection...');

    try {
      // Dynamically import Daily
      const DailyIframe = (await import('@daily-co/daily-js')).default;
      
      addMessage('system', 'Daily SDK loaded, creating frame...');
      
      // Create Daily frame with container specified
      const frame = DailyIframe.createFrame(videoContainerRef.current!, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: '#000'
        },
        showLeaveButton: false,
        showFullscreenButton: false
      });
      
      callRef.current = frame;
      setShowVideo(true);
      addMessage('system', 'Video frame created, setting up listeners...');      // Set up event listeners
      frame.on('joined-meeting', () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setIsLoading(false);
        addMessage('system', 'Successfully connected to Tavus conversation!');
      });

      frame.on('left-meeting', () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setShowVideo(false);
        addMessage('system', 'Disconnected from conversation');
      });

      frame.on('error', (errorEvent: any) => {
        console.error('Daily error:', errorEvent);
        setError(`Connection error: ${errorEvent.message || errorEvent.errorMsg || 'Unknown error'}`);
        setConnectionStatus('error');
        setIsLoading(false);
        setShowVideo(false);
        addMessage('system', `Error: ${errorEvent.message || 'Connection failed'}`);
      });

      frame.on('loading', () => {
        addMessage('system', 'Loading video call...');
      });

      frame.on('loaded', () => {
        addMessage('system', 'Video call interface loaded');
      });

      // Handle incoming app messages
      frame.on('app-message', (event: any) => {
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
      });      // Join the conversation
      addMessage('system', `Attempting to join: ${conversationUrl}`);
      await frame.join({
        url: conversationUrl,
      });

    } catch (err) {
      console.error('Initialization error:', err);
      if (err instanceof Error) {
        setError(`Failed to initialize: ${err.message}`);
        addMessage('system', `Failed to initialize: ${err.message}`);
      } else {
        setError('Failed to initialize: Unknown error');
        addMessage('system', 'Failed to initialize: Unknown error');
      }
      setConnectionStatus('error');
      setIsLoading(false);
      setShowVideo(false);
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
        setShowVideo(false);
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

  // Interaction Protocol Functions
  
  // Echo Interaction - Make replica say exact text
  const sendEchoInteraction = () => {
    if (!echoText.trim() || !callRef.current || !isConnected) return;

    const interaction = {
      message_type: 'conversation',
      event_type: 'conversation.echo',
      conversation_id: conversationId,
      properties: {
        text: echoText
      }
    };

    try {
      callRef.current.sendAppMessage(interaction, '*');
      addMessage('system', `Echo: "${echoText}"`);
      console.log('Sent echo interaction:', interaction);
      setEchoText('');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to send echo: ${err.message}`);
      } else {
        setError('Failed to send echo: Unknown error');
      }
    }
  };

  // Respond Interaction - Send text for replica to respond to
  const sendRespondInteraction = () => {
    if (!respondText.trim() || !callRef.current || !isConnected) return;

    const interaction = {
      message_type: 'conversation',
      event_type: 'conversation.respond',
      conversation_id: conversationId,
      properties: {
        text: respondText
      }
    };

    try {
      callRef.current.sendAppMessage(interaction, '*');
      addMessage('system', `Respond to: "${respondText}"`);
      console.log('Sent respond interaction:', interaction);
      setRespondText('');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to send respond: ${err.message}`);
      } else {
        setError('Failed to send respond: Unknown error');
      }
    }
  };

  // Interrupt Interaction - Stop replica from talking
  const sendInterruptInteraction = () => {
    if (!callRef.current || !isConnected) return;

    const interaction = {
      message_type: 'conversation',
      event_type: 'conversation.interrupt',
      conversation_id: conversationId,
      properties: {}
    };

    try {
      callRef.current.sendAppMessage(interaction, '*');
      addMessage('system', 'Interrupted replica');
      console.log('Sent interrupt interaction:', interaction);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to send interrupt: ${err.message}`);
      } else {
        setError('Failed to send interrupt: Unknown error');
      }
    }
  };

  // Overwrite Context Interaction - Change conversational context
  const sendContextInteraction = () => {
    if (!contextText.trim() || !callRef.current || !isConnected) return;

    const interaction = {
      message_type: 'conversation',
      event_type: 'conversation.overwrite_context',
      conversation_id: conversationId,
      properties: {
        context: contextText
      }
    };

    try {
      callRef.current.sendAppMessage(interaction, '*');
      addMessage('system', `Context updated: "${contextText.substring(0, 50)}..."`);
      console.log('Sent context interaction:', interaction);
      setContextText('');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to send context: ${err.message}`);
      } else {
        setError('Failed to send context: Unknown error');
      }
    }
  };

  // Sensitivity Interaction - Update VAD sensitivity
  const sendSensitivityInteraction = () => {
    if (!callRef.current || !isConnected) return;

    const interaction = {
      message_type: 'conversation',
      event_type: 'conversation.sensitivity',
      conversation_id: conversationId,
      properties: {
        participant_pause_sensitivity: pauseSensitivity,
        participant_interrupt_sensitivity: interruptSensitivity
      }
    };

    try {
      callRef.current.sendAppMessage(interaction, '*');
      addMessage('system', `Sensitivity updated: Pause=${pauseSensitivity}, Interrupt=${interruptSensitivity}`);
      console.log('Sent sensitivity interaction:', interaction);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to send sensitivity: ${err.message}`);
      } else {
        setError('Failed to send sensitivity: Unknown error');
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
    if (callRef.current) {
      callRef.current.setLocalAudio(!isMuted);
    }
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
            </label>            <input
              type="text"
              value={conversationUrl}
              onChange={(e) => setConversationUrl(e.target.value)}
              placeholder="https://domain.daily.co/room-name"
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
            </label>            <input
              type="text"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              placeholder="tavus-conversation-123"
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
        </div>        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Interaction Protocol Controls */}
      {isConnected && (
        <div style={styles.configSection}>
          <h2 style={styles.configTitle}>
            <Settings size={20} />
            Interaction Protocol Controls
          </h2>
          
          {/* Echo Interaction */}
          <div style={{marginBottom: '20px'}}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>
              Echo Interaction
            </h4>
            <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px'}}>
              Make the replica say exactly what you type
            </p>
            <div style={styles.inputRow}>
              <input
                type="text"
                value={echoText}
                onChange={(e) => setEchoText(e.target.value)}
                placeholder="Text for replica to say exactly..."
                style={styles.messageInput}
              />
              <button
                onClick={sendEchoInteraction}
                disabled={!echoText.trim()}
                style={{
                  ...styles.sendButton,
                  ...(!echoText.trim() ? styles.buttonDisabled : {})
                }}
              >
                Echo
              </button>
            </div>
          </div>

          {/* Respond Interaction */}
          <div style={{marginBottom: '20px'}}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>
              Text Respond Interaction
            </h4>
            <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px'}}>
              Send text that the replica will respond to (as if user said it)
            </p>
            <div style={styles.inputRow}>
              <input
                type="text"
                value={respondText}
                onChange={(e) => setRespondText(e.target.value)}
                placeholder="Text for replica to respond to..."
                style={styles.messageInput}
              />
              <button
                onClick={sendRespondInteraction}
                disabled={!respondText.trim()}
                style={{
                  ...styles.sendButton,
                  ...(!respondText.trim() ? styles.buttonDisabled : {})
                }}
              >
                Respond
              </button>
            </div>
          </div>

          {/* Interrupt Interaction */}
          <div style={{marginBottom: '20px'}}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>
              Interrupt Interaction
            </h4>
            <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px'}}>
              Stop the replica from talking immediately
            </p>
            <button
              onClick={sendInterruptInteraction}
              style={{
                ...styles.button,
                ...styles.buttonDanger
              }}
            >
              <AlertCircle size={16} />
              Interrupt Replica
            </button>
          </div>

          {/* Overwrite Context Interaction */}
          <div style={{marginBottom: '20px'}}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>
              Overwrite Conversational Context
            </h4>
            <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px'}}>
              Change the conversational context that the replica uses to generate responses
            </p>
            <div style={styles.inputRow}>
              <textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="New conversational context for the replica..."
                style={{
                  ...styles.messageInput,
                  minHeight: '80px',
                  resize: 'vertical' as const
                }}
              />
              <button
                onClick={sendContextInteraction}
                disabled={!contextText.trim()}
                style={{
                  ...styles.sendButton,
                  ...(!contextText.trim() ? styles.buttonDisabled : {}),
                  alignSelf: 'flex-start'
                }}
              >
                Update Context
              </button>
            </div>
          </div>

          {/* Sensitivity Interaction */}
          <div style={{marginBottom: '20px'}}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>
              Sensitivity Interaction (VAD)
            </h4>
            <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '12px'}}>
              Adjust Voice Activity Detection sensitivity for pauses and interruptions
            </p>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '12px'}}>
              <div>
                <label style={styles.label}>Pause Sensitivity</label>
                <select
                  value={pauseSensitivity}
                  onChange={(e) => setPauseSensitivity(e.target.value as 'low' | 'medium' | 'high')}
                  style={{
                    ...styles.input,
                    cursor: 'pointer'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label style={styles.label}>Interrupt Sensitivity</label>
                <select
                  value={interruptSensitivity}
                  onChange={(e) => setInterruptSensitivity(e.target.value as 'low' | 'medium' | 'high')}
                  style={{
                    ...styles.input,
                    cursor: 'pointer'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div style={{display: 'flex', alignItems: 'end'}}>
                <button
                  onClick={sendSensitivityInteraction}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    width: '100%'
                  }}
                >
                  Update Sensitivity
                </button>
              </div>
            </div>
            
            <div style={{fontSize: '0.75rem', color: '#6b7280'}}>
              <strong>Low:</strong> Less sensitive (longer pauses needed)<br/>
              <strong>Medium:</strong> Balanced sensitivity<br/>
              <strong>High:</strong> More sensitive (shorter pauses trigger detection)
            </div>
          </div>
        </div>
      )}

      {/* Main Interface */}
      <div style={styles.mainGrid}>
        {/* Video Container */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Video size={20} />
            Video Feed
          </h3>
          <div 
            ref={videoContainerRef} 
            style={styles.videoContainer}
          >
            {!showVideo && (
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
      </div>      {/* Instructions */}
      <div style={styles.instructions}>
        <h3 style={styles.instructionsTitle}>Getting Started</h3>
        <ol style={styles.instructionsList}>
          <li>1. Sign up for a Tavus account and create a replica</li>
          <li>2. Get your conversation URL from the Tavus dashboard (this should be a Daily.co room URL)</li>
          <li>3. Enter your conversation URL and ID in the configuration section above</li>
          <li>4. Click "Connect" to establish the connection</li>
          <li>5. Start typing messages to interact with your replica</li>
          <li>6. Use the Interaction Protocol Controls to test advanced features</li>
        </ol>
        
        <div style={{marginTop: '20px'}}>
          <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#1e40af', marginBottom: '8px'}}>
            Interaction Protocol Features:
          </h4>
          <ul style={{...styles.instructionsList, paddingLeft: '20px'}}>
            <li><strong>Echo:</strong> Make the replica say exactly what you type</li>
            <li><strong>Respond:</strong> Send text that the replica will respond to (as if user said it)</li>
            <li><strong>Interrupt:</strong> Stop the replica from talking immediately</li>
            <li><strong>Context:</strong> Change the conversational context the replica uses</li>
            <li><strong>Sensitivity:</strong> Adjust Voice Activity Detection for pauses and interruptions</li>
          </ul>
        </div>
        
        <div style={{marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b'}}>
          <p style={{margin: '0', fontSize: '0.875rem', color: '#92400e'}}>
            <strong>Note:</strong> The video feed will only appear when you successfully connect to a valid Tavus conversation URL. 
            The Interaction Protocol Controls will appear once connected and allow you to test all the available interaction types.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TavusPOC;

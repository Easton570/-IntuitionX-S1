import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from './components/VideoPlayer';
import SegmentList from './components/SegmentList';
import ChatInterface from './components/ChatInterface';
import { SCENARIOS } from './constants';
import { AnalysisResult, ChatMessage, VideoScenario, VideoType } from './types';
import { analyzeVideoStructure, analyzeCustomVideo, extractFramesFromVideo, sendChatToVideoAI } from './services/geminiService';

const App: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<VideoScenario>(SCENARIOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Custom Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  
  // AI State
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  
  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Reset state when scenario changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setAnalysis(null);
    setChatHistory([]);
  }, [activeScenario]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisStatus("Initializing AI...");
    try {
      if (activeScenario.isCustom && activeScenario.file) {
        // 1. Custom Video Path (Local File) - Full Multimodal
        setAnalysisStatus("Extracting keyframes from video...");
        const frames = await extractFramesFromVideo(activeScenario.file, 8); // Extract 8 frames
        
        setAnalysisStatus("Analyzing visual structure...");
        const result = await analyzeCustomVideo(
          activeScenario.title,
          frames,
          activeScenario.duration,
          activeScenario.type
        );
        setAnalysis(result);

      } else {
        // 2. Preset Scenario OR Remote URL Path - Text/Metadata Simulation
        // Note: We cannot easily extract frames from a remote URL in browser due to CORS,
        // so we fallback to structuring it based on the Title/Type/Duration.
        setAnalysisStatus("Analyzing video structure...");
        const result = await analyzeVideoStructure(
          activeScenario.title,
          activeScenario.type,
          activeScenario.duration
        );
        setAnalysis(result);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze video. Please check API Key or try a smaller file.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus("");
    }
  };

  const handleSendMessage = async (text: string) => {
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    
    setChatHistory(prev => [...prev, newUserMsg]);
    setIsChatTyping(true);

    const videoContext = {
      title: activeScenario.title,
      type: activeScenario.type,
      currentTimestamp: currentTime,
      analysis: analysis
    };

    const aiResponseText = await sendChatToVideoAI(chatHistory, text, videoContext);

    const newAiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: aiResponseText,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, newAiMsg]);
    setIsChatTyping(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      // Get video duration to set it correctly
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        const customScenario: VideoScenario = {
          id: `custom-file-${Date.now()}`,
          title: file.name,
          type: VideoType.KNOWLEDGE_SHARE, // Default type
          description: "Custom uploaded video",
          duration: video.duration,
          thumbnailUrl: "",
          videoUrl: url,
          file: file,
          isCustom: true
        };
        setActiveScenario(customScenario);
        video.remove();
      };
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!urlInputValue) return;
      
      // Basic Validation
      // Create a temporary video element to get duration
      const video = document.createElement('video');
      video.src = urlInputValue;
      video.crossOrigin = "anonymous";
      
      // We'll proceed optimistically, but try to fetch metadata
      const customScenario: VideoScenario = {
          id: `custom-url-${Date.now()}`,
          title: "External Video", // User can't easily rename yet, could add another input
          type: VideoType.KNOWLEDGE_SHARE,
          description: `Linked from: ${urlInputValue}`,
          duration: 300, // Default fallback if metadata fails
          thumbnailUrl: "",
          videoUrl: urlInputValue,
          isCustom: true
      };

      video.onloadedmetadata = () => {
          customScenario.duration = video.duration;
          setActiveScenario({...customScenario}); // Force update with correct duration
      };
      
      video.onerror = () => {
          alert("Could not load video metadata. The URL might be invalid or protected.");
          // Still set it, allowing the player to try its best
          setActiveScenario(customScenario); 
      };

      // Set immediately with default duration, update later if metadata loads
      setActiveScenario(customScenario);
      setShowUrlInput(false);
      setUrlInputValue("");
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FB] font-sans text-gray-900">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="video/*" 
        className="hidden" 
        onChange={handleFileUpload}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50">
         <span className="font-bold text-gray-900 flex items-center gap-2">
           <span className="w-6 h-6 bg-black rounded-md flex items-center justify-center text-white text-xs">C</span>
           CineMind
         </span>
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-medium"
         >
           + Upload
         </button>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden pt-16 lg:pt-0">
        
        {/* LEFT COLUMN: Main Content (Video + Structure) */}
        <div className="flex-[3] flex flex-col overflow-y-auto p-4 lg:p-6 lg:pr-3 scrollbar-hide">
          <div className="w-full max-w-5xl mx-auto space-y-6">
            
            {/* Header (Desktop) */}
            <div className="hidden lg:flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                   CM
                 </div>
                 <h1 className="text-xl font-bold tracking-tight text-gray-900">CineMind AI</h1>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {SCENARIOS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setActiveScenario(s)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeScenario.id === s.id && !activeScenario.isCustom ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {s.title.split(' ')[0]}...
                      </button>
                    ))}
                 </div>
                 <div className="h-6 w-px bg-gray-200 mx-1"></div>
                 
                 {/* URL Input Toggle */}
                 <div className="relative">
                    {showUrlInput && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-fade-in-up">
                            <form onSubmit={handleUrlSubmit} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={urlInputValue}
                                    onChange={(e) => setUrlInputValue(e.target.value)}
                                    placeholder="https://example.com/video.mp4" 
                                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
                                    autoFocus
                                />
                                <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">
                                    Load
                                </button>
                            </form>
                        </div>
                    )}
                     <button 
                       onClick={() => setShowUrlInput(!showUrlInput)}
                       className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition border ${showUrlInput ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}`}
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                       </svg>
                       Link
                     </button>
                 </div>

                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition shadow-md shadow-gray-200"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                   </svg>
                   Upload
                 </button>
              </div>
            </div>

            {/* Video Player Card */}
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
              <VideoPlayer 
                scenario={activeScenario}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onSeek={(t) => setCurrentTime(t)}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onTimeUpdate={(t) => setCurrentTime(t)}
              />
            </div>

            {/* Video Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 truncate max-w-lg">{activeScenario.title}</h2>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide rounded-md">
                    {activeScenario.type.replace('_', ' ')}
                  </span>
                  {activeScenario.isCustom && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wide rounded-md">
                      {activeScenario.file ? "Uploaded File" : "Linked URL"}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-2 text-sm max-w-xl">{activeScenario.description}</p>
              </div>
              
              {!analysis && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="shrink-0 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-gray-200 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {analysisStatus || "Analyzing..."}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10 2a.75.75 0 01.75.75v5.59l2.68-2.68a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 011.06-1.06l2.68 2.68V2.75A.75.75 0 0110 2z" />
                      </svg>
                      Generate Structure
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Analysis Results (Segments) */}
            <div className="animate-fade-in pb-10">
              {analysis && (
                 <SegmentList 
                   segments={analysis.segments} 
                   videoType={activeScenario.type}
                   onSegmentClick={(time) => setCurrentTime(time)}
                   currentTimestamp={currentTime}
                 />
              )}
            </div>
            
          </div>
        </div>

        {/* RIGHT COLUMN: AI Sidebar */}
        <div className="flex-[1.2] lg:max-w-[450px] bg-white border-l border-gray-100 flex flex-col h-full shadow-sm z-10">
          <ChatInterface 
            messages={chatHistory} 
            onSendMessage={handleSendMessage}
            isTyping={isChatTyping}
            videoTime={currentTime}
          />
        </div>

      </main>
    </div>
  );
};

export default App;
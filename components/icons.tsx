import React from 'react';
import {
    Send,
    Paperclip,
    Mic,
    StopCircle,
    LoaderCircle,
    HelpCircle,
    Blocks,
    Construction,
    Lightbulb,
    Target,
    CheckCircle2,
    Volume2,
    PauseCircle,
    Copy,
    Check
} from 'lucide-react';


export const Logo = () => (
    <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
            <div className="w-4 h-8 bg-red-500 rounded-sm"></div>
            <div className="w-4 h-8 bg-yellow-400 rounded-sm"></div>
        </div>
        <div className="flex space-x-1">
            <div className="w-4 h-8 bg-blue-500 rounded-sm"></div>
            <div className="w-4 h-8 bg-green-500 rounded-sm"></div>
        </div>
    </div>
);


export const SendIcon = ({ className }: { className?: string }) => (
  <Send className={`w-5 h-5 ${className || ''}`} />
);

export const PaperclipIcon = ({ className }: { className?: string }) => (
  <Paperclip className={`w-6 h-6 ${className || ''}`} />
);

export const MicrophoneIcon = ({ className }: { className?: string }) => (
    <Mic className={`w-6 h-6 ${className || ''}`} />
);

export const StopCircleIcon = ({ className }: { className?: string }) => (
    <StopCircle className={`w-6 h-6 ${className || ''}`} />
);

export const LoadingSpinner = () => (
    <LoaderCircle className="h-6 w-6 animate-spin" />
);

// Phase Icons
export const IdentificationIcon = ({ className }: { className?: string }) => (
    <HelpCircle className={className} />
);
export const ProtocolIcon = ({ className }: { className?: string }) => (
    <Blocks className={className} />
);
export const ImplementationIcon = ({ className }: { className?: string }) => (
    <Construction className={className} />
);
export const InsightIcon = ({ className }: { className?: string }) => (
    <Lightbulb className={className} />
);
export const StrategyIcon = ({ className }: { className?: string }) => (
    <Target className={className} />
);
export const EvaluationIcon = ({ className }: { className?: string }) => (
    <CheckCircle2 className={className} />
);

// Feature Icons
export const Volume2Icon = ({ className }: { className?: string }) => (
    <Volume2 className={className} />
);
export const PauseCircleIcon = ({ className }: { className?: string }) => (
    <PauseCircle className={className} />
);
export const CopyIcon = ({ className }: { className?: string }) => (
    <Copy className={className} />
);
export const CheckIcon = ({ className }: { className?: string }) => (
    <Check className={className} />
);
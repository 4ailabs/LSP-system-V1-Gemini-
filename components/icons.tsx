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
    Check,
    Trash2,
    Edit3,
    PlusCircle,
    Save,
    X,
    ImageIcon,
    MessageSquareQuote,
    ChevronDown
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
export const StarIcon = ({ className }: { className?: string }) => (
    <Lightbulb className={className} />
);
export const TrashIcon = ({ className }: { className?: string }) => (
    <Trash2 className={className} />
);
export const EditIcon = ({ className }: { className?: string }) => (
    <Edit3 className={className} />
);
export const PlusIcon = ({ className }: { className?: string }) => (
    <PlusCircle className={className} />
);
export const SaveIcon = ({ className }: { className?: string }) => (
    <Save className={className} />
);
export const CancelIcon = ({ className }: { className?: string }) => (
    <X className={className} />
);
export const GalleryIcon = ({ className }: { className?: string }) => (
    <ImageIcon className={className} />
);
export const InsightsIcon = ({ className }: { className?: string }) => (
    <MessageSquareQuote className={className} />
);
export const ChevronDownIcon = ({ className }: { className?: string }) => (
    <ChevronDown className={className} />
);

// AI Icon - Brick de LEGO
export const BrickIcon = ({ className }: { className?: string }) => (
    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-sm bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ${className || ''}`}>
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-200 rounded-sm opacity-80"></div>
    </div>
);

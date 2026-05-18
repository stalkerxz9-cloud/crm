import { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDuration } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export function ActiveCallBar() {
  const { activeCallId, calls, updateCall, setActiveCall, sidebarCollapsed } = useStore();
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const activeCall = calls.find((c) => c.id === activeCallId);

  useEffect(() => {
    if (!activeCall) {
      setElapsed(0);
      return;
    }
    const start = new Date(activeCall.startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall]);

  if (!activeCall || activeCall.status !== 'active') return null;

  const contact = activeCall.contact;
  const isIncoming = activeCall.type === 'incoming';

  const handleEnd = () => {
    const duration = elapsed;
    updateCall(activeCall.id, {
      status: 'completed',
      duration,
      endedAt: new Date().toISOString(),
      recordingStatus: 'downloaded',
      recordingUrl: `https://mock-storage.crmpro.ru/recordings/${activeCall.id}.mp3`,
    });
    setActiveCall(null);
    setElapsed(0);
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 right-0 z-40 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      <div className="bg-slate-900 border-t border-slate-700 px-6 py-3 flex items-center justify-between">
        {/* Call info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-semibold">
              {isIncoming ? 'Входящий звонок' : 'Исходящий звонок'}
            </span>
          </div>
          <div className="text-white">
            <span className="font-semibold">
              {contact ? `${contact.firstName} ${contact.lastName}` : activeCall.phoneNumber}
            </span>
            {contact && (
              <span className="text-slate-400 text-sm ml-2">{activeCall.phoneNumber}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono text-white">{formatDuration(elapsed)}</span>
          </div>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            {activeCall.providerName}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMuted(!muted)}
            className={cn(
              'p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5',
              muted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
          >
            {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="text-xs">{muted ? 'Без звука' : 'Микрофон'}</span>
          </button>

          <button
            onClick={() => setSpeakerOff(!speakerOff)}
            className={cn(
              'p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5',
              speakerOff
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
          >
            {speakerOff ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span className="text-xs">{speakerOff ? 'Динамик выкл' : 'Динамик'}</span>
          </button>

          <button
            onClick={handleEnd}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <PhoneOff className="h-4 w-4" />
            Завершить
          </button>
        </div>
      </div>
    </div>
  );
}

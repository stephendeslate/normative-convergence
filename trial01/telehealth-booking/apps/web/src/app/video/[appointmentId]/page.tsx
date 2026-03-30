'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@medconnect/ui';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface VideoRoom {
  appointmentId: string;
  roomName: string;
  status: string;
  participants: string[];
}

export default function VideoPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [inWaitingRoom, setInWaitingRoom] = useState(true);

  const { data: room } = useQuery<VideoRoom>({
    queryKey: ['video-room', appointmentId],
    queryFn: () => api.get(`/video/${appointmentId}`),
  });

  useEffect(() => {
    const socket = getSocket();
    socket.emit('join-video-room', { appointmentId });

    socket.on('video-room-ready', () => {
      setInWaitingRoom(false);
    });

    return () => {
      socket.emit('leave-video-room', { appointmentId });
      socket.off('video-room-ready');
    };
  }, [appointmentId]);

  const handleEndCall = () => {
    const socket = getSocket();
    socket.emit('leave-video-room', { appointmentId });
    router.push('/appointments');
  };

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <div className="relative flex flex-1 items-center justify-center">
        {inWaitingRoom ? (
          <div className="text-center">
            <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl text-primary">...</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Waiting Room</h2>
            <p className="mt-2 text-sm text-gray-400">
              Please wait while the provider joins the call.
            </p>
            {room && (
              <p className="mt-1 text-xs text-gray-500">Room: {room.roomName}</p>
            )}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-lg border-2 border-dashed border-gray-700 p-12 text-center">
              <p className="text-lg font-medium text-gray-400">Twilio Video Integration Point</p>
              <p className="mt-2 text-sm text-gray-500">
                Video streams will render here when Twilio SDK is connected.
              </p>
            </div>
          </div>
        )}

        {chatOpen && (
          <div className="absolute right-0 top-0 flex h-full w-80 flex-col border-l border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 p-3">
              <h3 className="text-sm font-medium text-white">Chat</h3>
              <button type="button" onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white">
                X
              </button>
            </div>
            <div className="flex-1 p-3">
              <p className="text-xs text-gray-500">No messages yet.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-gray-800 bg-gray-900 p-4">
        <Button
          variant={isMuted ? 'destructive' : 'outline'}
          size="icon"
          onClick={() => setIsMuted((m) => !m)}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="text-white border-gray-600"
        >
          {isMuted ? 'M' : '\uD83C\uDFA4'}
        </Button>
        <Button
          variant={isCameraOff ? 'destructive' : 'outline'}
          size="icon"
          onClick={() => setIsCameraOff((c) => !c)}
          aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
          className="text-white border-gray-600"
        >
          {isCameraOff ? 'X' : '\uD83C\uDFA5'}
        </Button>
        <Button variant="destructive" onClick={handleEndCall}>
          End Call
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setChatOpen((o) => !o)}
          aria-label="Toggle chat"
          className="text-white border-gray-600"
        >
          \uD83D\uDCAC
        </Button>
      </div>
    </div>
  );
}

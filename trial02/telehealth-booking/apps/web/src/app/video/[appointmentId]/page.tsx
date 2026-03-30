'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function VideoRoomPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initRoom() {
      try {
        const videoRoom = await api.post<any>(`/video/${appointmentId}/room`);
        setRoom(videoRoom);
        await api.post(`/video/${appointmentId}/join`);
      } catch (err: any) {
        console.error('Failed to join video room:', err);
      } finally {
        setLoading(false);
      }
    }
    initRoom();
  }, [appointmentId]);

  const handleEnd = async () => {
    try {
      await api.post(`/video/${appointmentId}/end`);
      router.push(`/appointments/${appointmentId}`);
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Connecting to video room...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-64 h-48 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <p className="text-gray-400">Video Feed</p>
          </div>
          <p className="text-sm text-gray-400">Room: {room?.roomName}</p>
          <p className="text-sm text-gray-400">Status: {room?.status}</p>
        </div>
      </div>
      <div className="p-4 flex justify-center gap-4">
        <button
          onClick={handleEnd}
          className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700"
        >
          End Call
        </button>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import POCLayout from '../../components/POCLayout'

const VideoGrid = styled.div.attrs({
  className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'
})``

const VideoContainer = styled.div.attrs({
  className: 'relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg'
})``

const Video = styled.video.attrs({
  className: 'w-full h-full object-cover'
})``

const Label = styled.div.attrs({
  className: 'absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded'
})``

const Controls = styled.div.attrs({
  className: 'flex flex-wrap gap-4 justify-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm'
})``

const Button = styled.button.attrs<{ $variant?: 'primary' | 'secondary' | 'danger' }>((props) => ({
  className: `px-6 py-2 rounded-lg font-bold transition-all shadow-md disabled:opacity-50 ${
    props.$variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
    props.$variant === 'secondary' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' :
    'bg-blue-600 text-white hover:bg-blue-700'
  }`
}))<{ $variant?: 'primary' | 'secondary' | 'danger' }>``

export default function WebRTCPOC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [status, setStatus] = useState('Idle')
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pc1 = useRef<RTCPeerConnection | null>(null)
  const pc2 = useRef<RTCPeerConnection | null>(null)

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      setStatus('Local stream started')
    } catch (err) {
      console.error('Error accessing media devices:', err)
      setStatus('Error: Camera access denied')
    }
  }

  const call = async () => {
    if (!localStream) return
    setStatus('Connecting...')

    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    pc1.current = new RTCPeerConnection(configuration)
    pc2.current = new RTCPeerConnection(configuration)

    // Handle ICE candidates
    pc1.current.onicecandidate = (e) => {
      if (e.candidate && pc2.current) pc2.current.addIceCandidate(e.candidate)
    }
    pc2.current.onicecandidate = (e) => {
      if (e.candidate && pc1.current) pc1.current.addIceCandidate(e.candidate)
    }

    // Handle remote stream
    pc2.current.ontrack = (e) => {
      setRemoteStream(e.streams[0])
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]
    }

    // Add local tracks to pc1
    localStream.getTracks().forEach(track => pc1.current?.addTrack(track, localStream))

    try {
      // Create Offer
      const offer = await pc1.current.createOffer()
      await pc1.current.setLocalDescription(offer)
      await pc2.current.setRemoteDescription(offer)

      // Create Answer
      const answer = await pc2.current.createAnswer()
      await pc2.current.setLocalDescription(answer)
      await pc1.current.setRemoteDescription(answer)
      
      setStatus('Connected (Loopback)')
    } catch (err) {
      console.error('WebRTC negotiation failed:', err)
      setStatus('Negotiation failed')
    }
  }

  const stop = () => {
    localStream?.getTracks().forEach(track => track.stop())
    pc1.current?.close()
    pc2.current?.close()
    setLocalStream(null)
    setRemoteStream(null)
    setStatus('Idle')
  }

  useEffect(() => {
    return () => stop()
  }, [])

  return (
    <POCLayout 
      title="WebRTC Loopback" 
      subtitle="Peer-to-peer communication demo (using a local loopback)."
      badge="POC"
      badgeType="POC"
    >
      <div className="max-w-4xl mx-auto">
        <VideoGrid>
          <VideoContainer>
            <Video ref={localVideoRef} autoPlay playsInline muted />
            <Label>Local Stream (You)</Label>
          </VideoContainer>
          <VideoContainer>
            <Video ref={remoteVideoRef} autoPlay playsInline />
            <Label>Remote Stream (Loopback)</Label>
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm italic">
                Waiting for call...
              </div>
            )}
          </VideoContainer>
        </VideoGrid>

        <Controls>
          <div className="w-full text-center mb-4">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Status: {status}</span>
          </div>
          <Button onClick={startLocalStream} disabled={!!localStream}>
            1. Start Camera
          </Button>
          <Button onClick={call} disabled={!localStream || !!remoteStream}>
            2. Initiate Call
          </Button>
          <Button $variant="danger" onClick={stop} disabled={!localStream}>
            Reset
          </Button>
        </Controls>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600">
          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-2 uppercase tracking-tighter">What is this?</h4>
            <p>This demo creates two <code>RTCPeerConnection</code> objects locally and connects them to each other. It simulates a real P2P call over the network.</p>
          </div>
          <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-100">
            <h4 className="font-bold text-purple-900 mb-2 uppercase tracking-tighter">Signaling</h4>
            <p>In a real app, you would use the WebSocket server to exchange the Offer, Answer, and ICE Candidates between two different users.</p>
          </div>
        </div>
      </div>
    </POCLayout>
  )
}

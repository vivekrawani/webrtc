import { useEffect, useRef, useState } from "react";
import { CREATE_ANSWER, CREATE_OFFER, ICE_CANDIDATE, SENDER } from "../constansts";

function Sender() {
    const [socket, setSocket] = useState<null | WebSocket>(null)
    const [pc, setPc] = useState<null | RTCPeerConnection>(null);
    const videoRef = useRef<null | HTMLVideoElement>(null);
    useEffect(() => {
        const pc = new RTCPeerConnection();
        setPc(pc);
    }, [])
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");
        setSocket(ws);
        ws.onopen = ()=>{
            ws.send(JSON.stringify({ type : SENDER }));    
        }
      

    }, [])
    const startSendingVideo = async ()=>{
        if(!socket || !pc){
            return;
        }
        pc.onnegotiationneeded = async()=>{
            console.log("nego")
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({type : CREATE_OFFER, sdp : pc.localDescription}))
        }
        
        pc.onicecandidate = (event)=>{
            if(event.candidate){
                console.log(event.candidate)
                socket.send(JSON.stringify({type : ICE_CANDIDATE, candidate : event.candidate}))
            }
        }
        
        socket.onmessage = async (event)=>{
            const data = JSON.parse(event.data);
            console.log("cand", data.candidate)
            if(data.type === CREATE_ANSWER){
                await pc.setRemoteDescription(data.sdp);
            } else if(data.type === ICE_CANDIDATE){
                pc.addIceCandidate(data.candidate);
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia( { video : true, audio : false})
        if(videoRef.current){
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
        pc.addTrack(stream.getVideoTracks()[0])
    }
   
    return <div>
        <video ref={videoRef} className="border-2 border-green-500"></video>
        <button
            onClick={startSendingVideo}
        >Start call</button>
    </div>
}

export default Sender;
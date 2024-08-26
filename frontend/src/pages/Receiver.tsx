import { useEffect, useRef, useState } from "react";
import { CREATE_ANSWER, CREATE_OFFER, ICE_CANDIDATE, RECEIVER } from "../constansts";

function Receiver() {
    const [socket, setSocket] = useState<null | WebSocket>(null)
    const [pc, setPc] = useState<null | RTCPeerConnection>(null);
    const videoRef = useRef<null | HTMLVideoElement>(null)
    useEffect(() => {
        const pc = new RTCPeerConnection();
        setPc(pc);
    }, [])

    useEffect(()=>{
        const ws = new WebSocket("ws://localhost:8080");
        setSocket(ws)

        
    }, [])

    useEffect(() => {
       if(!socket){
        return;
       }
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: RECEIVER }));

        }

      

        socket.onmessage = async (event) => {
            if (!pc) {
                return;
            }
        
            const message = JSON.parse(event.data);
            if (message.type === CREATE_OFFER) {
                await pc.setRemoteDescription(message.sdp);
                const answer = await pc.createAnswer();
              
               
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({type : CREATE_ANSWER , sdp : answer}))
                pc.onicecandidate = (event)=>{
                    if(event.candidate){
                        // console.log(event.candidate)
                        socket.send(JSON.stringify({type : ICE_CANDIDATE, candidate : event.candidate}))
                    }
                }
            } else if (message.type === ICE_CANDIDATE) {
                pc.addIceCandidate(message.candidate);
            }

        }



    }, [socket, pc])


    useEffect(()=> {
        if(!pc){
            return;
        }

        // const video = document.createElement('video');
        // document.body.appendChild(video);


        // pc.ontrack = (event) => {
        //     video.srcObject = new MediaStream([event.track]);
        //     video.play();
        // }


        // pc.ontrack = (event)=>{
        //     // console.log(track
        //     console.log("vidoe ", event)
        //     if(videoRef.current){
        //         videoRef.current.srcObject = new MediaStream([event.track]);
        //         // videoRef.current.play();
        //     }


        // }
    }, [pc])

    function startVideoStream(pc : RTCPeerConnection | null){
        if(pc==null){
            return;
        }
        // const video = document.createElement('video');
        // document.body.appendChild(video);

        // const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            if(videoRef.current){
                videoRef.current.srcObject = new MediaStream([event.track]);
                videoRef.current.play();
                console.log("play")
            }
            // video.srcObject = new MediaStream([event.track]);
            // video.play();
        }
    }

    return <div>
      <button onClick={()=>{startVideoStream(pc)}}>pick</button>
      <video ref={videoRef} className="border-2 border-red-500"></video>
    </div>
}

export default Receiver;
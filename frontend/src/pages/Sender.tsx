import { useEffect, useRef, useState } from "react";
import { CREATE_ANSWER, CREATE_OFFER, ICE_CANDIDATE, SENDER } from "../constansts";
import useSockets from "../hooks/useSockets";

function Sender() {

    const videoRef = useRef<null | HTMLVideoElement>(null);
    const [stream, setStream] = useState<null | MediaStream>(null);
    const [isMute, setMute] = useState(true);
    const [isCameraOff, setIsCameraoff] = useState(true);

    const { ws, peer } = useSockets();
    useEffect(() => {
        if (ws == null) {
            return;
        }
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: SENDER }));
        }
    }, [])


    const startSendingVideo = async () => {
        if (ws == null || peer == null) {
            return;
        }
        peer.onnegotiationneeded = async () => {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: CREATE_OFFER, sdp: peer.localDescription }))
        }

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(event.candidate)
                ws.send(JSON.stringify({ type: ICE_CANDIDATE, candidate: event.candidate }))
            }
        }

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log("cand", data.candidate)
            if (data.type === CREATE_ANSWER) {
                await peer.setRemoteDescription(data.sdp);
            } else if (data.type === ICE_CANDIDATE) {
                peer.addIceCandidate(data.candidate);
            }
        }

        getCameraStreamAndSend(peer);

    }
    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setStream(stream);
            stream.getTracks().forEach((track) => {

                pc?.addTrack(track);
            });
        });
    }


    const endCall = () => {
        // peer?.close();
        if (!stream) {
            return;
        }

        stream.getTracks().forEach((track) => {
            track.stop();
        })
        setStream(null);


    }

    const muteMic = () => {
        if (stream) {
            if (isMute) {
                stream.getAudioTracks().forEach((track) => {
                    track.stop();
                })
            } else {
                navigator.mediaDevices.getUserMedia({ audio: true , video : !isCameraOff}).then((stream) => {
                    setStream(stream);
                    stream.getTracks().forEach((track) => {
                        peer?.addTrack(track);
                    });
                });
            }

            setMute(prev => !prev);
        }
    }

    const disableCamera = () => {
        if (stream) {
            if (isCameraOff) {
                stream.getVideoTracks().forEach((track) => {
                    track.stop();
                })
            }
            else {
                navigator.mediaDevices.getUserMedia({ video: true, audio : !isMute }).then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                    setStream(stream);
                    stream.getTracks().forEach((track) => {

                        peer?.addTrack(track);
                    });
                });
            }
            setIsCameraoff(prev => !prev)
        }

    }


    return <div>
        <video ref={videoRef} className="border-2 border-green-500" muted></video>
        <button
            onClick={startSendingVideo}
        >Start call</button>
        <button
            onClick={endCall}
        >End call</button>

        <button
            onClick={muteMic}
        >Mute call</button>

        <button
            onClick={disableCamera}
        >Disable Camera</button>

    </div>
}

export default Sender;
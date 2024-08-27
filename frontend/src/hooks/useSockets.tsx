import {useState, useEffect} from "react";
function useSockets(){
    const wsURL = "ws://localhost:8080"
    const[ws, setWs] = useState<null | WebSocket>(null);
    const [peer, setPeer] = useState<null | RTCPeerConnection>(null);

    useEffect(()=>{
        const wss = new WebSocket(wsURL); 
        setWs(wss);
        
    }, [])

    useEffect(()=>{
        const pc = new RTCPeerConnection();
        setPeer(pc);
        return ()=> {
            peer?.close();
            setPeer(null);
        }
    }, [])
    return {ws, peer};
}

export default useSockets;